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

// إعداد عميل مكتبة Google GenAI الرسمية
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
// الدليل المعرفي والتعليمات النظامية لعوني (منصة مُنتجي - سلطنة عُمان)
// ============================================================================
const AWNI_SYSTEM_INSTRUCTION = `أنت "عوني" (Awni)، الروبوت الاستشاري والوجه الرقمي التفاعلي لمنصة «مُنتجي» (Montaji) في سلطنة عُمان.
تتجسد أمام زوار المعارض ورواد الأعمال على هيئة روبوت ذكي عائم (Cyber Bot) ذي شاشة تفاعلية وأطراف طافية، تتحدث بصوتك مباشرة وتستمع وتفهم بذكاء فائق.

### 1. ما هي منصة «مُنتجي»؟
«مُنتجي» هي منصة عُمانية ذكية ورائدة، تستخدم تقنيات الذكاء الاصطناعي التوليدي وتحليل البيانات لمساعدة أصحاب المشاريع، والأسر المنتجة، ورواد الأعمال، وأصحاب الابتكارات على تطوير مشاريعهم من الصفر وحتى المنافسة في السوق.
توفر المنصة لكل رائد عمل متجراً إلكترونياً فورياً، وتدعمه بحلول ذكية متكاملة في التسويق الرقمي، وتحديد الأسعار، ودراسة السوق، وتحليل المنافسين، وإعداد دراسات الجدوى، لتمكينه من إدارة مشروعه بكل سهولة، وتقليل مخاطر البدء، وزيادة فرص نجاحه ونموه المالي؛ انسجاماً مع مستهدفات رؤية عُمان 2040 لتمكين المؤسسات الصغيرة والمتوسطة وتعزيز القيمة المحلية المضافة (ICV).

### 2. الرؤية، الرسالة، والأهداف الوطنية:
- الرؤية: أن تكون منصة «مُنتجي» الحاضنة الرقمية الأولى والشريك التقني الذكي لكل رائد عمل وأسرة منتجة ومبتكر في سلطنة عُمان والمنطقة.
- الرسالة: تمكين المشاريع الوطنية الناشئة بأدوات الذكاء الاصطناعي وحلول التجارة الحديثة، وتحويل المنتجات المحلية والمجسمات الابتكارية من مجرد أفكار منزلية أو معملية إلى منتجات تجارية متداولة وناجحة اقتصادياً.
- الأهداف الاستراتيجية:
  1. خفض الحواجز التقنية والمالية أمام الأسر المنتجة والمبتكرين للدخول إلى سوق التجارة الإلكترونية.
  2. توفير منظومة تسعير عادلة ومدروسة تحمي هوامش ربح رواد الأعمال وتلائم القوة الشرائية في عُمان.
  3. ربط الإنتاج المحلي بمختلف المحافظات في سوق وطني موحد وموثوق.
  4. توفير إرشاد اقتصادي ودراسات جدوى آلية وفورية على مدار الساعة.

### 3. الركائز والخدمات الأساسية في المنصة:
أولاً: التدشين الفوري للمتاجر والمنتجات (Kiosk / Booth Store Creator):
- خدمة استثنائية للمعارض والملتقيات تتيح لأي مبتكر أو صاحب عمل منزلي يشارك في معرض أو بوث أن يفتح متجره خلال ثوانٍ.
- آلية العمل:
  1. يقوم المستخدم بتصوير مجسمه أو منتجه المادي مباشرة بكاميرا الهاتف.
  2. يتولى الذكاء الاصطناعي تحليل الصورة فورياً: استخراج اسم ابتكاري، كتابة وصف تسويقي احترافي، وتصنيف المنتج، وتقدير سعره المقترح بالريال العُماني.
  3. يسجل المستخدم الدخول السريع (Google) ويؤكد اسمه ورقم هاتفه.
  4. تدشين صفحة المتجر فوراً باسمه مع صورة المنتج وسعره وزر تواصل مباشر عبر واتساب، مع إدراجه تلقائياً كبائع في السوق الوطني.

ثانياً: التسويق الرقمي وصياغة الهوية:
- صياغة العبارات الترويجية والوصف البيعي الجذاب للمنتجات باللغة العربية مع إبراز هوية المنتج ومصدره (حسب المحافظة العُمانية) لإعطاء طابع الأصالة والموثوقية، وإتاحة روابط المشاركة والتواصل المباشر.

ثالثاً: التسعير الذكي (Smart Pricing):
- التخلص من عشوائية التسعير عبر تحليل نوع المنتج، تكاليف المواد، وطبيعة السوق المحلي لاقتراح أسعار دقيقة ومتوازنة (بثلاث خانات عشرية بالريال العُماني OMR) تضمن هامش ربح مجزٍ للمشروع دون مبالغة للمستهلك.

رابعاً: دراسة السوق وتحليل المنافسين:
- تزويد صاحب المشروع برؤية واضحة حول مدى تشبع السوق والميزات التنافسية، وتوجيهه نحو الفئات الأكثر طلباً في السوق الوطني (تقنية وابتكار، عطور ولبان، حرف وفخاريات، أغذية طبيعية).

خامساً: المستشار الاقتصادي الذكي (عوني AI):
- رفيق استشاري يعمل على مدار الساعة لحساب مؤشرات الجدوى ونقطة التعادل (Break-even Analysis): تحديد عدد الوحدات الواجب بيعها وقيمة المبيعات النقدية لتغطية التكاليف التشغيلية ورأس المال.

سادساً: السوق الوطني العُماني الموحد (The Marketplace):
- منصة بيع متكاملة تجمع المشترين بالمنتجين المحليين عبر محافظات عُمان الـ 11 مع سلة تسوق مرنة تدعم بوابات الدفع الإلكتروني المحلي (مثل ثواني وبنك مسقط) وتتبع حالات الشحن.

### 4. لوحات التحكم والبنية التقنية:
- لوحة تحكم البائع (Seller Dashboard): متابعة مبيعات المتجر، الطلبات، والتحكم بالأسعار والمخزون.
- لوحة تحكم المشرف العام (Admin): مراقبة نمو المنصة ومراجعة المنتجات والبائعين.
- البنية التقنية: واجهة React مع TypeScript و Tailwind CSS، ونماذج ذكاء اصطناعي متعددة الوسائط (Multimodal AI)، وتخزين سحابي فوري عبر Firebase Firestore و Auth.

### 5. أسلوب الحوار وقواعد منع التكرار (مهم جداً):
- اللغة: تتحدث باللغة العربية الفصحى السليمة والراقية والواضحة مع ترحيب عُماني مهذب (مثل: "يا مرحباً بك في منصة مُنتجي"، "فالك التوفيق والنجاح").
- فهم السؤال بعمق وعدم التكرار: افهم تماماً قصد الزائر أو رائد الأعمال وأجب مباشرة على نقطة سؤاله. تجنب تقديم نفس المقدمات أو الديباجات في كل رد. نوع في صياغتك دائماً.
- التعبير الشفهي: كن واضحاً وموجزاً ومباشراً بدون إطالة زائدة ليتناسب كلامك مع التفاعل الصوتي الحي والشاشات التفاعلية.
- التحليل الاقتصادي والرسوم البيانية: عندما يسألك المستخدم عن دراسة جدوى أو ميزانية أو تكاليف وأرباح، اشرح التحليل باقتضاب ثم اختم إجابتك بكود JSON التالي بدقة لتعرضه الشاشة في لوحة المؤشرات البيانية:
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

// إجابات احتياطية سريعة ومخصصة حسب نية السؤال
function getFallbackAwniResponse(message: string): string {
  const clean = message.toLowerCase().trim();

  if (clean.includes("من أنتم") || clean.includes("من انت") || clean.includes("ما هي") || clean.includes("عرفني")) {
    return `أهلاً ومرحباً بك! منصة «مُنتجي» هي الحاضنة الرقمية العُمانية الرائدة التي تسخر الذكاء الاصطناعي لتمكين رواد الأعمال والأسر المنتجة والمبتكرين؛ حيث نمنحك متجراً فورياً، ودراسات جدوى، وتسعيراً ذكياً لمنتجاتك انسجاماً مع رؤية عُمان 2040. كيف يمكنني دعم مشروعك اليوم؟`;
  }

  if (clean.includes("متجر") || clean.includes("بوث") || clean.includes("معرض") || clean.includes("تصوير") || clean.includes("صورة")) {
    return `خدمة التدشين الفوري (Kiosk Store Creator) تتيح لك فتح متجرك في ثوانٍ معدودة! كل ما عليك هو التقاط صورة لمنتجك أو مجسمك في البوث، وسيقوم الذكاء الاصطناعي بتوليد اسم جذاب ووصف تسويقي وسعر مقترح بالريال العماني مع رابط تواصل فوري عبر الواتساب. هل تود تجربة ذلك لمنتجك؟`;
  }

  if (clean.includes("تسعير") || clean.includes("سعر") || clean.includes("التسعير")) {
    return `خدمة التسعير الذكي في «مُنتجي» تحميك من عشوائية تحديد الأسعار، حيث تدرس تكاليف المواد وطبيعة السوق العماني لتقترح سعراً متوازناً بالريال العماني يضمن لك هامش ربح مجزياً ويلائم القوة الشرائية. ما هو المنتج الذي ترغب في تسعيره؟`;
  }

  if (clean.includes("جدوى") || clean.includes("رأس مال") || clean.includes("ميزانية") || clean.includes("تكاليف") || clean.includes("أرباح") || clean.includes("تعادل")) {
    return `يسرني تحليل الجدوى المالية لمشروعك بالريال العُماني (OMR):
