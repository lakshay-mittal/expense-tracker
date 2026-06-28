import { useState, useMemo, useEffect } from "react";
import {
  X,
  Coffee,
  Dumbbell,
  ShoppingBag,
  Car,
  TrendingUp,
  CircleDollarSign,
  LineChart,
  Lock,
  Coins,
  Briefcase,
  Wallet,
  Zap,
  PlusCircle,
  Calendar,
  Trash2,
  MapPin
} from "lucide-react";
import { db } from "../lib/db";

const iconMap = {
  Coffee,
  Dumbbell,
  Car,
  ShoppingBag,
  TrendingUp,
  CircleDollarSign,
  LineChart,
  Lock,
  Coins,
  Briefcase,
  Wallet,
  Zap,
  PlusCircle,
};

export default function TransactionModal({
  isOpen,
  onClose,
  onTransactionAdded,
  editingTransaction = null,
  preselectedTripId = null,
  defaultType = "expense", // Received from Layout context
}) {
  const [amount, setAmount] = useState("");
  const [flowType, setFlowType] = useState(defaultType);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const trips = useMemo(() => db.getTrips(), [isOpen]);

  // Pre-fill logic
  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setFlowType(editingTransaction.flow_type);
      setActiveCategoryId(editingTransaction.category_id);
      setDate(new Date(editingTransaction.date).toISOString().split('T')[0]);
      setSelectedTripId(editingTransaction.trip_id || null);
    } else {
      setAmount("");
      setFlowType(defaultType); // Default to current dashboard view
      setActiveCategoryId(null);
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedTripId(preselectedTripId || null);
    }
  }, [editingTransaction, preselectedTripId, isOpen, defaultType]);

  // Force flowType to expense if a trip is selected
  useEffect(() => {
    if (selectedTripId) {
      setFlowType("expense");
    }
  }, [selectedTripId]);

  const availableCategories = useMemo(() => {
    return db.getCategoriesByType(flowType);
  }, [flowType]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!amount || !activeCategoryId) {
      alert("Please enter an amount and pick a category!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        flow_type: flowType,
        category_id: activeCategoryId,
        trip_id: selectedTripId,
        date: new Date(date).toISOString(),
        note: editingTransaction ? editingTransaction.note : `Logged as ${flowType}`,
      };

      let result;
      if (editingTransaction) {
        result = db.updateTransaction(editingTransaction.id, payload);
      } else {
        result = db.addTransaction(payload);
      }

      if (result.error) throw new Error(result.error);

      onTransactionAdded();
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      db.deleteTransaction(editingTransaction.id);
      onTransactionAdded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/80 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose}></div>

      <div className="bg-gray-900 w-full rounded-t-[2.5rem] border-t border-gray-800 p-8 pb-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-100 uppercase tracking-widest text-xs">
            {editingTransaction ? "Edit Transaction" : "New Transaction"}
          </h2>
          <div className="flex gap-2">
            {editingTransaction && (
              <button
                onClick={handleDelete}
                className="p-2.5 bg-red-500/10 rounded-2xl text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 bg-gray-800 rounded-2xl text-gray-400 hover:text-white border border-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
            {/* Date Selector */}
            <div className="flex items-center justify-center">
                <div className="bg-gray-800/50 rounded-2xl px-4 py-2 border border-gray-800 flex items-center gap-3">
                    <Calendar size={16} className="text-emerald-500" />
                    <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-200 outline-none"
                    />
                </div>
            </div>

            {/* Trip Selector (Optional) */}
            <div className="flex items-center justify-center">
                <div className="bg-gray-800/50 rounded-2xl px-4 py-2 border border-gray-800 flex items-center gap-3 w-full max-w-[200px]">
                    <MapPin size={16} className="text-indigo-400" />
                    <select
                        value={selectedTripId || ""}
                        onChange={(e) => setSelectedTripId(e.target.value || null)}
                        className="bg-transparent text-[11px] font-bold text-gray-200 outline-none w-full appearance-none"
                    >
                        <option value="">No Trip</option>
                        {trips.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Amount Input */}
        <div className="flex justify-center items-center mb-8">
          <span className="text-3xl text-gray-500 font-light mr-3">₹</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            autoFocus={!editingTransaction}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-6xl font-bold bg-transparent text-white w-full text-center outline-none placeholder-gray-800"
          />
        </div>

        {/* Top Type Toggle - Only show if NO trip is selected */}
        {!selectedTripId && (
          <div className="flex bg-gray-800/50 p-1.5 rounded-2xl mb-8 border border-gray-800">
            {["expense", "income", "investment"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFlowType(type);
                  setActiveCategoryId(null);
                }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  flowType === type
                    ? type === "expense"
                      ? "bg-red-500 text-white shadow-lg"
                      : type === "investment"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "bg-emerald-500 text-white shadow-lg"
                    : "text-gray-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {availableCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || CircleDollarSign;
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all ${
                  isActive
                    ? flowType === 'expense' ? "border-red-500 bg-red-500/10 text-red-400"
                      : flowType === 'investment' ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                      : "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-gray-800 bg-gray-800/30 text-gray-500 hover:border-gray-700"
                }`}
              >
                <Icon size={26} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-center leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full font-black py-5 rounded-[2rem] text-lg uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${
            isSaving
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : flowType === 'expense' ? "bg-red-500 text-white shadow-red-500/20"
                : flowType === 'investment' ? "bg-indigo-500 text-white shadow-indigo-500/20"
                : "bg-emerald-500 text-white shadow-emerald-500/20"
          }`}
        >
          {isSaving ? "Saving..." : editingTransaction ? "Update Log" : "Confirm Log"}
        </button>
      </div>
    </div>
  );
}
