import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Coffee,
  Dumbbell,
  Car,
  ShoppingBag,
  TrendingUp,
  PiggyBank,
  CircleDollarSign,
  ChevronDown,
  LineChart,
  Lock,
  Coins,
  Briefcase,
  Wallet,
  Zap,
  PlusCircle,
  AlertCircle,
  MapPin,
  Settings as SettingsIcon
} from "lucide-react";
import TransactionModal from "../components/TransactionModal";
import { db } from "../lib/db";

const iconMap = {
  Coffee,
  Dumbbell,
  Car,
  ShoppingBag,
  TrendingUp,
  PiggyBank,
  CircleDollarSign,
  LineChart,
  Lock,
  Coins,
  Briefcase,
  Wallet,
  Zap,
  PlusCircle,
};

const COLORS = {
  expense: ["#EF4444", "#F59E0B", "#FCA5A5", "#B91C1C", "#991B1B"],
  investment: ["#6366F1", "#8B5CF6", "#A5B4FC", "#4338CA", "#3730A3"],
  income: ["#10B981", "#34D399", "#059669", "#065F46", "#064E3B"],
};

export default function Dashboard({ transactions, isLoading, onRefresh }) {
  // 1. Month Selector Logic
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label: d.toLocaleString("default", { month: "long", year: "numeric" }),
        month: d.getMonth(),
        year: d.getFullYear(),
        value: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }
    return options;
  }, []);

  const [selectedMonthValue, setSelectedMonthValue] = useState(monthOptions[0].value);
  const [activeType, setActiveType] = useState("expense");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [settings, setSettings] = useState(db.getSettings());

  useEffect(() => {
    setSettings(db.getSettings());
  }, [transactions]);

  const selectedOption = useMemo(() => {
    return monthOptions.find(opt => opt.value === selectedMonthValue) || monthOptions[0];
  }, [selectedMonthValue, monthOptions]);

  // 2. Filter transactions for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === selectedOption.month &&
        txDate.getFullYear() === selectedOption.year
      );
    });
  }, [transactions, selectedOption]);

  // 3. Prepare Chart Data for Active Type
  const chartData = useMemo(() => {
    const dataMap = monthTransactions
      .filter((tx) => tx.flow_type === activeType)
      .reduce((acc, tx) => {
        const catName = tx.categories?.name || "Other";
        acc[catName] = (acc[catName] || 0) + tx.amount;
        return acc;
      }, {});

    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [monthTransactions, activeType]);

  const typeTotal = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.flow_type === activeType)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [monthTransactions, activeType]);

  // 4. Budget Calculation
  const budgetProgress = useMemo(() => {
    const monthKey = `${selectedOption.year}-${selectedOption.month}`;
    const monthlyBudget = db.getBudgetForMonth(monthKey);

    if (!monthlyBudget || monthlyBudget <= 0) return null;

    const currentMonthExpenses = monthTransactions
      .filter(tx => tx.flow_type === "expense")
      .reduce((acc, tx) => acc + tx.amount, 0);
    const percentage = Math.min((currentMonthExpenses / monthlyBudget) * 100, 100);
    const remaining = Math.max(monthlyBudget - currentMonthExpenses, 0);
    return { percentage, remaining, spent: currentMonthExpenses, limit: monthlyBudget };
  }, [monthTransactions, selectedOption]);

  if (isLoading) {
    return (
      <div className="p-6 text-emerald-400 font-medium h-full flex items-center justify-center bg-gray-950">
        Loading your data...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Premium Top Bar */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center shrink-0">
        <div className="w-10"></div> {/* Spacer for symmetry */}

        <div className="relative inline-block">
          <select
            value={selectedMonthValue}
            onChange={(e) => setSelectedMonthValue(e.target.value)}
            className="appearance-none bg-transparent text-xl font-black uppercase tracking-widest text-white pr-6 outline-none cursor-pointer text-center"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-base">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={16} strokeWidth={3} />
        </div>

        <Link
          to="/settings"
          className="p-2.5 bg-gray-900/50 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-gray-800"
        >
          <SettingsIcon size={20} strokeWidth={2} />
        </Link>
      </header>

      {/* Pie Chart Section */}
      <div className="relative h-56 w-full flex items-center justify-center shrink-0 mt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1000}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[activeType][index % COLORS[activeType].length]}
                    className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#F3F4F6', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value, name) => {
                  const percentage = typeTotal > 0 ? ((value / typeTotal) * 100).toFixed(1) : 0;
                  return [`₹${value.toLocaleString("en-IN")} (${percentage}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-gray-900 rounded-full h-40 w-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">No Data</span>
          </div>
        )}

        <div className="absolute flex flex-col items-center pointer-events-none">
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{activeType}</p>
          <p className="text-2xl font-black text-white">₹{typeTotal.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Type Selector (Docked Style) */}
      <div className="px-8 py-4 shrink-0">
        <div className="bg-gray-900/40 p-1.5 rounded-[2rem] border border-white/5 flex shadow-inner">
          {["expense", "income", "investment"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                activeType === type
                  ? type === "expense"
                    ? "bg-red-500 text-white shadow-[0_5px_15px_rgba(239,68,68,0.3)]"
                    : type === "investment"
                    ? "bg-indigo-500 text-white shadow-[0_5px_15px_rgba(99,102,241,0.3)]"
                    : "bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Progress Bar */}
      {activeType === "expense" && budgetProgress && (
        <div className="px-8 py-2 shrink-0">
          <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
                <AlertCircle size={14} className="text-emerald-500" />
                Limit
              </span>
              <span className="text-xs font-black text-white">
                ₹{budgetProgress.remaining.toLocaleString("en-IN")} <span className="text-gray-500 text-[10px]">Left of ₹{budgetProgress.limit.toLocaleString("en-IN")}</span>
              </span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner">
              <div
                className={`h-full transition-all duration-1000 ease-out ${budgetProgress.percentage > 90 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                style={{ width: `${budgetProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 mt-4">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Timeline</h3>
          <div className="h-[1px] flex-1 bg-gray-900 mx-4"></div>
          <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10 uppercase tracking-tighter">
            {monthTransactions.length} logs
          </span>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="text-center p-12 bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-900 text-gray-700 italic text-xs uppercase tracking-widest font-black">
            No activity found
          </div>
        ) : (
          <div className="space-y-4">
            {monthTransactions.map((tx) => {
              const Icon = iconMap[tx.categories?.icon] || CircleDollarSign;
              const type = tx.flow_type;

              return (
                <div
                  key={tx.id}
                  onClick={() => setEditingTransaction(tx)}
                  className="group flex items-center justify-between bg-gray-900/30 p-5 rounded-[2rem] border border-white/5 hover:bg-gray-900/50 hover:border-white/10 active:scale-[0.97] transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-2xl bg-gray-950 border border-white/5 shadow-xl transition-transform group-hover:scale-110 ${
                        type === 'investment' ? "text-indigo-400" : type === 'expense' ? "text-red-400" : "text-emerald-400"
                      }`}>
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-200 text-sm tracking-tight">
                          {tx.categories?.name || "Unknown"}
                        </p>
                        {tx.trip && (
                          <span className="bg-indigo-500/10 text-indigo-400 text-[7px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                            {tx.trip.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })} • {type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-base tracking-tighter ${
                        type === 'investment' ? "text-indigo-400" : type === 'expense' ? "text-gray-200" : "text-emerald-400"
                      }`}>
                      {type === 'expense' || type === 'investment' ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onTransactionAdded={onRefresh}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