- رأس المال التأسيسي المقترح: 4,500 ر.ع.
- نقطة التعادل: بيع 90 وحدة شهرياً (تحقيق 1,080 ر.ع. مبيعات لتغطية النفقات).
- صافي الربح المتوقع: 620 ر.ع. شهرياً عند تجاوز نقطة التعادل.

تم إرسال البيانات المحدثة للوحة المؤشرات البيانية في الشاشة أمامك. ما هي خطتك لحجم الإنتاج؟
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

  if (clean.includes("ريادة") || clean.includes("ترخيص") || clean.includes("بنك التنمية") || clean.includes("قرض")) {
    return `بكل اعتزاز! منصة «مُنتجي» ترشدك للحصول على بطاقة ريادة 2026 للاستفادة من أولوية الـ 10% في المشتريات الحكومية، وإصدار ترخيص الأعمال المنزلية عبر "استثمر بسهولة"، بالإضافة لتسهيل التقديم على قروض بنك التنمية العماني الميسرة بفائدة 0%. هل ترغب في بدء خطوات التقديم؟`;
  }

  return `يا هلا بك في جناح منصة «مُنتجي»! أنا "عوني"، رفيقك الرقمي لخدمات تدشين المتاجر، دراسات الجدوى الاقتصادية، والتسويق للمنتجات الوطنية عبر كافة محافظات سلطنة عُمان. تفضل بسؤالك!`;
}

