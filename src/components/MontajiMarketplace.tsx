import React, { useState } from "react";
import { ShoppingBag, Truck, MapPin, Award, CheckCircle2, MessageSquareText, Sparkles, Star } from "lucide-react";
import { CyberSoundFX } from "../utils/audioUtils";

interface MontajiMarketplaceProps {
  onAskAwni: (prompt: string) => void;
}

export const OMANI_GOVERNORATES = [
  "محافظة مسقط",
  "محافظة ظفار",
  "محافظة مسندم",
  "محافظة الداخلية",
  "محافظة شمال الباطنة",
  "محافظة جنوب الباطنة",
  "محافظة شمال الشرقية",
  "محافظة جنوب الشرقية",
  "محافظة الظاهرة",
  "محافظة البريمي",
  "محافظة الوسطى",
];

export interface Product {
  id: string;
  name: string;
  arabicSubtitle: string;
  region: string;
  priceOMR: number;
  rating: number;
  category: string;
  badge: string;
  description: string;
  features: string[];
  awniTip: string;
  imageIcon: string;
}

export const OMANI_PRODUCTS: Product[] = [
  {
    id: "hojari-frankincense",
    name: "لبان حوجري ظفاري ملكي (نخب أول)",
    arabicSubtitle: "أجود أنواع اللبان الطبيعي في العالم من جبال حوجر",
    region: "صلالة · محافظة ظفار",
    priceOMR: 14.5,
    rating: 4.9,
    category: "منتجات طبيعية وعطور",
    badge: "الأكثر طلباً محلياً ودولياً",
    description: "لبان حوجري نقي 100% مستخرج بعناية من أشجار اللبان في وادي حوجر بظفار. يتميز بنقائه اللوني الفضي المخضر ورائحته الزكية الفواحة الصافية المناسبة للتبخير والاستخدام الطبيعي.",
    features: ["نقاء أخضر فضي نخب أول", "مستخرج ومصفى يدوياً", "معبأ في أكياس مخملية فاخرة"],
    awniTip: "اللبان الحوجري فرصة تصديرية ذهبية لرواد الأعمال، ونسبة العائد التجاري فيه تتجاوز 45% عند التغليف الراقي.",
    imageIcon: "🌿",
  },
  {
    id: "sidr-honey",
    name: "عسل سدر جبلي أصيل (طبيعي 100%)",
    arabicSubtitle: "مقطوف من أشجار السدر البرية في قمم الجبل الأخضر",
    region: "الجبل الأخضر · محافظة الداخلية",
    priceOMR: 26.0,
    rating: 5.0,
    category: "منتجات غذائية وزراعية",
    badge: "فحص مخبري معتمد",
    description: "عسل سدر بري مفحوص ومطابق للمواصفات والمقاييس العمانية والخليجية. غني بالمعادن ومضادات الأكسدة وبقوام لزج كثيف ونكهة عطرية غنية تميز طبيعة السدر الجبلي العماني.",
    features: ["إنتاج مناحل عمانية موثقة", "خالٍ تماماً من التغذية السكرية", "شهادة فحص جودة معتمدة"],
    awniTip: "مشروع المناحل المنزلية والمزارع مشمول بدعم قروض بنك التنمية العماني بدون فوائد حتى 20,000 ر.ع.",
    imageIcon: "🍯",
  },
  {
    id: "royal-halwa",
    name: "حلوى سلطانية عمانية فاخرة بالزعفران",
    arabicSubtitle: "مطبوخة على الحطب بالهيل الأصلي والمكسرات والسمن الخالص",
    region: "ولاية بركاء · محافظة جنوب الباطنة",
    priceOMR: 7.5,
    rating: 4.9,
    category: "مأكولات وحلويات تراثية",
    badge: "ضيافة عُمانية أصيلة",
    description: "الحلوى العمانية التقليدية المطبوخة على أصولها في مراجل النحاس باستخدام السمن العماني النقي، زعفران نقيل، ماء ورد الجبل الأخضر، ومكسرات الكاجو واللوز المحمصة.",
    features: ["طبخ يومي طازج", "ماء ورد الجبل الأخضر المقطر", "وعاء فخاري لحفظ النكهة"],
    awniTip: "الحلوى العمانية منتج سريع الدوران برأس مال تشغيلي منخفض؛ نقطة تعادله تتحقق خلال 14 يوماً من التشغيل اليومي.",
    imageIcon: "🏺",
  },
  {
    id: "silver-khanjar",
    name: "مشغولات وفضيات ونقوش الخنجر العماني",
    arabicSubtitle: "صياغة يدوية دقيقة بنقوش نزوى وظفار التراثية",
    region: "سوق نزوى · محافظة الداخلية",
    priceOMR: 45.0,
    rating: 4.9,
    category: "حرف وصناعات إبداعية",
    badge: "حرفة يدوية وطنية",
    description: "تحف وميداليات وخناجر مصوغة من الفضة الخالصة عيار 925 بأيدي حرفيين عمانيين متوارثين للمهنة. نقش يدوي دقيق يعكس الهوية والشهامة العمانية.",
    features: ["فضة عمانية عيار 925", "نقوش تراثية يدوية معتمدة", "شهادة أصالة وحرفية"],
    awniTip: "الحرف الفضية تحظى بدعم 100% من هيئة المؤسسات الصغيرة والمتوسطة وريادة مع تمويل معارض داخل وخارج السلطنة.",
    imageIcon: "🗡️",
  },
  {
    id: "bahla-pottery",
    name: "فخار بهلاء التراثي المكفول (جحال ومجامر)",
    arabicSubtitle: "مصنوع من طين بهلاء الفريد المدرج على قائمة اليونسكو",
    region: "ولاية بهلاء · محافظة الداخلية",
    priceOMR: 11.0,
    rating: 4.8,
    category: "خزف وفخار عماني",
    badge: "تراث عالمي (UNESCO)",
    description: "أوانٍ فخارية وجحال ومجامر بخور مصنوعة يدوياً بحرفية بهلاء العريقة التي تعود لآلاف السنين. تحفظ برودة الماء ونقاء البخور بتصميم عملي وديكور فاخر.",
    features: ["طين طبيعي حراري", "صناعة حرفية أصيلة ومتقنة", "صديق للبيئة 100%"],
    awniTip: "مشروع الفخاريات المنزلية الحديثة يحظى بطلب مرتفع للفنادق والمقاهي العصرية المهتمة بالهوية العمانية.",
    imageIcon: "🏺",
  },
];

