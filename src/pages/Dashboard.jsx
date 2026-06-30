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
  Settings as SettingsIcon,
  Search,
  X
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

export default function Dashboard({ transactions, isLoading, onRefresh, activeType, setActiveType }) {
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
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchQuery] = useState(false);

  const selectedOption = useMemo(() => {
    return monthOptions.find(opt => opt.value === selectedMonthValue) || monthOptions[0];
  }, [selectedMonthValue, monthOptions]);

  // 2. Filter transactions for the selected month AND search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const isCorrectMonth = txDate.getMonth() === selectedOption.month &&
                             txDate.getFullYear() === selectedOption.year;

      if (!isCorrectMonth) return false;

      if (!searchQuery.trim()) return true;

      const searchLower = searchQuery.toLowerCase();
      const categoryMatch = tx.categories?.name.toLowerCase().includes(searchLower);
      const amountMatch = tx.amount.toString().includes(searchLower);
      const tripMatch = tx.trip?.name.toLowerCase().includes(searchLower);

      return categoryMatch || amountMatch || tripMatch;
    });
  }, [transactions, selectedOption, searchQuery]);

  // 3. Prepare Chart Data for Active Type (only current month, search doesn't affect chart usually but could)
  const monthTransactions = useMemo(() => {
      return transactions.filter(tx => {
          const d = new Date(tx.date);
          return d.getMonth() === selectedOption.month && d.getFullYear() === selectedOption.year;
      });
  }, [transactions, selectedOption]);

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

  // Dynamic colors from CSS variables
  const getThemeColor = (type) => {
    if (type === 'expense') return 'var(--accent-tertiary)';
    if (type === 'investment') return 'var(--accent-secondary)';
    return 'var(--accent-primary)';
  };

  if (isLoading) {
    return (
      <div className="p-6 text-[var(--accent-primary)] font-medium h-full flex items-center justify-center bg-gray-950">
        Loading your data...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Premium Top Bar */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center shrink-0">
        <button
          onClick={() => setIsSearchQuery(!isSearchOpen)}
          className={`p-2.5 rounded-2xl transition-all ${isSearchOpen ? 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)]' : 'bg-gray-900/50 text-gray-500 border border-white/5'}`}
        >
          <Search size={20} />
        </button>

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
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--accent-primary)] pointer-events-none" size={16} strokeWidth={3} />
        </div>

        <Link
          to="/settings"
          className="p-2.5 bg-gray-900/50 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all"
        >
          <SettingsIcon size={20} />
        </Link>
      </header>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
          <div className="px-6 pb-4 animate-in slide-in-from-top duration-300">
              <div className="relative">
                <input
                    type="text"
                    placeholder="Search category, amount or trip..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/50 border border-[var(--accent-primary-light)] rounded-2xl p-4 pl-12 text-sm font-bold text-white outline-none focus:border-[var(--accent-primary)]"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <X size={18} />
                    </button>
                )}
              </div>
          </div>
      )}

      {/* Pie Chart Section */}
      <div className="relative h-52 w-full flex items-center justify-center shrink-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1000}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getThemeColor(activeType)}
                    style={{ opacity: 1 - (index * 0.15) }}
                    className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px' }}
                itemStyle={{ color: '#F3F4F6', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value, name) => {
                  const percentage = typeTotal > 0 ? ((value / typeTotal) * 100).toFixed(1) : 0;
                  return [`₹${value.toLocaleString("en-IN")} (${percentage}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-800 border-2 border-dashed border-gray-900 rounded-full h-36 w-36">
            <span className="text-[10px] font-bold uppercase tracking-widest">No Data</span>
          </div>
        )}

        <div className="absolute flex flex-col items-center pointer-events-none">
          <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">{activeType}</p>
          <p className="text-xl font-black text-white">₹{typeTotal.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Type Selector */}
      <div className="px-8 py-2 shrink-0">
        <div className="bg-gray-900/40 p-1.5 rounded-[2rem] border border-white/5 flex shadow-inner">
          {["expense", "income", "investment"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
                activeType === type
                  ? "bg-white text-gray-950 shadow-xl"
                  : "text-gray-500 hover:text-gray-400"
              }`}
              style={activeType === type ? { backgroundColor: getThemeColor(type) } : {}}
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
                <AlertCircle size={14} className="text-[var(--accent-primary)]" />
                Limit
              </span>
              <span className="text-xs font-black text-white">
                ₹{budgetProgress.remaining.toLocaleString("en-IN")} <span className="text-gray-500 text-[10px]">Left of ₹{budgetProgress.limit.toLocaleString("en-IN")}</span>
              </span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                    width: `${budgetProgress.percentage}%`,
                    backgroundColor: budgetProgress.percentage > 90 ? 'var(--accent-tertiary)' : 'var(--accent-primary)'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 mt-4">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Timeline</h3>
          <div className="h-[1px] flex-1 bg-gray-900 mx-4"></div>
          <span className="text-[9px] font-black text-[var(--accent-primary)] bg-[var(--accent-primary-light)] px-2.5 py-1 rounded-full border border-[var(--accent-primary-light)] uppercase">
            {filteredTransactions.length} logs
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center p-12 bg-gray-900/10 rounded-[3rem] border border-dashed border-gray-900 text-gray-700 italic text-[10px] uppercase tracking-widest font-black">
            {searchQuery ? "No matches found" : "No activity found"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => {
              const Icon = iconMap[tx.categories?.icon] || CircleDollarSign;
              const type = tx.flow_type;

              return (
                <div
                  key={tx.id}
                  onClick={() => setEditingTransaction(tx)}
                  className="group flex items-center justify-between bg-gray-900/30 p-5 rounded-[2rem] border border-white/5 hover:bg-gray-900/50 transition-all duration-300 active:scale-[0.97]"
                >
                  <div className="flex items-center gap-5">
                    <div
                        className="p-3.5 rounded-2xl bg-gray-950 border border-white/5 shadow-xl transition-transform group-hover:scale-110"
                        style={{ color: getThemeColor(type) }}
                    >
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-200 text-sm tracking-tight">
                          {tx.categories?.name || "Unknown"}
                        </p>
                        {tx.trip && (
                          <span className="bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)] text-[7px] font-black px-2 py-0.5 rounded-full border border-[var(--accent-secondary-light)] uppercase tracking-widest">
                            {tx.trip.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })} • {type}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-base tracking-tighter" style={{ color: (type === 'expense' || type === 'investment') ? '#e5e7eb' : 'var(--accent-primary)' }}>
                    {type === 'expense' || type === 'investment' ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onTransactionAdded={onRefresh}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
