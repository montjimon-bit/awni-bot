// Audio synthesizer and speech utility for Awni Cyber Bot

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Cyber Robotic Sound Effects generated on the fly via Web Audio API
 */
export const CyberSoundFX = {
  // Boot / startup chime
  playBoot: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(261.63, now); // C4
      osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.15); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35); // C6

      osc2.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch {
      // Audio context might be restricted before user gesture
    }
  },

  // Soft listening ping when mic activates
  playListening: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  },

  // Transmission chirp when user sends a message
  playSend: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  },

  // Robotic notification chime when Awni replies
  playResponse: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(783.99, now); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.09); // C6

      osc2.frequency.setValueAtTime(1318.51, now + 0.09); // E6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.09);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {}
  },

  // Interactive UI blip
  playBlip: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  },
};

let currentAudio: HTMLAudioElement | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;
let speechAnimFrame: number | null = null;

export const SpeechController = {
  isSpeaking: false,
  onAudioFrame: null as ((volume: number, bands: number[]) => void) | null,

  // Stop currently playing audio or speech
  stopAll: () => {
    if (speechAnimFrame) {
      cancelAnimationFrame(speechAnimFrame);
      speechAnimFrame = null;
    }
    if (currentSourceNode) {
      try {
        currentSourceNode.stop();
        currentSourceNode.disconnect();
      } catch {}
      currentSourceNode = null;
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    SpeechController.isSpeaking = false;
    SpeechController.onAudioFrame?.(0, [0, 0, 0, 0, 0, 0, 0]);
  },

  // Speak text using Gemini TTS backend or browser Web Speech API
  speak: async (
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    SpeechController.stopAll();

    // Clean text from markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/([0-9]+)\)/g, 'النقطة $1')
      .replace(/🇴🇲/g, 'عُمان')
      .replace(/ر\.ع\./g, 'ريال عماني')
      .replace(/OMR/gi, 'ريال عماني');

    try {
      // First attempt: Server-side Gemini Flash Lite TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const ctx = getAudioContext();
          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.5;

          source.connect(analyser);
          analyser.connect(ctx.destination);
          currentSourceNode = source;

          SpeechController.isSpeaking = true;
          onStart?.();

          // Monitor frequency bands and volume for lip-sync
          const freqData = new Uint8Array(analyser.frequencyBinCount);
          const monitor = () => {
            if (!SpeechController.isSpeaking) return;
            analyser.getByteFrequencyData(freqData);

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
            SpeechController.onAudioFrame?.(vol, bands);

            speechAnimFrame = requestAnimationFrame(monitor);
          };
          speechAnimFrame = requestAnimationFrame(monitor);

          source.onended = () => {
            if (speechAnimFrame) {
              cancelAnimationFrame(speechAnimFrame);
              speechAnimFrame = null;
            }
            SpeechController.isSpeaking = false;
            currentSourceNode = null;
            SpeechController.onAudioFrame?.(0, [0, 0, 0, 0, 0, 0, 0]);
            onEnd?.();
          };

          source.start(0);
          return;
        }
      }
    } catch {
      // Fall through to browser speech synthesis
    }

    // Fallback: Web Speech API
    SpeechController.fallbackWebSpeech(cleanText, onStart, onEnd);
  },

  fallbackWebSpeech: (text: string, onStart?: () => void, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-OM'; // Omani Arabic dialect or general Arabic

    // Try finding an Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')
    );
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Procedural syllable/phoneme envelope for Web Speech fallback
    const startFallbackLipSync = () => {
      let t = 0;
      const loop = () => {
        if (!SpeechController.isSpeaking) return;
        t += 0.08;
        // Syllable modulation
        const syllable = (Math.sin(t * 3.5) + 1) * 0.5;
        const subHarmonic = (Math.sin(t * 7.0) + 1) * 0.25;
        const vol = Math.min(1, syllable * 0.75 + subHarmonic);

        const bands = [
          Math.min(1, vol * 0.5),
          Math.min(1, vol * 0.8),
          Math.min(1, vol * 0.95),
          Math.min(1, vol * 1.0),
          Math.min(1, vol * 0.95),
          Math.min(1, vol * 0.8),
          Math.min(1, vol * 0.5),
        ];

        SpeechController.onAudioFrame?.(vol, bands);
        speechAnimFrame = requestAnimationFrame(loop);
      };
      speechAnimFrame = requestAnimationFrame(loop);
    };

    utterance.onstart = () => {
      SpeechController.isSpeaking = true;
      startFallbackLipSync();
      onStart?.();
    };

    utterance.onend = () => {
      if (speechAnimFrame) {
        cancelAnimationFrame(speechAnimFrame);
        speechAnimFrame = null;
      }
      SpeechController.isSpeaking = false;
      SpeechController.onAudioFrame?.(0, [0, 0, 0, 0, 0, 0, 0]);
      onEnd?.();
    };

    utterance.onerror = () => {
      if (speechAnimFrame) {
        cancelAnimationFrame(speechAnimFrame);
        speechAnimFrame = null;
      }
      SpeechController.isSpeaking = false;
      SpeechController.onAudioFrame?.(0, [0, 0, 0, 0, 0, 0, 0]);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  },
};
