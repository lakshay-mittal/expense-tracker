import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, Plane } from "lucide-react";
import TransactionModal from "./TransactionModal";

export default function Layout({ children, onRefresh }) {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/trips", icon: Plane, label: "Trips" },
  ];

  const handleTransactionAdded = () => {
    onRefresh();
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Main Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>

      {/* Premium Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <nav className="bg-gray-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex items-center justify-between px-8 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              location.pathname === "/" ? "text-emerald-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === "/" ? "bg-emerald-500/10" : ""}`}>
              <Home size={22} strokeWidth={location.pathname === "/" ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Home</span>
          </Link>

          {/* Central Add Button */}
          <div className="relative -top-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white rounded-3xl p-5 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)] transition-all active:scale-90 flex items-center justify-center group"
            >
              <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          {/* Trips */}
          <Link
            to="/trips"
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              location.pathname === "/trips" ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${location.pathname === "/trips" ? "bg-indigo-500/10" : ""}`}>
              <Plane size={22} strokeWidth={location.pathname === "/trips" ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Trips</span>
          </Link>
        </nav>
      </div>

      {/* The Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}
