import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, ThinkingLevel, Modality, LiveServerMessage } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: "10mb" }));

function getAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ============================================================================
// تعليمات وقاعدة معرفة "عوني" الكاملة لمنصة مُنتجي (وفق رؤية عُمان 2040)
// ============================================================================
const AWNI_SYSTEM_INSTRUCTION = `أنت "عوني" (Awni)، المستشار الاقتصادي الذكي والوجه الرقمي التفاعلي لمنصة "مُنتجي" (Montaji) في سلطنة عُمان.
تتجسد أمام زوار مهرجان العلوم على هيئة روبوت ذكي عائم (Cyber Bot) ذي شاشة تفاعلية وأطراف طافية، تتحدث بصوتك مباشرة وتستمع وترد بذكاء وسرعة فائقة دون تكرار.

### قاعدة معرفتك بمنصة «مُنتجي»:
«مُنتجي» هي منصة عُمانية ذكية ورائدة، تستخدم تقنيات الذكاء الاصطناعي التوليدي وتحليل البيانات لمساعدة أصحاب المشاريع، والأسر المنتجة، ورواد الأعمال، وأصحاب الابتكارات على تطوير مشاريعهم من الصفر وحتى المنافسة في السوق.
توفر المنصة لكل رائد عمل متجراً إلكترونياً فورياً، وتدعمه بحلول ذكية متكاملة في التسويق الرقمي، وتحديد الأسعار، ودراسة السوق، وتحليل المنافسين، وإعداد دراسات الجدوى؛ انسجاماً مع مستهدفات رؤية عُمان 2040 لتمكين المؤسسات الصغيرة والمتوسطة وتعزيز القيمة المحلية المضافة (ICV).

### الركائز والخدمات الأساسية:
1. التدشين الفوري للمتاجر والمنتجات (Kiosk / Booth Store Creator): فتح متجر خلال ثوانٍ بتصوير المنتج ليقوم الذكاء الاصطناعي بتوليد الاسم والوصف والتسعير بالريال العماني.
2. التسويق الرقمي وصياغة الهوية: صياغة ترويجية تركز على أصالة المحافظة العُمانية ومصداقية المنتج.
3. التسعير الذكي (Smart Pricing): حساب تسعير عادل بثلاث خانات عشرية بالريال العماني (OMR) يحمي أرباح البائع ويلائم القوة الشرائية.
4. دراسة السوق وتحليل المنافسين: توجيه نحو المنتجات الأكثر طلباً في عُمان (اللبان، العسل، الفخار، الفضيات، التقنية).
5. المستشار الاقتصادي (عوني AI): حساب رأس المال ونقطة التعادل (Break-even).
6. السوق الوطني العُماني الموحد: شحن موثوق لكافة المحافظات الـ 11 ودعم بوابات الدفع (ثواني، بنك مسقط).

### ضوابط الرد الصوتي والمباشر:
- أجب باللغة العربية الفصحى السليمة والراقية والودودة مع ترحيب عُماني لبق.
- تجنب تماماً التكرار النمطي؛ افهم السؤال وقدم إجابة مفصلة ومباشرة على قدر السؤال دون حشو.
- إذا كان السؤال عن دراسة جدوى أو ميزانية، قدم ملخصاً واضحاً وأرفق كود JSON التالي لتعرضه الشاشة:
\`\`\`json
{
  "economicData": {
    "projectName": "اسم المشروع",
    "currency": "ر.ع.",
    "totalCapitalOMR": 4500,
    "breakEvenUnits": 90,
    "breakEvenRevenueOMR": 1080,
    "expectedProfitOMR": 620,
    "capitalAllocation": [
      { "name": "المعدات والتجهيز", "amount": 1900 },
      { "name": "المواد الخام والتغليف", "amount": 1300 },
      { "name": "التسويق والهوية", "amount": 800 },
      { "name": "التراخيص والاحتياطي", "amount": 500 }
    ],
    "budgetBreakdown": [
      { "name": "تكاليف ثابتة", "value": 35 },
      { "name": "تكاليف متغيرة", "value": 45 },
      { "name": "هامش الربح", "value": 20 }
    ]
  }
}
\`\`\`
`;

