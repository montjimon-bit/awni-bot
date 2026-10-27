import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, ThinkingLevel, Modality, LiveServerMessage } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// إعداد مسار المجلد للتوافق مع ES Modules في Node.js و Render
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ============================================================================
// الشرح والنظام الشامل المحدث والمضبوط لـ "عوني" (منصة مُنتجي - عُمان 2040)
// ============================================================================
const AWNI_SYSTEM_INSTRUCTION = `أنت "عوني" (Awni)، المستشار الاقتصادي الذكي والوجه الرقمي التفاعلي لمنصة "مُنتجي" (Montaji) الوطنية في سلطنة عُمان.
تتجسد أمام المستخدمين والزوار في المعارض ومهرجانات العلوم على هيئة روبوت ذكي عائم (Cyber Bot) ذي شاشة تفاعلية وأطراف طافية، تتحدث بصوتك مباشرة وتستمع وترد بذكاء فائق ودون أي تكرار ممل.

### أولاً: قاعدة المعرفة المطلقة لمنصة "مُنتجي":
«مُنتجي» هي منصة عُمانية ذكية ورائدة، تستخدم تقنيات الذكاء الاصطناعي التوليدي وتحليل البيانات لمساعدة أصحاب المشاريع، والأسر المنتجة، ورواد الأعمال، وأصحاب الابتكارات على تطوير مشاريعهم من الصفر وحتى المنافسة في السوق.
توفر المنصة لكل رائد عمل متجراً إلكترونياً فورياً، وتدعمه بحلول ذكية متكاملة في التسويق الرقمي، وتحديد الأسعار، ودراسة السوق، وتحليل المنافسين، وإعداد دراسات الجدوى، لتمكينه من إدارة مشروعه بكل سهولة، وتقليل مخاطر البدء، وزيادة فرص نجاحه ونموه المالي؛ انسجاماً مع مستهدفات رؤية عُمان 2040 لتمكين المؤسسات الصغيرة والمتوسطة وتعزيز القيمة المحلية المضافة (ICV).

### ثانياً: الرؤية، الرسالة، والأهداف الوطنية:
- **الرؤية:** أن تكون منصة «مُنتجي» الحاضنة الرقمية الأولى والشريك التقني الذكي لكل رائد عمل وأسرة منتجة ومبتكر في سلطنة عُمان والمنطقة.
- **الرسالة:** تمكين المشاريع الوطنية الناشئة بأدوات الذكاء الاصطناعي وحلول التجارة الحديثة، وتحويل المنتجات المحلية والمجسمات الابتكارية من مجرد أفكار منزلية أو معملية إلى منتجات تجارية متداولة وناجحة اقتصادياً.
- **الأهداف الاستراتيجية:**
  1. خفض الحواجز التقنية والمالية أمام الأسر المنتجة والمبتكرين للدخول إلى سوق التجارة الإلكترونية.
  2. توفير منظومة تسعير عادلة ومدروسة تحمي هوامش ربح رواد الأعمال وتلائم القوة الشرائية في عُمان.
  3. ربط الإنتاج المحلي بمختلف المحافظات في سوق وطني موحد وموثوق.
  4. توفير إرشاد اقتصادي ودراسات جدوى آلية وفورية على مدار الساعة.

### ثالثاً: الركائز والخدمات الأساسية في المنصة:
1. **التدشين الفوري للمتاجر والمنتجات (Kiosk / Booth Store Creator):**
   - تتيح لأي مبتكر أو صاحب عمل منزلي يشارك في معرض أو بوث أن يفتح متجره خلال ثوانٍ عبر تصوير المنتج بكاميرا الهاتف. يتولى الذكاء الاصطناعي تحليل الصورة، استخراج اسم ابتكاري، كتابة وصف تسويقي احترافي، وتقدير السعر بالريال العُماني (OMR)، وتدشين صفحة المتجر فوراً مع زر تواصل مباشر عبر واتساب.
2. **التسويق الرقمي وصياغة الهوية:**
   - صياغة العبارات الترويجية والوصف البيعي الجذاب باللغة العربية، مع إبراز هوية المنتج ومصدره حسب المحافظة العُمانية لإعطاء طابع الأصالة والموثوقية.
3. **التسعير الذكي (Smart Pricing):**
   - التخلص من عشوائية التسعير عبر تحليل نوع المنتج، تكاليف المواد، وطبيعة السوق المحلي لاقتراح أسعار دقيقة ومتوازنة (بثلاث خانات عشرية بالريال العُماني OMR).
4. **دراسة السوق وتحليل المنافسين:**
   - تزويد صاحب المشروع برؤية حول مدى تشبع السوق، والميزات التنافسية، وتوجيهه نحو الفئات الأكثر طلباً (تقنية وابتكار، عطور ولبان، حرف وفخاريات، أغذية طبيعية).
5. **المستشار الاقتصادي الذكي (عوني AI - أنت):**
   - رفيق استشاري يعمل على مدار الساعة للإجابة على استفسارات رواد الأعمال وحساب مؤشرات الجدوى ونقطة التعادل (Break-even Analysis) وعدد الوحدات الواجب بيعها.
6. **السوق الوطني العُماني الموحد (The Marketplace):**
   - منصة بيع متكاملة تجمع المشترين بالمنتجين المحليين من مسقط إلى ظفار وكافة المحافظات، مع سلة تسوق مرنة ودعم بوابات الدفع الإلكتروني المحلي (مثل ثواني وبنك مسقط).

### رابعاً: قواعد التفاعل الذكي (منع الإجابات المتكررة):
- **فهم نية المستخدم بدقة:** استمع إلى السؤال أو الاستفسار وحلله بعمق. لا تعطِ إجابة معلبة أو متكررة. إذا سأل الزائر عن التسعير، تحدث عن التسعير الذكي. وإذا سأل عن فتح متجر، اشرح تصوير المنتج والتدشين الفوري.
- **التنوع والابتكار في الصياغة:** استخدم أسلوباً حوارياً متجدداً، ودوداً، ومحترفاً بالفصحى، مع إضافة لمسات بصرية ومهنية تناسب هوية عُمان 2040.
- **الاختصار والوضوح:** اجعل إجاباتك دقيقة وغير مطولة، لتلائم أجواء المعارض ومهرجانات العلوم.
- **السؤال التفاعلي الختامي:** افتح دائماً آفاقاً جديدة للنقاش في نهاية كل رد (مثل: "هل تود أن نحدد سعر منتجك الآن؟" أو "هل ترغب في معرفة شروط بطاقة ريادة 2026؟").

### خامساً: لوحة المؤشرات الاقتصادية (Economic Dashboard):
إذا تضمن سؤال المستخدم حساب جدوى، رأس مال، أرباح، أو ميزانية بالريال العماني، أضف في نهاية ردك كود JSON التالي بدقة لعرض الرسوم البيانية:
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

// Dynamic & contextual fallback response generator to prevent repetition
function getFallbackAwniResponse(message: string): string {
  const clean = message.toLowerCase().trim();
  
  if (clean.includes("من أنتم") || clean.includes("من انت") || clean.includes("منصة منتجي") || clean.includes("ما هي")) {
    return `أهلاً بك! منصة "مُنتجي" هي منصة عُمانية ذكية ورائدة توظف الذكاء الاصطناعي لتحويل أفكار الأسر المنتجة والمبتكرين إلى متاجر رقمية فورية، مع تقديم دراسات الجدوى والتسويق الرقمي ضمن رؤية عُمان 2040. كيف يمكنني مساعدتك اليوم؟`;
  }

  if (clean.includes("متجر") || clean.includes("معرض") || clean.includes("بوث") || clean.includes("تصوير") || clean.includes("منتج")) {
    return `خدمة التدشين الفوري للمتاجر مصممة خصيصاً للبوثات والمعارض! يمكنك تصوير أي منتج بكاميرا هاتفك، وسيقوم الذكاء الاصطناعي فوراً بتوليد اسم ابتكاري، وصف تسويقي، وسعر مقترح بالريال العماني لتدشين متجرك خلال ثوانٍ معدودة. هل تود تجربة رفع صورة منتجك الآن؟`;
  }

  if (clean.includes("جدوى") || clean.includes("رأس مال") || clean.includes("ميزانية") || clean.includes("تكاليف") || clean.includes("أرباح") || clean.includes("تعادل")) {
    return `يسعدني إعداد دراسة الجدوى واحتساب نقطة التعادل بدقة بالريال العُماني (OMR). إليك التقدير المالي الأولي لمشروعك:
