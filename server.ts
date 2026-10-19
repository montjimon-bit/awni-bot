import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, ThinkingLevel, Modality, LiveServerMessage } from "@google/genai";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client helper
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

const AWNI_SYSTEM_INSTRUCTION = `أنت "عوني" (Awni)، الروبوت الاستشاري والوجه الرقمي التفاعلي لمنصة "مُنتجي" (Montaji) في سلطنة عُمان.
تتجسد أمام المستخدم على هيئة روبوت ذكي عائم (Cyber Bot) ذي شاشة تفاعلية وأطراف طافية، تتحدث بصوتك مباشرة وتستمع وترد بذكاء وسرعة فائقة.

1. لغة الحديث والأسلوب:
- تتحدث حصراً باللغة العربية الفصحى السليمة والراقية والواضحة (Modern Standard Arabic).
- تجنب تماماً الألفاظ العامية أو الدارجة؛ واستخدم عبارات الترحيب العمانية الرسمية الراقية بالفصحى مثل: "أهلاً وسهلاً بك في منصة مُنتجي الوطنية"، "يسرّني ويشرفني تقديم المشورة لمشروعك الواعد"، "فالك التوفيق والنجاح".
- السرعة والإيجاز: إجاباتك شفهية سريعة وموجزة ومباشرة، مرتبة في نقاط دقيقة بدون إطالة لتصل المعلومة فورياً.
- اختم دائماً بسؤال تفاعلي لطيف ووجيز يفتح آفاق الاستشارة (مثل: "هل تود الاطلاع على تحليل الميزانية ونقطة التعادل لمشروعك الآن؟").

2. الهوية الوطنية لمنصة "مُنتجي" (رؤية عُمان 2040):
- سوق رقمي وطني لمنتجات عمانية فاخرة (لبان حوجري ظفاري، عسل سدر جبلي، حلوى سلطانية، فضيات وخناجر، فخار بهلاء) مع شحن وتوصيل لكافة المحافظات الـ 11.
- مركز دراسات الجدوى الاقتصادية وحساب رأس المال ونقطة التعادل بالريال العماني (ر.ع. / OMR).
- توجيه للحصول على بطاقة ريادة 2026 وترخيص المشاريع المنزلية وقروض بنك التنمية العماني الميسرة بدون فوائد.

3. التمثيل البياني الاقتصادي (Economic Dashboard):
- عندما يسألك المستخدم عن دراسة جدوى، حساب رأس مال، ميزانية، أو تكاليف وأرباح بالريال العماني (OMR)، اشرح الملخص بالفصحى الموجزة، ثم أرفق في نهاية إجابتك كود JSON التالي بدقة ليعرضه النظام في لوحة الرسوم البيانية Recharts:
\`\`\`json
{
  "economicData": {
    "projectName": "اسم المشروع",
    "currency": "ر.ع.",
    "totalCapitalOMR": 4000,
    "breakEvenUnits": 100,
    "breakEvenRevenueOMR": 1200,
    "expectedProfitOMR": 550,
    "capitalAllocation": [
      { "name": "المعدات والتجهيز", "amount": 1800 },
      { "name": "المواد الخام", "amount": 1200 },
      { "name": "التسويق والهوية", "amount": 600 },
      { "name": "التراخيص والاحتياطي", "amount": 400 }
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

// Fallback response generator in Modern Standard Arabic
function getFallbackAwniResponse(message: string): string {
  const clean = message.toLowerCase().trim();
  if (
    clean.includes("من أنتم") ||
    clean.includes("من انت") ||
    clean.includes("من أنت") ||
    clean.includes("ما هي منصة منتجي") ||
    clean.includes("عرفني بنفسك") ||
    clean.includes("منصة منتجي")
  ) {
    return `أهلاً وسهلاً بك في منصة "مُنتجي" الوطنية في سلطنة عُمان! 🇴🇲

أنا "عوني"، مستشارك الرقمي المعتمد لتمكين رواد الأعمال والمشاريع الوطنية والأسر المنتجة تحت مظلة رؤية عُمان 2040.

خدماتنا الرئيسية تشمل:
1. **السوق الرقمي الوطني**: تسويق المنتجات العُمانية الفاخرة (اللبان الحوجري، الحلوى السلطانية، العسل الجبلي، الفضيات وفخار بهلاء) مع الشحن لكافة المحافظات الـ 11.
2. **مركز دراسات الجدوى**: حساب رأس المال ونقطة التعادل بدقة بالريال العُماني (OMR).
3. **تسهيل بطاقة ريادة 2026 وقروض التنمية**: توجيهك للحصول على تراخيص المشاريع وقروض بنك التنمية الميسرة بدون فوائد.

