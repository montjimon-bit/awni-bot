import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Square,
  Play,
} from "lucide-react";
import { CyberSoundFX, SpeechController } from "../utils/audioUtils";
import { BotState } from "./AwniCyberBot";

export interface Message {
  id: string;
  sender: "user" | "awni";
  text: string;
  timestamp: string;
}

interface ChatConsoleProps {
  onBotStateChange: (state: BotState) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const QUICK_PROMPTS = [
  "من أنتم؟ وما هي منصة مُنتجي؟",
  "كيف أستخرج بطاقة ريادة 2026 وترخيص منزلي؟",
  "أريد دراسة جدوى لمشروع لبان وظفار بالريال العماني",
  "ما هي شروط قروض بنك التنمية العماني بدون فوائد؟",
  "ما هي أبرز المنتجات الوطنية في سوقكم وشحن المحافظات؟",
];

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  onBotStateChange,
  isMuted,
  onToggleMute,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      sender: "awni",
      text: `يا هلا والله ومسهلا بك في منصة "مُنتجي"! 🇴🇲

أنا "عوني"، رفيقك ومستشارك الرقمي لمنصة "مُنتجي" الوطنية؛ المنظومة الشاملة لتمكين رواد الأعمال والمشاريع الوطنية والأسر المنتجة في سلطنة عُمان تماشياً مع رؤية عُمان 2040.

خدماتنا الأساسية الأربع بين يديك:
1️⃣ **سوق رقمي وطني**: لتسويق منتجاتنا العمانية الأصيلة (اللبان الحوجري، الحلوى السلطانية، العسل الجبلي، الفضيات وفخار بهلاء) مع شحن موثوق لكافة المحافظات الـ 11.
2️⃣ **مركز دراسات الجدوى**: لحساب رأس المال ونقطة التعادل بدقة بالريال العماني (OMR).
3️⃣ **توجيه بطاقة ريادة 2026 وقروض التنمية**: لتسهيل ترخيص المشاريع وقروض بنك التنمية بدون فوائد.
4️⃣ **برامج تدريبية واستشارات متخصصة**: لدعم انطلاقتك نحو النجاح.

شورك وهداية الله.. تحب نراجع ميزانية مشروعك الحين، أو تتصفح السوق الوطني؟`,
      timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle external prompts (e.g. from Calculator or Marketplace buttons)
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "ar-OM"; // Omani Arabic

      recognition.onstart = () => {
        setIsRecording(true);
        onBotStateChange("listening");
        CyberSoundFX.playListening();
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        onBotStateChange("idle");
      };

      recognition.onerror = () => {
        setIsRecording(false);
        onBotStateChange("idle");
      };

      recognitionRef.current = recognition;
    }
  }, [onBotStateChange]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      onBotStateChange("idle");
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // If already started
        }
      } else {
        alert("خاصية التعرف على الصوت غير مدعومة في هذا المتصفح. يمكنك الكتابة في المربع مباشرة.");
      }
    }
  };

  const handleSpeakText = (text: string) => {
    if (isMuted) return;
    setIsSpeakingNow(true);
    onBotStateChange("speaking");

    SpeechController.speak(
      text,
      () => {
        setIsSpeakingNow(true);
        onBotStateChange("speaking");
      },
      () => {
        setIsSpeakingNow(false);
        onBotStateChange("idle");
      }
    );
  };

  const handleStopSpeech = () => {
    SpeechController.stopAll();
    setIsSpeakingNow(false);
    onBotStateChange("idle");
    CyberSoundFX.playBlip();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    CyberSoundFX.playSend();
    SpeechController.stopAll();
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    onBotStateChange("thinking");

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      const reply = data.reply || "يا هلا بك، فالك طيب وحاضرين لأي استفسار!";

      const awniMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "awni",
        text: reply,
        timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, awniMsg]);
      CyberSoundFX.playResponse();

      // Speak reply if not muted
      if (!isMuted) {
        handleSpeakText(reply);
      } else {
        onBotStateChange("idle");
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "awni",
        text: "يا هلا والله! شورك وهداية الله، منصة مُنتجي وعوني هنا لخدمتك ودعم مشروعك بالريال العماني. تحب نراجع حسابات دراسة الجدوى مع بعض الحين؟",
        timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      onBotStateChange("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    CyberSoundFX.playBlip();
    SpeechController.stopAll();
    setIsSpeakingNow(false);
    onBotStateChange("idle");
    setMessages([
      {
        id: "initial-welcome-reset",
        sender: "awni",
        text: "يا هلا بك من جديد! عوني في خدمتك دائماً لمشاريع سلطنة عُمان. موه الفكرة أو الاستفسار اللي في خاطرك؟",
        timestamp: new Date().toLocaleTimeString("ar-OM", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[580px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Chat Top Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>عوني | الاستشارة الفورية</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-normal">
                منصة مُنتجي 🇴🇲
              </span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {isSpeakingNow ? "يتحدث الآن..." : isRecording ? "يستمع لصوتك..." : "جاهز للرد الصوتي والكتابي"}
            </span>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-1.5">
          {isSpeakingNow && (
            <button
              onClick={handleStopSpeech}
              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 text-xs flex items-center gap-1 transition-colors"
              title="إيقاف الصوت"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px]">إيقاف</span>
            </button>
          )}

          <button
            onClick={() => {
              CyberSoundFX.playBlip();
              if (!isMuted && isSpeakingNow) {
                SpeechController.stopAll();
                setIsSpeakingNow(false);
                onBotStateChange("idle");
              }
              onToggleMute();
            }}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? "bg-slate-800 text-slate-400 border-slate-700"
                : "bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            }`}
            title={isMuted ? "تشغيل الصوت التلقائي" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
            title="بدء محادثة جديدة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs mt-1 ${
                m.sender === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-950/40"
                  : "bg-slate-950/90 text-slate-200 rounded-tl-none border border-slate-800 shadow-lg"
              }`}
            >
              <div className="whitespace-pre-line break-words space-y-1">{m.text}</div>

              <div
                className={`mt-2 pt-1 flex items-center justify-between text-[10px] ${
                  m.sender === "user" ? "text-emerald-200/70" : "text-slate-500"
                }`}
              >
                <span>{m.timestamp}</span>
                {m.sender === "awni" && (
                  <button
                    onClick={() => handleSpeakText(m.text)}
                    className="p-1 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    title="قراءة الرسالة بصوت عوني"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>استمع</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>عوني يصيغ الاستشارة الاقتصادية...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
        <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          مقترحات سريعة:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-[11px] transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form with Audio Microphone */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            isRecording
              ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_15px_#f43f5e]"
              : "bg-slate-900 text-slate-300 border-slate-700/80 hover:text-emerald-400 hover:border-emerald-500/40"
          }`}
          title={isRecording ? "إيقاف الاستماع" : "التحدث بصوتك مباشرة لعوني"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "تفضل، عوني يستمع إليك..." : "اكتب سؤالك أو استشارتك لعوني..."}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all cursor-pointer shrink-0 shadow-md"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
