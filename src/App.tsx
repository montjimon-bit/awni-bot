import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Send, Maximize, RotateCcw, TrendingUp, Radio, PhoneCall, PhoneOff } from "lucide-react";
import { CyberBotFace, BotMood } from "./components/CyberBotFace";
import { CyberSoundFX, SpeechController } from "./utils/audioUtils";
import { EconomicDataDashboard, EconomicDataPayload } from "./components/EconomicDataDashboard";
import { useLiveVoice } from "./utils/useLiveVoice";

const DEFAULT_ECONOMIC_DATA: EconomicDataPayload = {
  projectName: "مشروع إنتاج اللبان الحوجري الفاخر (ظفار)",
  currency: "ر.ع.",
  totalCapitalOMR: 4500,
  breakEvenUnits: 90,
  breakEvenRevenueOMR: 1080,
  expectedProfitOMR: 620,
  capitalAllocation: [
    { name: "المعدات والتجهيز", amount: 1900 },
    { name: "المواد والتغليف", amount: 1300 },
    { name: "التسويق والهوية", amount: 800 },
    { name: "التراخيص والاحتياط", amount: 500 },
  ],
  budgetBreakdown: [
    { name: "تكاليف ثابتة", value: 35 },
    { name: "تكاليف متغيرة", value: 45 },
    { name: "هامش الربح", value: 20 },
  ],
};

