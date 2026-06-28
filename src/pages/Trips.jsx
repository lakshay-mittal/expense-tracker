import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Plus,
  Trash2,
  MapPin,
  X,
  Settings as SettingsIcon
} from "lucide-react";
import { db } from "../lib/db";
import TransactionModal from "../components/TransactionModal";

export default function Trips({ transactions, onRefresh }) {
  const [trips, setTrips] = useState(db.getTrips());
  const [newTripName, setNewTripName] = useState("");
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [selectedTripForAdd, setSelectedTripForAdd] = useState(null);

  const tripsWithTotals = useMemo(() => {
    return trips.map(trip => {
      const tripExpenses = transactions
        .filter(tx => tx.trip_id === trip.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { ...trip, total: tripExpenses };
    });
  }, [trips, transactions]);

  const handleAddTrip = () => {
    if (!newTripName.trim()) return;
    db.addTrip(newTripName);
    setTrips(db.getTrips());
    setNewTripName("");
    setIsAddingTrip(false);
  };

  const handleDeleteTrip = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this trip? Transactions will remain but will be unlinked.")) {
      db.deleteTrip(id);
      setTrips(db.getTrips());
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Premium Top Bar */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center shrink-0">
        <div className="w-10"></div>
        <h1 className="text-xl font-black uppercase tracking-[0.3em] text-white">Trips</h1>
        <Link
          to="/settings"
          className="p-2.5 bg-gray-900/50 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-gray-800"
        >
          <SettingsIcon size={20} />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-40">
        {/* New Trip Trigger */}
        {!isAddingTrip && (
          <button
            onClick={() => setIsAddingTrip(true)}
            className="w-full mb-8 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all group"
          >
            <Plus size={20} className="text-emerald-500 group-hover:rotate-90 transition-transform" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Plan New Adventure</span>
          </button>
        )}

        {/* New Trip Input */}
        {isAddingTrip && (
          <div className="mb-8 bg-gray-900/40 border border-emerald-500/30 p-6 rounded-[2.5rem] animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">New Journey</h3>
              <button onClick={() => setIsAddingTrip(false)} className="text-gray-700 hover:text-white"><X size={18}/></button>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Destination..."
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              className="w-full bg-gray-950 border border-white/5 rounded-2xl p-4 mb-5 outline-none focus:border-emerald-500 transition-colors font-bold text-white placeholder-gray-800"
            />
            <button
              onClick={handleAddTrip}
              className="w-full bg-emerald-500 text-white font-black py-5 rounded-3xl uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Create Trip
            </button>
          </div>
        )}

        {/* Trip Cards */}
        <div className="grid gap-6">
          {tripsWithTotals.length === 0 ? (
            <div className="text-center py-24 bg-gray-900/10 rounded-[3rem] border border-dashed border-gray-900">
              <Plane size={40} className="mx-auto mb-4 text-gray-800" strokeWidth={1.5} />
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">No journeys yet</p>
            </div>
          ) : (
            tripsWithTotals.map(trip => (
              <div
                key={trip.id}
                className="bg-gray-900/30 border border-white/5 rounded-[2.5rem] p-7 relative group active:scale-[0.98] transition-all duration-300 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-400 border border-indigo-500/10 shadow-xl">
                      <MapPin size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-tight">{trip.name}</h2>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">
                        Added {new Date(trip.created_at).toLocaleDateString("en-IN", { month: 'short', day: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                    className="p-2 text-gray-800 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-950/40 rounded-[1.8rem] p-5 border border-white/5">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Trip Spending</p>
                    <p className="text-xl font-black text-white tracking-tighter">₹{trip.total.toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTripForAdd(trip)}
                    className="bg-white/5 hover:bg-emerald-500 text-gray-400 hover:text-white rounded-[1.8rem] p-5 border border-white/5 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <Plus size={16} strokeWidth={3} /> Log
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={!!selectedTripForAdd}
        onClose={() => setSelectedTripForAdd(null)}
        onTransactionAdded={onRefresh}
        preselectedTripId={selectedTripForAdd?.id}
      />
    </div>
  );
}
