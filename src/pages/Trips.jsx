import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Plus,
  Trash2,
  MapPin,
  X,
  Settings as SettingsIcon,
  Calendar,
  Save,
  ChevronRight
} from "lucide-react";
import { db } from "../lib/db";
import TransactionModal from "../components/TransactionModal";

const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

export default function Trips({ transactions, onRefresh }) {
  const [trips, setTrips] = useState(db.getTrips());
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [selectedTripForAdd, setSelectedTripForAdd] = useState(null);

  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState(getTodayIST());
  const [newEnd, setNewEnd] = useState("");

  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  useEffect(() => {
    if (editingTrip) {
        setEditName(editingTrip.name);
        setEditStart(editingTrip.startDate || "");
        setEditEnd(editingTrip.endDate || "");
    }
  }, [editingTrip]);

  const tripsWithTotals = useMemo(() => {
    return trips.map(trip => {
      const tripExpenses = transactions
        .filter(tx => tx.trip_id === trip.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { ...trip, total: tripExpenses };
    });
  }, [trips, transactions]);

  const handleAddTrip = () => {
    if (!newName.trim()) return;
    db.addTrip(newName, newStart, newEnd || null);
    setTrips(db.getTrips());
    setNewName("");
    setNewStart(getTodayIST());
    setNewEnd("");
    setIsAddingTrip(false);
  };

  const handleUpdateTrip = () => {
    if (!editName.trim()) return;
    db.updateTrip(editingTrip.id, {
        name: editName,
        startDate: editStart,
        endDate: editEnd || null
    });
    setTrips(db.getTrips());
    setEditingTrip(null);
  };

  const handleDeleteTrip = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this trip? ALL related transactions will be permanently deleted.")) {
      db.deleteTrip(id);
      setTrips(db.getTrips());
      onRefresh();
      if (editingTrip?.id === id) setEditingTrip(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", { month: 'short', day: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center shrink-0">
        <div className="w-10"></div>
        <h1 className="text-xl font-black uppercase tracking-[0.3em] text-white">Trips</h1>
        <Link
          to="/settings"
          className="p-2.5 bg-gray-900/50 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all"
        >
          <SettingsIcon size={20} />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-40">
        {!isAddingTrip && (
          <button
            onClick={() => setIsAddingTrip(true)}
            className="w-full mb-8 bg-[var(--accent-primary-light)] border border-[var(--accent-primary-light)] p-5 rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all group"
          >
            <Plus size={20} className="text-[var(--accent-primary)] group-hover:rotate-90 transition-transform" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Plan New Adventure</span>
          </button>
        )}

        {isAddingTrip && (
          <div className="mb-8 bg-gray-900/40 border border-[var(--accent-primary-light)] p-6 rounded-[2.5rem] animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">New Journey</h3>
              <button onClick={() => setIsAddingTrip(false)} className="text-gray-700 hover:text-white"><X size={18}/></button>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-2">Destination</p>
                    <input autoFocus type="text" placeholder="Bali, Paris, Goa..." value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-2xl p-4 outline-none focus:border-[var(--accent-primary)] transition-colors font-bold text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-2">Departure</p>
                        <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-primary)]" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-2">Return (Opt)</p>
                        <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-primary)]" />
                    </div>
                </div>
            </div>
            <button onClick={handleAddTrip} className="w-full bg-[var(--accent-primary)] text-white font-black py-5 rounded-3xl uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[var(--accent-primary-shadow)] active:scale-95 transition-all">Create Trip</button>
          </div>
        )}

        <div className="grid gap-6">
          {tripsWithTotals.length === 0 ? (
            <div className="text-center py-24 bg-gray-900/10 rounded-[3rem] border border-dashed border-gray-900">
              <Plane size={40} className="mx-auto mb-4 text-gray-800" strokeWidth={1.5} /><p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">No journeys yet</p>
            </div>
          ) : (
            tripsWithTotals.map(trip => (
              <div key={trip.id} onClick={() => setEditingTrip(trip)} className="bg-gray-900/30 border border-white/5 rounded-[2.5rem] p-7 relative group active:scale-[0.98] transition-all duration-300 overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-[var(--accent-secondary-light)] p-4 rounded-2xl text-[var(--accent-secondary)] border border-[var(--accent-secondary-light)] shadow-xl"><MapPin size={24} strokeWidth={2.5} /></div>
                    <div><h2 className="text-lg font-black text-white tracking-tight">{trip.name}</h2>
                      <div className="flex items-center gap-2 mt-1"><Calendar size={10} className="text-gray-600" /><p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{formatDate(trip.startDate) || "Anytime"} {trip.endDate ? ` — ${formatDate(trip.endDate)}` : ""}</p></div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-950/40 rounded-[1.8rem] p-5 border border-white/5"><p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Spending</p><p className="text-xl font-black text-white tracking-tighter">₹{trip.total.toLocaleString("en-IN")}</p></div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedTripForAdd(trip); }} className="bg-white/5 hover:bg-[var(--accent-primary)] text-gray-400 hover:text-white rounded-[1.8rem] p-5 border border-white/5 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest"><Plus size={16} strokeWidth={3} /> Log</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingTrip && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/80 backdrop-blur-sm">
            <div className="flex-1" onClick={() => setEditingTrip(null)}></div>
            <div className="bg-gray-900 w-full rounded-t-[2.5rem] border-t border-gray-800 p-8 pb-12 shadow-2xl">
                <div className="flex justify-between items-center mb-8"><h2 className="text-sm font-black uppercase tracking-widest text-[var(--accent-secondary)]">Edit Journey</h2>
                    <div className="flex gap-2"><button onClick={(e) => handleDeleteTrip(editingTrip.id, e)} className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/10"><Trash2 size={20} /></button><button onClick={() => setEditingTrip(null)} className="p-3 bg-gray-800 rounded-2xl text-gray-400 border border-gray-700"><X size={20} /></button></div>
                </div>
                <div className="space-y-6 mb-10">
                    <div><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Destination Name</p><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-2xl p-5 outline-none focus:border-[var(--accent-secondary)] transition-colors font-black text-white text-lg" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Departure</p><input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-2xl p-5 text-xs font-black text-white outline-none focus:border-[var(--accent-secondary)]" /></div>
                        <div><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Return (Optional)</p><input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-2xl p-5 text-xs font-black text-white outline-none focus:border-[var(--accent-secondary)]" /></div>
                    </div>
                </div>
                <button onClick={handleUpdateTrip} className="w-full bg-[var(--accent-secondary)] text-white font-black py-5 rounded-3xl uppercase tracking-[0.3em] text-xs shadow-xl shadow-[var(--accent-secondary-shadow)] active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Update Trip Details</button>
            </div>
          </div>
      )}

      <TransactionModal isOpen={!!selectedTripForAdd} onClose={() => setSelectedTripForAdd(null)} onTransactionAdded={onRefresh} preselectedTripId={selectedTripForAdd?.id} />
    </div>
  );
}