function parseEconomicData(text: string): { cleanText: string; economicData: EconomicDataPayload | null } {
  const jsonMatch = text.match(/```json\s*(\{[\s\S]*?"economicData"[\s\S]*?\})\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.economicData) {
        const cleanText = text.replace(/```json[\s\S]*?```/, "").trim();
        return { cleanText, economicData: parsed.economicData };
      }
    } catch {
      // Ignore parse failure
    }
  }

  // Also match inline JSON without code blocks if present
  const inlineMatch = text.match(/\{[\s\S]*?"economicData"[\s\S]*?\}/);
  if (inlineMatch) {
    try {
      const parsed = JSON.parse(inlineMatch[0]);
      if (parsed.economicData) {
        const cleanText = text.replace(inlineMatch[0], "").trim();
        return { cleanText, economicData: parsed.economicData };
      }
    } catch {}
  }

  return { cleanText: text, economicData: null };
}

export default function App() {
  const [mood, setMood] = useState<BotMood>("idle");
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>("");

  // Subtitle states matching the video
  const [userSubtitle, setUserSubtitle] = useState<string>("");
  const [botSubtitle, setBotSubtitle] = useState<string>(
    "أهلاً وسهلاً بك في منصة 'مُنتجي' الوطنية في سلطنة عُمان 🇴🇲. أنا 'عوني'، مستشارك الرقمي المعتمد. كيف يمكنني مساندتك اليوم في دراسة مشروعك أو استعراض منتجاتنا الوطنية؟"
  );

  // Economic Data Dashboard state
  const [economicData, setEconomicData] = useState<EconomicDataPayload | null>(null);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Gemini 3.8 Live API Voice Hook
  const liveVoice = useLiveVoice({
    onTextReceived: (chunk) => {
      setBotSubtitle((prev) => {
        const full = prev + chunk;
        const { cleanText, economicData: parsed } = parseEconomicData(full);
        if (parsed) {
          setEconomicData(parsed);
          setShowDashboard(true);
        }
        return cleanText;
      });
    },
    onInterrupted: () => {
      setMood("listening");
      setUserSubtitle("أستمع إليك مباشرة... تفضل بالتحدث");
    },
    onTurnComplete: () => {
      setMood("idle");
    },
    onError: (err) => {
      console.warn("Live voice error:", err);
    },
  });

  // Sync Live API bot speaking and volume state to CyberBotFace
  useEffect(() => {
    if (liveVoice.isConnected) {
      if (liveVoice.isBotSpeaking) {
        setMood("speaking");
        setIsAudioPlaying(true);
      } else if (liveVoice.liveVolume > 0.08) {
        setMood("listening");
        setIsAudioPlaying(false);
      } else {
        setMood("idle");
        setIsAudioPlaying(false);
      }
    }
  }, [liveVoice.isConnected, liveVoice.isBotSpeaking, liveVoice.liveVolume]);

  const toggleLiveSession = () => {
    CyberSoundFX.playBlip();
    if (liveVoice.isConnected || liveVoice.isConnecting) {
      liveVoice.disconnect();
      setMood("idle");
      setIsAudioPlaying(false);
      setUserSubtitle("");
      setBotSubtitle("تم إنهاء الجلسة الصوتية المباشرة. يمكنك التحدث مجدداً أو كتابة استفسارك في أي وقت.");
    } else {
      SpeechController.stopAll();
      setUserSubtitle("جاري بدء الجلسة الصوتية المباشرة (Gemini 3.8 Live)...");
      setBotSubtitle("أهلاً بك في المحادثة المباشرة فائقة السرعة مع عوني عبر Live API! تحدث وسأجيبك فورياً.");
      liveVoice.connect();
    }
  };

  // When user finishes speaking (Streamed instantly with live typewriter response)
  const handleQuery = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    setUserSubtitle(clean);
    setBotSubtitle("");
    setIsStreaming(true);
    CyberSoundFX.playSend();
    SpeechController.stopAll();
    setIsAudioPlaying(false);
    setMood("thinking");

    // If query asks for feasibility or budget, prepare dashboard
    if (
      clean.includes("جدوى") ||
      clean.includes("رأس مال") ||
      clean.includes("ميزانية") ||
      clean.includes("تكاليف") ||
      clean.includes("تعادل") ||
      clean.includes("هيكل")
    ) {
      setShowDashboard(true);
    }

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean }),
      });

      if (!res.ok) throw new Error("Stream error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      if (reader) {
        setMood("speaking");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  fullText += parsed.chunk;
                  // Live clean display (hide code fence while typing)
                  const display = fullText.replace(/```json[\s\S]*?```/, "").trim();
                  setBotSubtitle(display || fullText);
                }
              } catch {
                // Ignore parse errors on raw tokens
              }
            }
          }
        }
      }

      setIsStreaming(false);

      if (fullText) {
        setMood("happy");

        // Parse economic data if included in response
        const { cleanText, economicData: parsedEconomic } = parseEconomicData(fullText);
        setBotSubtitle(cleanText);

        if (parsedEconomic) {
          setEconomicData(parsedEconomic);
          setShowDashboard(true);
        } else if (
          clean.includes("جدوى") ||
          clean.includes("رأس مال") ||
          clean.includes("ميزانية") ||
          clean.includes("تكاليف")
        ) {
          setEconomicData(DEFAULT_ECONOMIC_DATA);
          setShowDashboard(true);
        }

        // Bot speaks aloud clean Arabic text
        if (!isMuted) {
          setIsAudioPlaying(true);
          setMood("speaking");
          CyberSoundFX.playResponse();

          SpeechController.speak(
            cleanText,
            () => {
              setIsAudioPlaying(true);
              setMood("speaking");
            },
            () => {
              setIsAudioPlaying(false);
              setMood("idle");
            }
          );
        } else {
          setMood("idle");
        }
      }
    } catch (err) {
      console.error(err);
      setIsStreaming(false);
      const fallbackReply =
        "أهلاً وسهلاً بك في منصة 'مُنتجي' الوطنية. يسرني تقديم دراسة الجدوى وتوزيع رأس المال بالريال العُماني. هل تود استعراض الميزانية التقديرية الآن؟";
      setBotSubtitle(fallbackReply);
      setMood("idle");
    }
  };

  // Tap on the robot face to trigger friendly thinking -> happy particle burst
  const handleTapBot = () => {
    CyberSoundFX.playBlip();
    if (mood === "idle") {
      setMood("thinking");
      setTimeout(() => {
        setMood("happy");
        CyberSoundFX.playResponse();
        setTimeout(() => setMood("idle"), 2200);
      }, 350);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative w-screen min-h-screen bg-black overflow-y-auto overflow-x-hidden flex flex-col items-center justify-between p-4 sm:p-6 select-none text-white font-sans">
      {/* Subtle Top Utility Bar (Clean & minimalist, no website clutter) */}
      <div className="w-full max-w-6xl flex items-center justify-between z-20 opacity-80 hover:opacity-100 transition-opacity">
        {/* Brand identity pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300">عوني · منصة مُنتجي 🇴🇲</span>
          <span className="text-[10px] text-slate-400">رؤية عُمان 2040</span>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Economic Data Dashboard Toggle Button */}
          <button
            onClick={() => {
              CyberSoundFX.playBlip();
              if (!economicData) {
                setEconomicData(DEFAULT_ECONOMIC_DATA);
              }
              setShowDashboard(!showDashboard);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showDashboard
                ? "bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-slate-900/60 text-slate-300 border-slate-700/60 hover:text-emerald-300 hover:border-emerald-500/40"
            }`}
            title="عرض أو إخفاء لوحة المؤشرات الاقتصادية والرسوم البيانية (OMR)"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>لوحة المؤشرات (OMR)</span>
          </button>

          {/* Mute / Unmute */}
          <button
            onClick={() => {
              CyberSoundFX.playBlip();
              if (!isMuted && isAudioPlaying) {
                SpeechController.stopAll();
                setIsAudioPlaying(false);
                setMood("idle");
              }
              setIsMuted(!isMuted);
            }}
            className={`p-2 rounded-full border transition-all ${
              isMuted
                ? "bg-slate-900/80 text-slate-400 border-slate-700"
                : "bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            }`}
            title={isMuted ? "تشغيل صوت عوني" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Text Input Toggle */}
          <button
            onClick={() => setShowInput(!showInput)}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="كتابة سؤالك يدوياً"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="ملء الشاشة"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Central Cyber Bot Avatar (Exact Match of the video!) */}
      <div className="flex-1 flex items-center justify-center w-full z-10 my-2">
        <CyberBotFace
          mood={mood}
          isAudioPlaying={isAudioPlaying}
          onTap={handleTapBot}
        />
      </div>

      {/* Visual Economic Data Dashboard (Recharts: Capital Allocation Bar Chart & Budget Donut Chart) */}
      {showDashboard && economicData && (
        <div className="w-full max-w-4xl z-20 my-2 animate-fadeIn px-2">
          <EconomicDataDashboard
            data={economicData}
            onClose={() => setShowDashboard(false)}
          />
        </div>
      )}

      {/* Bottom Subtitle / Dialogue Window (Exact Match of the video's subtitle bar) */}
      <div className="w-full max-w-3xl z-20 flex flex-col items-center gap-3">
        {/* The Subtitle Glass Container */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(16,185,129,0.15)] rounded-2xl p-4 backdrop-blur-xl transition-all">
          {/* User's spoken transcript (Like the video's user text) */}
          {userSubtitle && (
            <div className="pb-2 mb-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">أنت:</span>
              <span className="text-slate-300 text-right flex-1 mr-2">{userSubtitle}</span>
            </div>
          )}

          {/* Bot's Spoken Response Subtitle (Like the video's bot response) */}
          <div className="text-xs sm:text-sm text-slate-100 text-center leading-relaxed font-medium min-h-[24px]">
            {botSubtitle}
            {isStreaming && (
              <span className="inline-block w-2 h-4 mr-1 bg-emerald-400 animate-pulse align-middle shadow-[0_0_8px_#34d399]" />
            )}
          </div>
        </div>

        {/* Central Live Conversation Action (المحادثة الحية المباشرة فقط) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
          {/* Live Conversation Primary State */}
          {!liveVoice.isConnected && !liveVoice.isConnecting && (
            <button
              onClick={toggleLiveSession}
              className="group relative px-8 py-3.5 rounded-full flex items-center gap-3 font-bold text-xs sm:text-sm transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-slate-950 active:scale-95 cursor-pointer"
              title="بدء المحادثة الحية المباشرة مع عوني"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              <span>بدء المحادثة الحية (Live ⚡)</span>
            </button>
          )}

          {liveVoice.isConnecting && (
            <div className="px-7 py-3 rounded-full flex items-center gap-3 bg-amber-600/90 text-white font-bold text-xs sm:text-sm animate-pulse shadow-[0_0_20px_#f59e0b]">
              <Radio className="w-4 h-4 animate-spin" />
              <span>جاري بدء المحادثة الحية...</span>
            </div>
          )}

          {liveVoice.isConnected && (
            <div className="flex items-center gap-3">
              {/* Active Live Status with Live Voice Wave Visualizer */}
              <div className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-slate-900/95 rounded-full border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs sm:text-sm text-cyan-200 font-bold">المحادثة الحية نشطة 🟢</span>
                {/* Visualizer bars */}
                <div className="flex items-center gap-1 mx-2">
                  <div
                    className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, liveVoice.liveVolume * 24)}px` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, liveVoice.liveVolume * 30)}px` }}
                  />
                  <div
                    className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, liveVoice.liveVolume * 20)}px` }}
                  />
                </div>
              </div>

              {/* End Live Session Button */}
              <button
                onClick={toggleLiveSession}
                className="px-4 py-2.5 rounded-full flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_#f43f5e] cursor-pointer"
                title="إنهاء المحادثة الحية"
              >
                <PhoneOff className="w-4 h-4" />
                <span>إنهاء المحادثة</span>
              </button>
            </div>
          )}

          {/* Re-play bot voice if needed */}
          <button
            onClick={() => {
              if (botSubtitle) {
                CyberSoundFX.playResponse();
                SpeechController.speak(
                  botSubtitle,
                  () => setMood("speaking"),
                  () => setMood("idle")
                );
              }
            }}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer"
            title="إعادة سماع رد عوني"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Manual Text Input Popup */}
        {showInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualText.trim()) {
                handleQuery(manualText);
                setManualText("");
                setShowInput(false);
              }
            }}
            className="w-full flex items-center gap-2 bg-slate-950/90 border border-emerald-500/40 rounded-xl p-2 animate-fadeIn"
          >
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="اكتب سؤالك لعوني هنا..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5 rotate-180" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