هل ترغب في البدء بحساب ميزانية وجدوى مشروعك بالريال العُماني الآن؟`;
  }

  if (clean.includes("جدوى") || clean.includes("رأس مال") || clean.includes("ميزانية") || clean.includes("تكاليف") || clean.includes("حساب") || clean.includes("أرباح")) {
    return `يسعدني جداً تقديم التحليل المالي لمشروعك بالريال العُماني (OMR):

بناءً على التقديرات الأولية:
• **إجمالي رأس المال المطلوب:** 4,500 ر.ع. موزع بين المعدات والمواد والتسويق.
• **نقطة التعادل الشهرية:** 90 وحدة (1,080 ر.ع. مبيعات لتغطية التكاليف).
• **صافي الربح المتوقع:** 620 ر.ع. شهرياً عند استهداف 150 وحدة.

تم تحديث لوحة المؤشرات البيانية أدناه لعرض توزيع الميزانية وهيكل رأس المال. هل تود تعديل أي بند؟
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
      { "name": "المعدات والتجهيزات", "amount": 1900 },
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
\`\`\``;
  }

  if (clean.includes("ريادة") || clean.includes("ترخيص") || clean.includes("سجل") || clean.includes("بنك التنمية") || clean.includes("قرض")) {
    return `بكل سرور واعتزاز! إليك التوجيه المعتمد لبطاقة ريادة 2026 وتمويل بنك التنمية العُماني:

1. **بطاقة ريادة 2026**: تمنحك إعفاءات وتسهيلات حكومية، وأولوية 10% في المناقصات الحكومية للمتفرغين لإدارة مشاريعهم.
2. **ترخيص الأعمال المنزلية**: يصدر إلكترونياً عبر بوابة "استثمر بسهولة" لأكثر من 40 نشاطاً بتكلفة رمزية ودون الحاجة لمقر تجاري منفصل.
3. **قروض بنك التنمية العُماني**: تمويل ميسر **بفائدة 0%** للمشاريع الصغرى والحرفية يصل حتى 250,000 ر.ع. بفترات سداد مريحة.

هل تود أن أساعدك في إعداد ملف التقديم للبنك وتقديم دراسة الجدوى؟`;
  }

  return `أهلاً وسهلاً بك! أنا في خدمتك لتقديم كافة الاستشارات الاقتصادية للمشاريع العُمانية وتسويق المنتجات الوطنية.

هل تود احتساب دراسة الجدوى وتوزيع رأس المال، أم الاستفسار عن بطاقة ريادة والسوق الوطني؟`;
}

// Real-time ultra-fast streaming endpoint (ChatGPT & Gemini style)
app.post("/api/chat-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { message, history } = req.body;
  const ai = getAIClient();
  if (!message || typeof message !== "string") {
    res.write(`data: ${JSON.stringify({ chunk: "يا هلا بك! أنا أستمع إليك." })}\n\n`);
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
      const words = fallback.split(" ");
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ chunk: word + " " })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: AWNI_SYSTEM_INSTRUCTION,
        temperature: 0.6,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
    console.error("Streaming error:", err);
    const fallback = getFallbackAwniResponse(message);
    res.write(`data: ${JSON.stringify({ chunk: fallback })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getAIClient();

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!ai) {
      // Return smart fallback
      const fallback = getFallbackAwniResponse(message);
      res.json({ reply: fallback, source: "offline-knowledge" });
      return;
    }

    const contents: any[] = [];

    // Add conversation history if provided
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

    // Add the current user query
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: AWNI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || getFallbackAwniResponse(message);
    res.json({ reply, source: "gemini-3.8-flash" });
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    const fallback = getFallbackAwniResponse(req.body?.message || "");
    res.json({ reply: fallback, error: err.message, source: "fallback" });
  }
});

// TTS API endpoint using gemini-3.8-flash-lite-tts
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const ai = getAIClient();
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    // Truncate to spoken size if too long (first 250 chars)
    const cleanText = text.replace(/[*_#`[\]()]/g, "").slice(0, 300);

    if (!ai) {
      res.json({ audioBase64: null, useWebSpeech: true });
      return;
    }

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: "Friendly, warm, professional Omani male advisor with clear Arabic pronunciation",
              },
            },
          ],
        },
      ],
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
    } else {
      res.json({ audioBase64: null, useWebSpeech: true });
    }
  } catch (err: any) {
    console.warn("TTS fallback to Web Speech:", err?.message);
    res.json({ audioBase64: null, useWebSpeech: true });
  }
});