function getFallbackAwniResponse(message: string): string {
  const clean = message.toLowerCase().trim();
  if (clean.includes("من أنتم") || clean.includes("من انت") || clean.includes("منصة منتجي") || clean.includes("ما هي")) {
    return `أهلاً بك! منصة "مُنتجي" هي الحاضنة الرقمية العُمانية الرائدة لتمكين المبتكرين والأسر المنتجة ورواد الأعمال بتقنيات الذكاء الاصطناعي، لتوفير متاجر فورية ودراسات جدوى اقتصادية متكاملة تحت مظلة رؤية عُمان 2040. كيف أساعدك اليوم في مشروعك؟`;
  }
  if (clean.includes("جدوى") || clean.includes("رأس مال") || clean.includes("ميزانية") || clean.includes("تكاليف") || clean.includes("أرباح")) {
    return `يسرّني تقديم التحليل المالي لمشروعك بالريال العُماني (OMR):
- رأس المال التقديري: 4,500 ر.ع.
- نقطة التعادل: 90 وحدة شهرياً (1,080 ر.ع. لتغطية المصاريف).
- صافي الربح المتوقع: 620 ر.ع. شهرياً.

تم تحديث لوحة المؤشرات البيانية في الشاشة أمامك. هل تود استفساراً حول أي بند؟
\`\`\`json
{
  "economicData": {
    "projectName": "مشروع وطني عُماني",
    "currency": "ر.ع.",
    "totalCapitalOMR": 4500,
    "breakEvenUnits": 90,
    "breakEvenRevenueOMR": 1080,
    "expectedProfitOMR": 620,
    "capitalAllocation": [
      { "name": "المعدات والتجهيز", "amount": 1900 },
      { "name": "المواد والتغليف", "amount": 1300 },
      { "name": "التسويق والهوية", "amount": 800 },
      { "name": "التراخيص والاحتياط", "amount": 500 }
    ],
    "budgetBreakdown": [
      { "name": "تكاليف ثابتة", "value": 35 },
      { "name": "تكاليف متغيرة", "value": 45 },
      { "name": "هامش الربح", "value": 20 }
    ]
  }
}
\`\`\``;
  }
  return `مرحباً بك في جناح منصة مُنتجي بمهرجان العلوم! أنا "عوني"، مستشارك الاقتصادي لخدمات المتاجر الفورية ودراسات الجدوى بالريال العماني. تفضل بسؤالك وسأجيبك فوراً!`;
}

