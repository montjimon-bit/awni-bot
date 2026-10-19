import React, { useState } from "react";
import { Calculator, Sparkles, TrendingUp, DollarSign, PieChart, ShieldCheck, ArrowRight } from "lucide-react";
import { CyberSoundFX } from "../utils/audioUtils";

interface FeasibilityCalculatorProps {
  onAskAwni: (consultationPrompt: string) => void;
}

export const FeasibilityCalculator: React.FC<FeasibilityCalculatorProps> = ({ onAskAwni }) => {
  const [projectName, setProjectName] = useState("مشروع تجارة اللبان الحوجري الفاخر");
  const [fixedCosts, setFixedCosts] = useState<number>(180); // Rent/licenses/utilities in OMR
  const [variableCost, setVariableCost] = useState<number>(4.5); // Raw material/packaging per unit in OMR
  const [sellingPrice, setSellingPrice] = useState<number>(12.0); // Selling price per unit in OMR
  const [monthlyTarget, setMonthlyTarget] = useState<number>(60); // Monthly units target

  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Calculations
  const unitContribution = sellingPrice - variableCost;
  const breakEvenUnits = unitContribution > 0 ? Math.ceil(fixedCosts / unitContribution) : 0;
  const breakEvenRevenue = breakEvenUnits * sellingPrice;
  const monthlyRevenue = monthlyTarget * sellingPrice;
  const totalCosts = fixedCosts + monthlyTarget * variableCost;
  const expectedProfit = monthlyRevenue - totalCosts;
  const profitMargin = monthlyRevenue > 0 ? ((expectedProfit / monthlyRevenue) * 100).toFixed(1) : "0";
  const marginOfSafety =
    monthlyTarget > breakEvenUnits
      ? (((monthlyTarget - breakEvenUnits) / monthlyTarget) * 100).toFixed(1)
      : "0";

  // Pre-configured Omani business templates
  const templates = [
    {
      name: "تجارة اللبان الحوجري (ظفار)",
      fixed: 150,
      variable: 4.0,
      price: 12.0,
      target: 70,
    },
    {
      name: "معمل حلوى عمانية سلطانية (بركاء)",
      fixed: 320,
      variable: 2.2,
      price: 6.5,
      target: 150,
    },
    {
      name: "منحل عسل سدر جبلي (الجبل الأخضر)",
      fixed: 210,
      variable: 9.0,
      price: 24.0,
      target: 35,
    },
    {
      name: "ورشة صياغة فضيات ونقوش (نزوى)",
      fixed: 280,
      variable: 14.0,
      price: 38.0,
      target: 25,
    },
  ];

  const applyTemplate = (tmpl: typeof templates[0]) => {
    CyberSoundFX.playBlip();
    setProjectName(tmpl.name);
    setFixedCosts(tmpl.fixed);
    setVariableCost(tmpl.variable);
    setSellingPrice(tmpl.price);
    setMonthlyTarget(tmpl.target);
    setAiReview(null);
  };

  const handleConsultAwni = async () => {
    CyberSoundFX.playSend();
    setIsReviewing(true);
    try {
      const res = await fetch("/api/feasibility-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          fixedCosts,
          variableCost,
          sellingPrice,
          monthlyTarget,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiReview(data.reviewText);
        // Also trigger consultation in the main console
        onAskAwni(
          `عوني، راجعت ميزانية مشروع "${projectName}" بقيمة تكاليف ثابتة ${fixedCosts} ر.ع. وهامش ربح للوحدة ${unitContribution.toFixed(2)} ر.ع. ونقطة تعادل ${breakEvenUnits} وحدة. ما هو رأيك وتوجيهك لرواد الأعمال؟`
        );
      }
    } catch {
      setAiReview("يا هلا بك! مشروعك ذو مؤشرات جيدة، وأوصيك بالتركيز على تسويق أول دفعة في سوق منصة منتجي الوطني لتحقيق نقطة التعادل بأسرع وقت.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">
              حاسبة الجدوى الاقتصادية ونقطة التعادل
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            حساب دقيق بالريال العماني (OMR) للمشاريع الوطنية والأسر المنتجة وفق معايير ريادة
          </p>
        </div>

        {/* Templates */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 ml-1">نماذج جاهزة:</span>
          {templates.map((t, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(t)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/60 transition-colors"
            >
              {t.name.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Inputs & Live Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              اسم المشروع العُماني
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="مثال: مشروع إنتاج اللبان المعطر"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fixed costs */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                التكاليف الثابتة شهرياً (ر.ع.)
                <span className="block text-[10px] text-slate-400">إيجار، رسوم تراخيص، تسويق، فواتير</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono-cyber"
                />
                <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">ر.ع.</span>
              </div>
            </div>

            {/* Variable cost */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                تكلفة إنتاج الوحدة (ر.ع.)
                <span className="block text-[10px] text-slate-400">مواد خام، عبوات، شحن، يد عاملة</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={variableCost}
                  onChange={(e) => setVariableCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono-cyber"
                />
                <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">ر.ع.</span>
              </div>
            </div>

            {/* Selling price */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                سعر بيع الوحدة للجمهور (ر.ع.)
                <span className="block text-[10px] text-slate-400">السعر المقترح في السوق أو المنصة</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono-cyber"
                />
                <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">ر.ع.</span>
              </div>
            </div>

            {/* Monthly target */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                المبيعات المستهدفة شهرياً (وحدة)
                <span className="block text-[10px] text-slate-400">كم حبة أو طرد تخطط لبيعه؟</span>
              </label>
              <input
                type="number"
                min="1"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono-cyber"
              />
            </div>
          </div>

          {/* Quick guidance note */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300/90 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <p>
              💡 <strong>نصيحة ريادة:</strong> إذا كان مشروعك منزلياً، يمكنك تسجيله تحت &quot;ترخيص الأعمال المنزلية&quot; لتوفير تكلفة استئجار مقر تجاري وتقليص التكاليف الثابتة إلى أقل من 30 ر.ع. شهرياً!
            </p>
          </div>
        </div>

        {/* Right Computed Metrics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              المؤشرات المالية الحيوية
            </h4>

            {/* Metric 1: Break-even units */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">نقطة التعادل (كمية)</span>
                <span className="text-[10px] text-slate-500">الحد الأدنى لتغطية التكاليف</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono-cyber text-emerald-400">
                  {breakEvenUnits}
                </span>
                <span className="text-xs text-slate-400 mr-1">وحدة / شهرياً</span>
              </div>
            </div>

            {/* Metric 2: Break-even revenue */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">نقطة التعادل (مبيعات)</span>
                <span className="text-[10px] text-slate-500">حجم المبيعات بالريال لتغطية المصاريف</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono-cyber text-amber-400">
                  {breakEvenRevenue.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 mr-1">ر.ع.</span>
              </div>
            </div>

            {/* Metric 3: Expected monthly profit */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              expectedProfit >= 0 ? "bg-emerald-950/30 border-emerald-500/30" : "bg-rose-950/30 border-rose-500/30"
            }`}>
              <div>
                <span className="text-xs text-slate-300 block font-medium">الربح الصافي المتوقع</span>
                <span className="text-[10px] text-slate-400">
                  عند بيع {monthlyTarget} وحدة (هامش {profitMargin}%)
                </span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black font-mono-cyber ${
                  expectedProfit >= 0 ? "text-emerald-300" : "text-rose-400"
                }`}>
                  {expectedProfit.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 mr-1">ر.ع.</span>
              </div>
            </div>

            {/* Margin of safety */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-400">
              <span>هامش الأمان التقديري:</span>
              <span className="font-mono-cyber text-emerald-400 font-semibold">{marginOfSafety}%</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleConsultAwni}
            disabled={isReviewing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
            <span>{isReviewing ? "عوني يحلل الجدوى..." : "استشارة عوني في هذا الحساب"}</span>
          </button>
        </div>
      </div>

      {/* AI Review Drawer if available */}
      {aiReview && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>تقييم وتوجيه المستشار "عوني":</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {aiReview}
          </p>
        </div>
      )}
    </div>
  );
};