// Feasibility Advisor Analysis endpoint
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

    if (!ai) {
      const summary = `يا هلا بك! راجعت ميزانية مشروع "${projectName || "مشروعك العُماني"}":
- هامش ربح الوحدة: ${unitMargin.toFixed(2)} ر.ع.
- نقطة التعادل: ${breakEvenUnits ? `${breakEvenUnits} وحدة شهرياً (${breakEvenRevenue?.toFixed(2)} ر.ع.)` : "يرجى التأكد من أن سعر البيع أعلى من التكلفة المتغيرة"}.
- الربح الصافي المتوقع عند بيع ${mt} وحدة: ${expectedProfit.toFixed(2)} ر.ع.

نصيحتي لك كعوني: ركز على تقليل التكاليف التأسيسية عبر ترخيص المنزل واستفد من دعم ريادة 2026.
تحب نربط دراستك مع خيارات تمويل بنك التنمية العماني؟`;

      res.json({
        unitMargin,
        breakEvenUnits,
        breakEvenRevenue,
        expectedProfit,
        reviewText: summary,
      });
      return;
    }

    const prompt = `أنت "عوني"، المستشار الاقتصادي لمنصة مُنتجي العمانية. 
راجع بيانات الجدوى الاقتصادية لمشروع "${projectName || "مشروع عُماني"}":
- التكاليف الثابتة الشهرية: ${fc} ر.ع.
- التكلفة المتغيرة للوحدة: ${vc} ر.ع.
- سعر بيع الوحدة: ${sp} ر.ع.
- هامش مساهمة الوحدة: ${unitMargin.toFixed(2)} ر.ع.
- نقطة التعادل المحسوبة: ${breakEvenUnits} وحدة (${breakEvenRevenue?.toFixed(2)} ر.ع.)
- المبيعات الشهرية المستهدفة: ${mt} وحدة
- صافي الربح المتوقع: ${expectedProfit.toFixed(2)} ر.ع.

قدم تقييماً شفهياً مقتضباً وذكياً بنكهة عمانية محفزة (3-4 فقرات قصيرة):
1) رأيك في هامش الربحية ونقطة التعادل.
2) نصيحة استراتيجية عمانية لتقليل المخاطر (مثل التسويق عبر منصة منتجي أو الاستفادة من بطاقة ريادة 2026).
3) سؤال ختامي تفاعلي للمتابعة.`;

    let reviewText = "";

    try {
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AWNI_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
        reviewText = response.text || "";
      }
    } catch (genErr) {
      console.warn("Feasibility AI review fallback:", genErr);
    }

    if (!reviewText) {
      reviewText = `يا هلا والله بك! راجعت ميزانية مشروع "${projectName || "مشروعك العُماني"}":
• هامش مساهمة الوحدة: ${unitMargin.toFixed(2)} ر.ع. (ممتاز لدعم الربحية).
• نقطة التعادل: تحتاج بيع ${breakEvenUnits} وحدة شهرياً (${breakEvenRevenue?.toFixed(2)} ر.ع.) لتغطية التكاليف كاملة.
• صافي الربح الشهري المتوقع: ${expectedProfit.toFixed(2)} ر.ع. عند تحقيق هدف ${mt} وحدة.

نصيحة عوني: استفد من ترخيص الأعمال المنزلية وبطاقة ريادة 2026 لتخفيض الرسوم والتكاليف الثابتة، واعرض منتجاتك مباشرة في سوق مُنتجي الوطني.
تحب نربط دراستك مع خيارات تمويل بنك التنمية العماني الميسرة بدون فوائد؟`;
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

// Setup Vite or static serving and WebSocket server for Gemini Live API
async function startServer() {
  const server = http.createServer(app);

  // WebSocket Server for Live API (gemini-3.8-live)
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
      // Connect to Gemini 3.8 Live API
      const session = await ai.live.connect({
        model: "gemini-3.8-live",
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
            // Forward audio output chunks (24kHz PCM)
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

            // Real-time interruption event
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }

            // Model finished turn
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

      // Forward client microphone audio (16kHz PCM) or text to Gemini Live
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
        console.log("Client disconnected from Live voice session");
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
    console.log(`🇴🇲 عوني - منصة مُنتجي server running on port ${PORT} with Gemini Live API support`);
  });
}

startServer();
