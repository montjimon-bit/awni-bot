import React, { useState } from "react";
import { Award, FileText, Banknote, CheckCircle, ExternalLink, HelpCircle, ArrowRight } from "lucide-react";
import { CyberSoundFX } from "../utils/audioUtils";

interface RiyadaGuideProps {
  onAskAwni: (prompt: string) => void;
}

export const RiyadaGuide: React.FC<RiyadaGuideProps> = ({ onAskAwni }) => {
  const [activeTab, setActiveTab] = useState<"riyada" | "home-license" | "bank">("riyada");

  const [checklist, setChecklist] = useState({
    omaniNational: true,
    fullTime: false,
    commercialRegister: true,
    feasibilityReady: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    CyberSoundFX.playBlip();
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConsult = (topic: string) => {
    CyberSoundFX.playSend();
    onAskAwni(topic);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">
              دليل بطاقة ريادة 2026 وقروض بنك التنمية العماني
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دليلك الاستشاري الشامل لتمكين رواد الأعمال والمشاريع المنزلية في سلطنة عُمان
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              CyberSoundFX.playBlip();
              setActiveTab("riyada");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "riyada"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            بطاقة ريادة 2026
          </button>
          <button
            onClick={() => {
              CyberSoundFX.playBlip();
              setActiveTab("home-license");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "home-license"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ترخيص الأعمال المنزلية
          </button>
          <button
            onClick={() => {
              CyberSoundFX.playBlip();
              setActiveTab("bank");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "bank"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            قروض بنك التنمية (بدون فوائد)
          </button>
        </div>
      </div>

      {/* Tab 1: بطاقة ريادة 2026 */}
      {activeTab === "riyada" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Requirements Card */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                شروط الحصول على بطاقة ريادة 2026
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>التفرغ التام:</strong> أن يكون صاحب العمل أو أحد الشركاء متفرغاً لإدارة المؤسسة ومسجلاً لدى التأمينات الاجتماعية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>سجل تجاري نشط:</strong> إصدار السجل التجاري عبر منصة &quot;استثمر بسهولة&quot; التابعة لوزارة التجارة والصناعة وترويج الاستثمار.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>تصنيف المؤسسة:</strong> أن تكون صغرى أو متوسّطة أو متناهية الصغر وفق معايير ريادة.</span>
                </li>
              </ul>
            </div>

            {/* Benefits Card */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
                <Award className="w-4 h-4" />
                المزايا والحوافز الحكومية
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span><strong>أولوية المناقصات:</strong> تخصيص ما لا يقل عن 10% من المشتريات والمناقصات الحكومية لحاملي بطاقة ريادة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span><strong>الأراضي بحق الانتفاع:</strong> أولوية التقديم على مخططات الأراضي الصناعية والتجارية والزراعية بأسعار رمزية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span><strong>إعفاءات وتسهيلات:</strong> إعفاءات من رسوم بعض التراخيص والخدمات وتسهيل استقدام القوى العاملة الماهرة.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Readiness Checklist */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="text-xs font-bold text-emerald-300">هل أنت مستعد للتقديم على بطاقة ريادة 2026؟</h5>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.omaniNational}
                    onChange={() => toggleCheck("omaniNational")}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>مواطن عُماني</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.fullTime}
                    onChange={() => toggleCheck("fullTime")}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>متفرغ لإدارة المشروع</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.commercialRegister}
                    onChange={() => toggleCheck("commercialRegister")}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>سجل تجاري نشط</span>
                </label>
              </div>
            </div>

            <button
              onClick={() =>
                handleConsult(
                  "عوني، كيف استخرج بطاقة ريادة 2026 خطوة بخطوة لمشروعي الصغير، وما هي المستندات المطلوبة بالتفصيل؟"
                )
              }
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>استشر عوني في بطاقة ريادة</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: ترخيص الأعمال المنزلية */}
      {activeTab === "home-license" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <span className="text-2xl block mb-2">🏠</span>
              <h4 className="text-sm font-bold text-white mb-1">بدون إيجار مقر</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                وفر تكاليف استئجار المحلات والمكاتب وابدأ مشروعك التجاري من منزلك بصفة قانونية ورسمية كاملة.
              </p>
            </div>
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <span className="text-2xl block mb-2">📑</span>
              <h4 className="text-sm font-bold text-white mb-1">أكثر من 40 نشاطاً</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يشمل صناعة البخور واللبان، الحلويات العمانية، الخياطة والتطريز، الأعمال الحرفية، والطباعة والتصميم.
              </p>
            </div>
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <span className="text-2xl block mb-2">💳</span>
              <h4 className="text-sm font-bold text-white mb-1">دفع إلكتروني آمن</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                إمكانية فتح حساب بنكي تجاري واستخدام بوابات الدفع الإلكتروني وبيع منتجاتك على منصة &quot;مُنتجي&quot; الوطنية.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-300">
              ترخيص الأعمال المنزلية يصدر إلكترونياً بالكامل عبر بوابة <strong>استثمر بسهولة</strong> خلال أقل من 15 دقيقة وبكلفة رمزية.
            </p>
            <button
              onClick={() =>
                handleConsult("عوني، ما هي الأنشطة المسموحة في ترخيص الأعمال المنزلية وكيف أسجل عبر استثمر بسهولة؟")
              }
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              اسأل عوني عن الترخيص المنزلي
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: قروض بنك التنمية العماني */}
      {activeTab === "bank" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4" />
                مميزات قروض بنك التنمية (بدون فوائد)
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>نسبة الفائدة: 0%</strong> (قروض تنموية ميسرة للمشاريع المتناهية الصغر والصغيرة).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>سقف التمويل:</strong> يصل حتى 250,000 ر.ع. للمشاريع الإنتاجية والصناعية والزراعية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>فترة سماح مرنة:</strong> تبدأ من 6 إلى 24 شهراً قبل بدء سداد الأقساط الشهرية.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                المستندات المطلوبة للتقديم
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>دراسة جدوى اقتصادية مبسطة تثبت قدرة المشروع على الاستدامة ونقطة التعادل.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>السجل التجاري أو ترخيص الأعمال المنزلية الصادر من الجهات المختصة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>عروض أسعار للمعدات والآلات أو المواد الخام المراد تمويلها.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <p className="text-xs text-cyan-200">
              💡 <strong>عوني جاهز لمساعدتك:</strong> يمكن لعوني صياغة بنود دراسة الجدوى وتحديد التمويل المطلوب لتقديمه لبنك التنمية العماني!
            </p>
            <button
              onClick={() =>
                handleConsult("عوني، كيف أجهز ملف التقديم لقروض بنك التنمية العماني بدون فوائد، وما هي نصائحك لتسريع الموافقة؟")
              }
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              استشر عوني في تمويل بنك التنمية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
