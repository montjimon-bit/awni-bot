import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  X,
  Minimize2,
  Maximize2,
  DollarSign,
  Layers,
  ChevronDown,
} from "lucide-react";

export interface CapitalItem {
  name: string;
  amount: number;
}

export interface BudgetItem {
  name: string;
  value: number;
  color?: string;
}

export interface EconomicDataPayload {
  projectName?: string;
  currency?: string;
  totalCapitalOMR?: number;
  breakEvenUnits?: number;
  breakEvenRevenueOMR?: number;
  expectedProfitOMR?: number;
  capitalAllocation: CapitalItem[];
  budgetBreakdown: BudgetItem[];
}

interface EconomicDataDashboardProps {
  data: EconomicDataPayload;
  onClose?: () => void;
}

const DONUT_COLORS = ["#10B981", "#06B6D4", "#F59E0B", "#8B5CF6", "#EC4899"];

export const EconomicDataDashboard: React.FC<EconomicDataDashboardProps> = ({
  data,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"both" | "capital" | "budget">("both");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const currency = data.currency || "ر.ع.";

  // Format tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-emerald-500/50 p-2.5 rounded-xl shadow-xl text-xs text-white">
          <p className="font-bold text-emerald-300">{payload[0].payload.name}</p>
          <p className="font-mono mt-1 text-slate-200">
            {payload[0].value.toLocaleString()} {currency}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-cyan-500/50 p-2.5 rounded-xl shadow-xl text-xs text-white">
          <p className="font-bold text-cyan-300">{payload[0].name}</p>
          <p className="font-mono mt-1 text-slate-200">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 sm:right-8 z-30 animate-fadeIn">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-xl backdrop-blur-md hover:bg-emerald-950/60 transition-all cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>المؤشرات الاقتصادية ({data.totalCapitalOMR ? `${data.totalCapitalOMR.toLocaleString()} ${currency}` : "مُفعّلة"})</span>
          <Maximize2 className="w-3.5 h-3.5 ml-1 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-3 bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-2xl transition-all animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>لوحة البيانات الاقتصادية الذكية</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
                {data.projectName || "دراسة جدوى عُمانية"}
              </span>
            </h4>
            <span className="text-[10px] text-slate-400">
              تحليل رأس المال والميزانية ونقطة التعادل بالريال العُماني (OMR)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Tab filter */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setActiveTab("both")}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === "both" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              شامل
            </button>
            <button
              onClick={() => setActiveTab("capital")}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === "capital" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              رأس المال
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === "budget" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              الميزانية
            </button>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="تصغير"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {data.totalCapitalOMR !== undefined && (
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">إجمالي رأس المال</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                {data.totalCapitalOMR.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">{currency}</span>
            </div>
          </div>
        )}

        {data.breakEvenUnits !== undefined && (
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">نقطة التعادل</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-cyan-400">
                {data.breakEvenUnits.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">وحدة/شهرياً</span>
            </div>
          </div>
        )}

        {data.breakEvenRevenueOMR !== undefined && (
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">مبيعات التعادل</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
                {data.breakEvenRevenueOMR.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">{currency}</span>
            </div>
          </div>
        )}

        {data.expectedProfitOMR !== undefined && (
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">صافي الربح المتوقع</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-300">
                +{data.expectedProfitOMR.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">{currency}</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Bar Chart for Capital Allocation */}
        {(activeTab === "both" || activeTab === "capital") && (
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>توزيع رأس المال والتأسيس ({currency})</span>
              </h5>
              <span className="text-[10px] text-slate-400 font-mono">حسب بنود المشروع</span>
            </div>
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.capitalAllocation} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={{ stroke: "#334155" }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 2: Donut Chart for Budget Breakdown */}
        {(activeTab === "both" || activeTab === "budget") && (
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5" />
                <span>هيكل الميزانية والتكاليف (%)</span>
              </h5>
              <span className="text-[10px] text-slate-400 font-mono">النسب المئوية</span>
            </div>
            <div className="w-full h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.budgetBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.budgetBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-[10px] text-slate-300 mr-1">{value}</span>}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