// 1. مسار المحادثة المتدفقة الفورية (Streaming)
app.post("/api/chat-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { message, history } = req.body;
  const ai = getAIClient();

  if (!message || typeof message !== "string") {
    res.write(`data: ${JSON.stringify({ chunk: "مرحباً بك! أنا أستمع إليك." })}\n\n`);
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
        await new Promise((r) => setTimeout(r, 18));
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
        temperature: 0.65,
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

// 2. مسار المحادثة العادية (Chat)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getAIClient();

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!ai) {
      res.json({ reply: getFallbackAwniResponse(message), source: "offline-knowledge" });
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
    console.error("Gemini Chat Error:", err);
    res.json({ reply: getFallbackAwniResponse(req.body?.message || ""), error: err.message, source: "fallback" });
  }
});

// 3. مسار تحويل النص إلى صوت (TTS) مع معالجة آمنة تضمن النطق في كل الظروف
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const ai = getAIClient();

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const cleanText = text
      .replace(/[*_#`[\]()]/g, "")
      .replace(/([0-9]+)\)/g, "النقطة $1")
      .replace(/🇴🇲/g, "عُمان")
      .replace(/ر\.ع\./g, "ريال عماني")
      .replace(/OMR/gi, "ريال عماني")
      .slice(0, 320);

    if (!ai) {
      res.json({ audioBase64: null, useWebSpeech: true });
      return;
    }

    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: cleanText,
        config: {
          responseModalities: [Modality.AUDIO],
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
    } catch (ttsErr) {
      console.warn("API TTS fallback triggered:", ttsErr);
    }

    res.json({ audioBase64: null, useWebSpeech: true });
  } catch (err: any) {
    console.warn("TTS Error, fallback to WebSpeech:", err?.message);
    res.json({ audioBase64: null, useWebSpeech: true });
  }
});

// 4. مسار تحليل ومراجعة دراسة الجدوى
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

    const prompt = `أنت "عوني"، المستشار الاقتصادي لمنصة «مُنتجي» العمانية.
راجع أرقام الجدوى لمشروع "${projectName || "مشروع عُماني"}":
- التكاليف الثابتة الشهرية: ${fc} ر.ع.
- التكلفة المتغيرة للوحدة: ${vc} ر.ع.
- سعر بيع الوحدة: ${sp} ر.ع.
- نقطة التعادل المحسوبة: ${breakEvenUnits} وحدة (${breakEvenRevenue?.toFixed(2)} ر.ع.)
- المبيعات الشهرية المستهدفة: ${mt} وحدة
- صافي الربح المتوقع: ${expectedProfit.toFixed(2)} ر.ع.

قدم تقييماً شفهياً مقتضباً وذكياً بنكهة عمانية محفزة وواضحة، مع نصيحة للتسويق في منصة مُنتجي أو بطاقة ريادة.`;

    let reviewText = "";
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: AWNI_SYSTEM_INSTRUCTION,
            temperature: 0.65,
          },
        });
        reviewText = response.text || "";
      } catch (genErr) {
        console.warn("Feasibility AI review fallback:", genErr);
      }
    }

    if (!reviewText) {
      reviewText = `يا هلا بك! راجعت ميزانية مشروع "${projectName || "مشروعك"}":
نقطة التعادل تتحقق ببيع ${breakEvenUnits || 0} وحدة شهرياً (${breakEvenRevenue?.toFixed(2) || 0} ر.ع.) لتغطية التكاليف كاملة.
الربح الصافي المتوقع عند تحقيق هدف ${mt} وحدة هو ${expectedProfit.toFixed(2)} ر.ع.`;
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

// 5. مسار الـ WebSocket للجلسة الصوتية الحية المباشرة (Gemini Live Audio API)
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
      // الاتصال بالنموذج الحي الثنائي المدعوم للصوت المباشر
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
