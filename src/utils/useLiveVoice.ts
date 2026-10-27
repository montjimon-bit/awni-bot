import { useState, useEffect, useRef, useCallback } from "react";

// تحويل Float32 إلى 16-bit PCM Base64
function float32ToPcmBase64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(i * 2, val, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// تحويل Base64 24kHz PCM إلى AudioBuffer
function base64PcmToAudioBuffer(
  base64: string,
  audioCtx: AudioContext
): AudioBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 32768 : 32767);
  }

  const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
  audioBuffer.copyToChannel(float32, 0);
  return audioBuffer;
}

export interface UseLiveVoiceOptions {
  onTextReceived?: (text: string) => void;
  onInterrupted?: () => void;
  onTurnComplete?: () => void;
  onError?: (err: string) => void;
}

export function useLiveVoice(options: UseLiveVoiceOptions = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState<boolean>(false);
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [speechVolume, setSpeechVolume] = useState<number>(0);
  const [speechBands, setSpeechBands] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const speakingTimerRef = useRef<any>(null);
  const animLoopRef = useRef<number | null>(null);
  
  // مرجع لتتبع ما إذا كان عوني يتكلم حالياً لمنع الميكروفون من مقاطعة نفسه
  const isSpeakingRef = useRef<boolean>(false);

  const stopAllPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    isSpeakingRef.current = false;
    setIsBotSpeaking(false);
    setSpeechVolume(0);
    setSpeechBands([0, 0, 0, 0, 0, 0, 0]);
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (animLoopRef.current) {
      cancelAnimationFrame(animLoopRef.current);
      animLoopRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    stopAllPlayback();

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    outputAnalyserRef.current = null;

    setIsConnected(false);
    setIsConnecting(false);
    setLiveVolume(0);
    setSpeechVolume(0);
    setSpeechBands([0, 0, 0, 0, 0, 0, 0]);
  }, [stopAllPlayback]);

  const connect = useCallback(async () => {
    disconnect();
    setIsConnecting(true);
    setErrorMsg(null);

    try {
      // 1. طلب الميكروفون مع تفعيل عزل الصدى المتقدم الخاص بسماعات وميكروفون الشاشة/اللابتوب
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. إعداد معالج الصوت المدخل
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      await inputCtx.resume();

      // 3. إعداد معالج الصوت المخرج
      const outputCtx = new AudioCtxClass({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      await outputCtx.resume();
      nextPlayTimeRef.current = outputCtx.currentTime;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 64;
      outputAnalyser.smoothingTimeConstant = 0.5;
      outputAnalyser.connect(outputCtx.destination);
      outputAnalyserRef.current = outputAnalyser;

      const freqData = new Uint8Array(outputAnalyser.frequencyBinCount);
      const monitorOutputAudio = () => {
        if (!outputAnalyserRef.current) return;
        outputAnalyserRef.current.getByteFrequencyData(freqData);

        let sum = 0;
        const bands = [0, 0, 0, 0, 0, 0, 0];
        const step = Math.max(1, Math.floor(freqData.length / 7));

        for (let i = 0; i < 7; i++) {
          let bandSum = 0;
          for (let j = 0; j < step; j++) {
            const idx = i * step + j;
            if (idx < freqData.length) {
              bandSum += freqData[idx];
              sum += freqData[idx];
            }
          }
          bands[i] = Math.min(1, (bandSum / step) / 180);
        }

        const vol = Math.min(1, (sum / freqData.length) / 160);
        setSpeechVolume(vol);
        setSpeechBands(bands);

        animLoopRef.current = requestAnimationFrame(monitorOutputAudio);
      };
      animLoopRef.current = requestAnimationFrame(monitorOutputAudio);

      // 4. فتح اتصال الـ WebSocket
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;

          // حماية جوهرية: أثناء كلام عوني، نخفض حساسية الإرسال لمنع صوته من مقاطعة نفسه!
          if (isSpeakingRef.current) return;

          const channelData = e.inputBuffer.getChannelData(0);

          let sumSquares = 0;
          for (let i = 0; i < channelData.length; i++) {
            sumSquares += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sumSquares / channelData.length);
          setLiveVolume(Math.min(1, rms * 5));

          const base64Audio = float32ToPcmBase64(channelData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            console.error("Live API Error:", msg.error);
            setErrorMsg(msg.error);
            options.onError?.(msg.error);
          }

          // تم تعطيل المقاطعة العشوائية لمنع عوني من السكوت في منتصف الجملة
          if (msg.interrupted && !isSpeakingRef.current) {
            stopAllPlayback();
            options.onInterrupted?.();
          }

          if (msg.text) {
            options.onTextReceived?.(msg.text);
          }

          if (msg.turnComplete) {
            options.onTurnComplete?.();
          }

          // تشغيل وتتابع حزم الصوت بسلاسة بدون فجوات
          if (msg.audio && outputAudioCtxRef.current && outputAnalyserRef.current) {
            const ctx = outputAudioCtxRef.current;
            const analyser = outputAnalyserRef.current;
            const audioBuffer = base64PcmToAudioBuffer(msg.audio, ctx);
            const sourceNode = ctx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(analyser);

            const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
            sourceNode.start(startTime);
            nextPlayTimeRef.current = startTime + audioBuffer.duration;

            activeSourcesRef.current.push(sourceNode);
            isSpeakingRef.current = true;
            setIsBotSpeaking(true);

            sourceNode.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== sourceNode);
              if (activeSourcesRef.current.length === 0) {
                clearTimeout(speakingTimerRef.current);
                // زيادة مهلة الانتظار لضمان عدم قطع الصوت في الفواصل القصيرة بين الكلمات
                speakingTimerRef.current = setTimeout(() => {
                  if (activeSourcesRef.current.length === 0) {
                    isSpeakingRef.current = false;
                    setIsBotSpeaking(false);
                    setSpeechVolume(0);
                    setSpeechBands([0, 0, 0, 0, 0, 0, 0]);
                  }
                }, 350);
              }
            };
          }
        } catch (err) {
          console.error("Failed to parse Live message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("Live WebSocket error:", err);
        setIsConnected(false);
        setIsConnecting(false);
        setErrorMsg("تعذر الاتصال بـ Live API.");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      console.error("Live setup error:", err);
      setIsConnected(false);
      setIsConnecting(false);
      setErrorMsg("يرجى السماح بالوصول إلى ميكروفون الجهاز");
      options.onError?.(err.message || "Microphone access error");
    }
  }, [disconnect, options, stopAllPlayback]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sendTextMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    isBotSpeaking,
    liveVolume,
    speechVolume,
    speechBands,
    errorMsg,
    connect,
    disconnect,
    sendTextMessage,
  };
}