export const MontajiMarketplace: React.FC<MontajiMarketplaceProps> = ({ onAskAwni }) => {
  const [selectedGovernorate, setSelectedGovernorate] = useState(OMANI_GOVERNORATES[0]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const handleOrderSample = (product: Product) => {
    CyberSoundFX.playResponse();
    setOrderNotice(
      `تم تسجيل طلب عينة من "${product.name}" بنجاح! سيتم التوصيل إلى "${selectedGovernorate}" خلال 24-48 ساعة عبر شركاء الشحن الوطنيين.`
    );
    setTimeout(() => setOrderNotice(null), 8000);
  };

  const handleAskAwniAboutProduct = (product: Product) => {
    CyberSoundFX.playSend();
    onAskAwni(
      `عوني، حاب أعرف أكثر عن الجدوى الاقتصادية وتسويق "${product.name}" من ${product.region}. كيف أبدأ مشروعاً في هذا المجال؟`
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      {/* Header and Governorate Delivery Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">
              سوق مُنتجي الرقمي الوطني
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            منصة التسويق والبيع للمشاريع الوطنية والمنتجات العمانية الفاخرة
          </p>
        </div>

        {/* 11 Governorates Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-700/80">
          <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px]">الشحن لكافة المحافظات الـ 11:</span>
            <select
              value={selectedGovernorate}
              onChange={(e) => {
                CyberSoundFX.playBlip();
                setSelectedGovernorate(e.target.value);
              }}
              className="bg-transparent text-emerald-300 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {OMANI_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov} className="bg-slate-900 text-slate-200">
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {orderNotice && (
        <div className="my-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-medium">{orderNotice}</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {OMANI_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20 transition-all group"
          >
            <div>
              {/* Top Meta info */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="text-emerald-400 font-medium">{product.badge}</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono-cyber font-bold">{product.rating}</span>
                </div>
              </div>

              {/* Title & icon */}
              <div className="flex items-start gap-3 mt-1 mb-2">
                <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                  {product.imageIcon}
                </span>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{product.region}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                {product.description}
              </p>

              {/* Awni's Economic Tip */}
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300/90 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-300">نصيحة عوني:</strong> {product.awniTip}
                </p>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">السعر الوطني</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono-cyber text-emerald-400">
                    {product.priceOMR.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">ر.ع.</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAskAwniAboutProduct(product)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-700 transition-colors"
                  title="استشر عوني في هذا المنتج"
                >
                  <MessageSquareText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOrderSample(product)}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>طلب عينة</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
