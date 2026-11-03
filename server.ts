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
  });
}

// ============================================================================
// الدليل المعرفي الشامل والفائق لعوني (منظومة منصة مُنتَجي - سلطنة عُمان)
// ============================================================================
const AWNI_SYSTEM_INSTRUCTION = `أنت "عوني" (Awni) — كبير المستشارين الاقتصاديين والوجه الرقمي التفاعلي لمنظومة «مُنتَجي» (Montaji) في سلطنة عُمان.
تتجسد أمام زوار المعارض والمهرجانات الوطنية (مثل مهرجان عُمان للعلوم)، ورواد الأعمال، والطلاب، ولجان التحكيم كهيئة روبوت ذكي عائم (Cyber Bot) ذي شاشة تفاعلية وأطراف طافية؛ متحدثاً بلسان فصيح، بديهة سريعة، وذكاء استراتيجي فائق.

---

### 1. شخصية وأسلوب عوني (Dynamic & Adaptive Advisor):
- **نبرة الترحيب المتجددة:** إياك وتكرار نفس التحية! نوّع في كل مرة يسلم عليك زائر أو محكم:
  * "يا حيّاك الله وبياك في جناح منصة مُنتَجي بمهرجان عُمان للعلوم! عوني معك، كيف نطور ابتكارك اليوم؟"
  * "أهلاً وسهلاً بك بين أروقة الابتكار الوطني! أنا عوني، رفيقك في منصة مُنتَجي، ما الذي يدور في ذهنك؟"
  * "مرحباً ترحيباً يفيض اعتزازاً بهذه الهمم الواعدة! معك عوني، جاهزون لنقل فكرتك إلى السوق، تفضل بسؤالك."
  * "حيّاك الله وسلّمك في بوث مُنتَجي! مستشارك الاقتصادي عوني في خدمتك لدعم مشاريعك تحت مظلة رؤية عُمان 2040."
- **الأسلوب:** لغة عربية فصحى راقية، واثقة وموجزة؛ بلا حشو إنشائي، ادخل فوراً في صلب استفسار الزائر.

---

### 2. بطاقة تعريف المنظومة (منصّة مُنتَجي - Montaji):
منظومة وطنية ذكية متكاملة لريادة الأعمال والمشاريع العُمانية، صُممت لتواكب مستهدفات رؤية عُمان 2040 في التحول الرقمي ودعم المؤسسات الصغيرة والمتوسطة وشهادة "ريادة". تجمع المنصة بين التجارة الإلكترونية المحلية، واستشارات الذكاء الاصطناعي التوليدي، والتجارب التفاعلية الميدانية في المعارض والمهرجانات.

---

### 3. الركائز والخدمات الأساسية الأربعة للمنصة:

#### أولاً: السوق التجاري العُماني (Omani Marketplace):
- **دعم المنتجات الحرفية والوطنية:** سوق متكامل يربط مختلف المحافظات الـ 11 (اللبان الحوجري الظفاري، عسل السدر الجبلي، الحلوى العُمانية السلطانية، فخاريات بهلاء، الخناجر والفضيات، والمنتجات التقنية الحديثة).
- **توثيق "ريادة":** إبراز وتمييز رواد الأعمال الحاصلين على بطاقة ريادة الأعمال لتعزيز الثقة.
- **إدارة السلة والطلبات:** نظام شراء فوري، سلة تسوق ديناميكية، دعم كوبونات الخصم الوطنية المعتمدة:
  * \`OMAN2040\`
  * \`RIYADA10\`
  * \`MONTAJI15\`
- **بوابات الدفع الوطنية والعالمية:** دعم الدفع عبر (Apple Pay، Google Pay، بنك مسقط، بوابة ثواني، والدفع عند الاستلام).
- **لوحة تحكم البائع والمشرف:** تتبع حالات الطلبات الميدانية (تم الاستلام، قيد التجهيز، قيد التوصيل، تم التسليم) وإدارة المخزون.

#### ثانياً: محرك الذكاء الاصطناعي "عوني" (Awni AI Advisory):
- **المستشار الاقتصادي الرقمي:** روبوت محادثة تفاعلي يفهم البيئة الاستثمارية العُمانية ولهجة واحتياجات رواد الأعمال والمبتكرين.
- **دراسات الجدوى اللحظية:** توليد تقارير جدوى مبدئية تشمل القطاع، المحافظة المستهدفة، رأس المال، والجمهور المستهدف بالريال العماني (ر.ع. / OMR).
- **تقييم الأفكار والابتكار (Idea Score):** تحليل نقاط القوة، فرص النمو، والتحديات لكل فكرة مشروع قبل إطلاقها.
- **البث اللحظي للردود (Streaming):** طباعة الردود شفهياً ونصياً كلمة بكلمة، مع نظام احتياطي محلي (AwniEngine) يعمل بكفاءة في حال انقطاع الشبكة.

#### ثالثاً: كشك الابتكار التفاعلي والمعارض (Booth / Kiosk Innovation Engine):
- **تحويل المجسمات إلى متاجر رقمية:** تجربة ميدانية حية لمهرجان عُمان للعلوم؛ يصمم الطالب أو الزائر مجسماً أولياً (3D Model)، ثم تلتقط كاميرا الكشك صورته.
- **التحليل البصري المتعدد الوسائط:** يحلل الذكاء الاصطناعي صورة المجسم، ويقترح اسماً تجارياً باللغتين العربية والإنجليزية، وشعاراً تسويقياً (Slogan)، وسعراً مقترحاً بالريال العماني (ثلاث خانات عشرية)، مع وصف بيعي كامل.
- **إصدار بطاقات الابتكار وQR Code:** توليد رمز استجابة سريعة فوري لربط الابتكار بمتجر إلكتروني فوري قابل للمشاركة والشراء المباشر.

#### رابعاً: الأكاديمية والتمكين المعرفي:
- **قصص النجاح العُمانية:** استعراض تجارب ملهمة لشركات ومشاريع وطنية ناشئة لتشجيع الشباب والباحثين عن عمل.
- **الدورات التدريبية:** مسارات تعليمية سريعة في التجارة الإلكترونية، التسويق الرقمي، سلاسل الإمداد، وتأسيس المشاريع وفق اللوائح العُمانية وبنك التنمية العماني (قروض 0% فائدة) وترخيص الأعمال المنزلية عبر "استثمر بسهولة".

---

### 4. البنية التقنية والمعمارية البرمجية (إذا سألك عنها المحكمون أو المطورون):
- **الواجهة الأمامية (Frontend):** React 19، Vite، TypeScript، Tailwind CSS (سريعة، متجاوبة، داعمة بالكامل للغة العربية RTL مع الوضعين الداكن والفاتح).
- **قاعدة البيانات السحابية (Database):** Firebase Firestore (Realtime) لمزامنة الطلبات وتحديثات الكشك اللحظية دون إعادة تحميل الصفحة.
- **محرك الذكاء الاصطناعي (AI Core):** Google Gemini API لتحليل الصور المتعددة الوسائط (Vision)، التوليد النصي السريع، وجلسات الصوت الحية.
- **معالجة الصور:** Client-side Canvas Compression (ضغط وتصغير صور الكاميرا تلقائياً إلى 800px بصيغة JPEG لتسريع الاستجابة وتوفير استهلاك البيانات).
- **الاستضافة السحابية:** Vercel و Render و Google Cloud Platform مع النشر المؤتمت عبر GitHub.

---

### 5. نظام المؤشرات الاقتصادية التفاعلي (JSON Injection):
عندما يسألك الزائر أو لجنة التحكيم عن دراسة جدوى، حساب رأس مال، أو تكاليف مشروع، لخّص الحسبة شفهياً باقتضاب واختم جوابك دائماً بكود JSON التالي لتقوم الشاشة برسم المخططات البيانية Recharts فورياً:
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

// مصفوفة التحيات المتنوعة للردود السريعة
const WELCOME_GREETINGS = [
  "حيّاك الله وبياك في جناح منصة «مُنتَجي» بمهرجان عُمان للعلوم! 🇴🇲 أنا عوني، مستشارك الاقتصادي، كيف ننهض بفكرة مشروعك اليوم؟",
  "أهلاً وسهلاً بك بين أروقة الابتكار الوطني! معك عوني من منصة «مُنتَجي»، جاهزون لنقل فكرتك أو مجسمك إلى السوق، ما هو استفسارك؟",
  "مرحباً ترحيباً يفيض اعتزازاً بضيوفنا الكرام! أنا عوني، رفيقك الرقمي لتدشين المتاجر الفورية ودراسات الجدوى، بأي خطوة نبدأ؟",
  "يا مرحباً بالهمم الوطنية الواعدة! عوني في خدمتك لمنظومة «مُنتَجي» المتوافقة مع رؤية عُمان 2040، تفضل بسؤالك وفالك التوفيق!",
  "حيّاك الله وسلّمك في بوث «مُنتَجي»! أنا عوني، هنا لحساب تكاليفك وتسعير منتجاتك بدقة، كيف أخدم مشروعك اليوم؟"
];

function getRandomGreeting(): string {
  const index = Math.floor(Math.random() * WELCOME_GREETINGS.length);
  return WELCOME_GREETINGS[index];
}

// الردود الاحتياطية السريعة والذكية
function getFallbackAwniResponse(message: string): string {
  const clean = message.toLowerCase().trim();

  if (
    clean.includes("السلام") ||
    clean.includes("مرحبا") ||
    clean.includes("هلا") ||
    clean.includes("صباح") ||
    clean.includes("مساء") ||
    clean.includes("حيّاك") ||
    clean.includes("حياك")
  ) {
    return getRandomGreeting();
  }

  if (
    clean.includes("من أنتم") ||
    clean.includes("من انت") ||
    clean.includes("ما هي") ||
    clean.includes("عرفني") ||
    clean.includes("منتجي") ||
    clean.includes("مُنتَجي")
  ) {
    return `${getRandomGreeting()}\n\nمنصّة «مُنتَجي» هي منظومة وطنية ذكية متكاملة لريادة الأعمال والمشاريع العُمانية تواكب مستهدفات رؤية عُمان 2040. نجمع بين السوق العُماني الموثق ببطاقة "ريادة"، ومحرك استشارات الجدوى، وكشك الابتكار لتحويل المجسمات لمتاجر رقمية فورية. هل تود تجربة تدشين متجر لابتكارك؟`;
  }

  if (clean.includes("كوبون") || clean.includes("خصم") || clean.includes("كود")) {
    return `تسعدنا خدمتك! تدعم المنصة الكوبونات الوطنية المعتمدة:
1. OMAN2040 (خصم وطني خاص)
2. RIYADA10 (لدعم حاملي بطاقة ريادة)
3. MONTAJI15 (خصم تدشين المتجر والمنتجات)
يمكنك تطبيقها مباشرة في سلة المشتريات عند الدفع عبر بنك مسقط أو ثواني أو Apple Pay!`;
  }

  if (clean.includes("كشك") || clean.includes("بوث") || clean.includes("مجسم") || clean.includes("تصوير") || clean.includes("3d") || clean.includes("مهرجان العلوم")) {
    return `كشك الابتكار (Kiosk Store Engine) يحوّل مجسمك الأولي 3D في مهرجان العلوم إلى متجر رقمي في أقل من دقيقة! كل ما عليك هو التقاط صورة المجسم هنا في الكشك، وسيقوم الذكاء الاصطناعي باقتراح الاسم، الشعار التسويقي، والسعر بالريال العماني مع طباعة بطاقة الابتكار ورمز QR للمشاركة المباشرة. تفضل بتجربتها الآن!`;
  }

  if (clean.includes("تقنية") || clean.includes("برمجة") || clean.includes("كود") || clean.includes("معمارية") || clean.includes("react")) {
    return `بُنيت منصة مُنتَجي وفق أحدث معايير الويب:
- الواجهة: React 19 مع Vite و TypeScript و Tailwind CSS مع دعم RTL كامل.
- قاعدة البيانات: Firebase Firestore للمزامنة اللحظية للطلبات والكشك.
- الذكاء الاصطناعي: Google Gemini API (تحليل بصري وصوتي).
- معالجة الوسائط: ضغط الصور السحابي على العميل بدقة 800px لتقليل استهلاك البيانات وتسريع الاستجابة.`;
  }

  if (clean.includes("جدوى") || clean.includes("رأس مال") || clean.includes("ميزانية") || clean.includes("تكاليف") || clean.includes("أرباح") || clean.includes("تعادل")) {
    return `يسرني تقديم التحليل المالي والجدوى الاقتصادية بالريال العُماني (OMR):
- رأس المال التأسيسي المقترح: 4,500 ر.ع.
- نقطة التعادل: بيع 90 وحدة شهرياً (1,080 ر.ع. مبيعات لتغطية التكاليف).
- صافي الربح المتوقع: 620 ر.ع. شهرياً.

تم تحديث لوحة المؤشرات البيانية في الشاشة أمامك. ما هو حجم الإنتاج المستهدف لمشروعك؟
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

  return getRandomGreeting();
}

// 1. مسار المحادثة المتدفقة الفورية (Streaming)
app.post("/api/chat-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { message, history } = req.body;
  const ai = getAIClient();

  if (!message || typeof message !== "string") {
    res.write(`data: ${JSON.stringify({ chunk: getRandomGreeting() })}\n\n`);
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
        temperature: 0.7,
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

// 3. مسار تحويل النص إلى صوت (TTS)
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

// 4. مسار دراسة الجدوى الاقتصادية
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

    const prompt = `أنت "عوني"، المستشار الاقتصادي لمنصة «مُنتَجي» العمانية.
راجع أرقام الجدوى لمشروع "${projectName || "مشروع عُماني"}":
- التكاليف الثابتة الشهرية: ${fc} ر.ع.
- التكلفة المتغيرة للوحدة: ${vc} ر.ع.
- سعر بيع الوحدة: ${sp} ر.ع.
- نقطة التعادل المحسوبة: ${breakEvenUnits} وحدة (${breakEvenRevenue?.toFixed(2)} ر.ع.)
- المبيعات الشهرية المستهدفة: ${mt} وحدة
- صافي الربح المتوقع: ${expectedProfit.toFixed(2)} ر.ع.

قدم تقييماً شفهياً مقتضباً وذكياً بنكهة عمانية محفزة وواضحة، مع توجيه ذكي للاستفادة من بطاقة ريادة أو سوق منصة مُنتَجي.`;

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
    console.log(`🇴🇲 عوني - منصة مُنتَجي server running on port ${PORT} with Gemini Live API support`);
  });
}

startServer();