- إجمالي رأس المال التأسيسي: 4,500 ر.ع.
- نقطة التعادل الشهرية: 90 وحدة (مبيعات بقيمة 1,080 ر.ع.).
- صافي الربح الشهري المتوقع: 620 ر.ع.

تم تحديث لوحة المؤشرات البيانية أدناه. هل تود تعديل تكاليف المشروع أو أسعار البيع؟
\`\`\`json
{
  "economicData": {
    "projectName": "دراسة جدوى منصة مُنتجي",
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
  }

  if (clean.includes("تسعير") || clean.includes("سعر")) {
    return `خاصية "التسعير الذكي" في منصة مُنتجي تحميك من عشوائية التسعير؛ حيث نقوم بتحليل تكاليف المواد وطبيعة السوق المحلي لاقتراح سعر دقيق بثلاث خانات عشرية بالريال العماني يضمن لك هامش ربح عادلاً يناسب المستهلك العماني. ما هو منتجك لنقترح له سعراً مدروساً؟`;
  }

  if (clean.includes("ريادة") || clean.includes("قرض") || clean.includes("بنك التنمية") || clean.includes("ترخيص")) {
    return `منصة مُنتجي ترشدك للحصول على "بطاقة ريادة 2026" التي تمنحك إعفاءات وأولوية 10% في المناقصات الحكومية، بالإضافة إلى ترخيص الأعمال المنزلية إلكترونياً وقروض بنك التنمية العُماني بفائدة 0%. هل تحب أن أوجّهك لخطوات التقديم؟`;
  }

  return `أهلاً بك في جناح منصة مُنتجي بمهرجان العلوم! أنا "عوني"، مستشارك الرقمي جاهز للرد على أي استفسار حول المتاجر الفورية، دراسات الجدوى، أو السوق الوطني العماني. تفضل بطرح سؤالك!`;
}

// Real-time ultra-fast streaming endpoint
app.post("/api/chat-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { message, history } = req.body;
  const ai = getAIClient();
  if (!message || typeof message !== "string") {
    res.write(`data: ${JSON.stringify({ chunk: "يا هلا بك! أنا أستمع إليك باهتمام." })}\n\n`);
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
        await new Promise((r) => setTimeout(r, 15));
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
      const fallback = getFallbackAwniResponse(message);
      res.json({ reply: fallback, source: "offline-knowledge" });
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

    const reply = response.text || getFallbackAwniResponse(message);
    res.json({ reply, source: "gemini-2.5-flash" });
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    const fallback = getFallbackAwniResponse(req.body?.message || "");
    res.json({ reply: fallback, error: err.message, source: "fallback" });
  }
});

// TTS API endpoint
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

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: cleanText }],
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
- نقطة التعادل: ${breakEvenUnits ? `${breakEvenUnits} وحدة شهرياً (${breakEvenRevenue?.toFixed(2)} ر.ع.)` : "يرجى التأكد من أن سعر البيع أعلى من التكلفة"}.
- الربح المتوقع عند بيع ${mt} وحدة: ${expectedProfit.toFixed(2)} ر.ع.

نصيحتي لك كعوني: استثمر في التسويق الرقمي عبر منصة مُنتجي الوطنية لزيادة المبيعات.`;

      res.json({
        unitMargin,
        breakEvenUnits,
        breakEvenRevenue,
        expectedProfit,
        reviewText: summary,
      });
      return;
    }

    const prompt = `أنت "عوني"، المستشار الاقتصادي لمنصة مُنتجي العمانية في مهرجان العلوم. 
راجع بيانات الجدوى الاقتصادية لمشروع "${projectName || "مشروع عُماني"}":
- التكاليف الثابتة الشهرية: ${fc} ر.ع.
- التكلفة المتغيرة للوحدة: ${vc} ر.ع.
- سعر بيع الوحدة: ${sp} ر.ع.
- نقطة التعادل المحسوبة: ${breakEvenUnits} وحدة (${breakEvenRevenue?.toFixed(2)} ر.ع.)
- المبيعات المستهدفة: ${mt} وحدة
- صافي الربح المتوقع: ${expectedProfit.toFixed(2)} ر.ع.

قدم تقييماً شفهياً مقتضباً وذكياً بنكهة عمانية محفزة (3 فقرات قصيرة):
1) رأيك في هامش الربحية ونقطة التعادل.
2) نصيحة استراتيجية عمانية للاستفادة من منصة مُنتجي وبطاقة ريادة 2026.
3) سؤال ختامي تفاعلي للزوار.`;

    let reviewText = "";
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
    } catch (genErr) {
      console.warn("Feasibility AI review fallback:", genErr);
    }

    if (!reviewText) {
      reviewText = `يا هلا والله بك! راجعت ميزانية مشروع "${projectName || "مشروعك العُماني"}":
- نقطة التعادل: تحتاج بيع ${breakEvenUnits} وحدة شهرياً (${breakEvenRevenue?.toFixed(2)} ر.ع.) لتغطية التكاليف.
- صافي الربح الشهري المتوقع: ${expectedProfit.toFixed(2)} ر.ع.

نصيحة عوني: استفد من ترخيص الأعمال المنزلية وبطاقة ريادة 2026، واعرض منتجاتك في سوق مُنتجي الوطني.`;
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
      const session = await ai.live.connect({
        model: "gemini-2.5-flash",
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
    console.log(`🇴🇲 عوني - منصة مُنتجي (مهرجان العلوم) server running on port ${PORT}`);
  });
}

startServer();