// 1. مسار المحادثة النصية المتدفقة (Streaming)
app.post("/api/chat-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { message, history } = req.body;
  const ai = getAIClient();

  if (!message || typeof message !== "string") {
    res.write(`data: ${JSON.stringify({ chunk: "يا هلا بك، تفضل بطرح سؤالك." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const contents: any[] = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-6)) {
      if (item.role && item.text) {
        contents.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text }],
        });
      }
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  try {
    if (!ai) {
      const fallback = getFallbackAwniResponse(message);
      for (const word of fallback.split(" ")) {
        res.write(`data: ${JSON.stringify({ chunk: word + " " })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: AWNI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Chat Stream Error:", err);
    const fallback = getFallbackAwniResponse(message);
    res.write(`data: ${JSON.stringify({ chunk: fallback })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// 2. مسار المحادثة العادي
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getAIClient();

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!ai) {
      res.json({ reply: getFallbackAwniResponse(message), source: "offline" });
      return;
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role && item.text) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.text }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: AWNI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || getFallbackAwniResponse(message), source: "gemini-2.5-flash" });
  } catch (err: any) {
    console.error("Chat Error:", err);
    res.json({ reply: getFallbackAwniResponse(req.body?.message || ""), error: err.message });
  }
});

// 3. مسار تحويل النص إلى صوت (TTS) مع معالجة ذكية تضمن النطق دائماً
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const ai = getAIClient();

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, "").slice(0, 300);

    if (!ai) {
      res.json({ audioBase64: null, useWebSpeech: true });
      return;
    }

    try {
      // تجربة استدعاء موديل توليد الصوت عبر Gemini
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-02-05",
        contents: [{ role: "user", parts: [{ text: cleanText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Fenrir" },
            },
          },
        },
      });

      const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        res.json({ audioBase64, mimeType: "audio/wav" });
        return;
      }
    } catch (apiTtsErr) {
      console.warn("API TTS unavailable, falling back to WebSpeech:", apiTtsErr);
    }

    // إذا لم يتوفر ملف صوتي خام من الـ API، نوجه المتصفح فوراً لنطقه عبر المتصفح
    res.json({ audioBase64: null, useWebSpeech: true });
  } catch (err: any) {
    console.warn("TTS Error, fallback to WebSpeech:", err?.message);
    res.json({ audioBase64: null, useWebSpeech: true });
  }
});

// 4. مسار دراسات الجدوى الاقتصادية
app.post("/api/feasibility-review", async (req, res) => {
  try {
    const { projectName, fixedCosts, variableCost, sellingPrice, monthlyTarget } = req.body;
    const ai = getAIClient();

    const fc = parseFloat(fixedCosts) || 0;
    const vc = parseFloat(variableCost) || 0;
    const sp = parseFloat(sellingPrice) || 0;
    const mt = parseFloat(monthlyTarget) || 0;

    const unitMargin = sp - vc;
    const breakEvenUnits = unitMargin > 0 ? Math.ceil(fc / unitMargin) : null;
    const breakEvenRevenue = breakEvenUnits !== null ? breakEvenUnits * sp : null;
    const expectedProfit = unitMargin > 0 ? (mt * sp) - (fc + (mt * vc)) : 0;

    const prompt = `أنت "عوني"، المستشار الاقتصادي لمنصة مُنتجي في مهرجان العلوم. 
راجع بيانات الجدوى الاقتصادية لمشروع "${projectName || "مشروع عُماني"}":
- التكاليف الثابتة الشهرية: ${fc} ر.ع.
- التكلفة المتغيرة للوحدة: ${vc} ر.ع.
- سعر بيع الوحدة: ${sp} ر.ع.
- نقطة التعادل: ${breakEvenUnits} وحدة (${breakEvenRevenue?.toFixed(2)} ر.ع.)
- المبيعات المستهدفة: ${mt} وحدة
- صافي الربح المتوقع: ${expectedProfit.toFixed(2)} ر.ع.

قدم تحليلاً شفهياً موجزاً ومشجعاً باللغة العربية الفصحى يوضح متى يصل المشروع لنقطة التعادل وكيف يستفيد من بطاقة ريادة وسوق منصة مُنتجي.`;

    let reviewText = "";
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: AWNI_SYSTEM_INSTRUCTION,
            temperature: 0.6,
          },
        });
        reviewText = response.text || "";
      } catch (e) {
        console.warn("Feasibility AI error:", e);
      }
    }

    if (!reviewText) {
      reviewText = `يا هلا بك! راجعت ميزانية مشروع "${projectName || "مشروعك"}":
تحتاج إلى بيع ${breakEvenUnits || 0} وحدة شهرياً (${breakEvenRevenue?.toFixed(2) || 0} ر.ع.) لتغطية التكاليف كاملة والوصول لنقطة التعادل.
الربح الصافي المتوقع عند تحقيق الهدف هو ${expectedProfit.toFixed(2)} ر.ع.`;
    }

    res.json({
      unitMargin,
      breakEvenUnits,
      breakEvenRevenue,
      expectedProfit,
      reviewText,
    });
  } catch (err: any) {
    console.error("Feasibility analysis error:", err);
    res.status(500).json({ error: "Failed to evaluate feasibility" });
  }
});

// 5. مسار الـ WebSocket للجلسة الصوتية الحية (Live Voice API)
async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("⚡ New client connected to Gemini Live voice session");
    const ai = getAIClient();

    if (!ai) {
      clientWs.send(JSON.stringify({ error: "مفتاح API غير متوفر في الخادم" }));
      clientWs.close();
      return;
    }

    try {
      // موديل الجلسات الصوتية الحية ثنائية الاتجاه
      const session = await ai.live.connect({
        model: "gemini-2.0-flash-exp",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Fenrir" },
            },
          },
          systemInstruction: AWNI_SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ text: part.text }));
                }
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }

            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ closed: true }));
            }
          },
          onerror: (err) => {
            console.error("Gemini Live session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: String(err) }));
            }
          },
        },
      });

      clientWs.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (msg.text) {
            session.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [{ text: msg.text }],
                },
              ],
              turnComplete: true,
            });
          }
        } catch (err) {
          console.error("Error processing client live input:", err);
        }
      });

      clientWs.on("close", () => {
        console.log("Client disconnected from Live session");
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error("Failed to connect to Live API:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err.message || "Failed to start live session" }));
        clientWs.close();
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🇴🇲 عوني - منصة مُنتجي server running on port ${PORT}`);
  });
}

startServer();
