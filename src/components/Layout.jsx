import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, Plane } from "lucide-react";
import TransactionModal from "./TransactionModal";

export default function Layout({ children, onRefresh, activeTab }) {
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
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-8 pointer-events-none">
        <div className="relative w-full max-w-[400px] pointer-events-auto">
          {/* Custom SVG Background with Concave Notch */}
          <svg
            viewBox="0 0 400 100"
            className="absolute bottom-0 w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(17, 24, 39, 0.95)" />
                <stop offset="50%" stopColor="rgba(31, 41, 55, 0.9)" />
                <stop offset="100%" stopColor="rgba(17, 24, 39, 0.95)" />
              </linearGradient>
            </defs>
            <path
              d="M0,40
                 C0,20 20,20 40,20
                 L140,20
                 C150,20 155,20 165,30
                 C175,45 185,60 200,60
                 C215,60 225,45 235,30
                 C245,20 250,20 260,20
                 L360,20
                 C380,20 400,20 400,40
                 L400,100 L0,100 Z"
              fill="url(#navGradient)"
              className="backdrop-blur-3xl"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Navigation Items */}
          <nav className="relative h-[100px] flex items-end justify-between px-10 pb-4">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 transition-all duration-500 mb-1 ${
                location.pathname === "/" ? "text-emerald-400 scale-110" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Home size={22} strokeWidth={location.pathname === "/" ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Home</span>
            </Link>

            {/* Central FAB - Perfectly nested in the concave notch */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[35px]">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white rounded-2xl p-4 shadow-[0_10px_25px_rgba(16,185,129,0.4)] transition-all active:scale-90 flex items-center justify-center border border-white/10 group"
              >
                <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Trips */}
            <Link
              to="/trips"
              className={`flex flex-col items-center gap-1 transition-all duration-500 mb-1 ${
                location.pathname === "/trips" ? "text-indigo-400 scale-110" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Plane size={22} strokeWidth={location.pathname === "/trips" ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Trips</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* The Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleTransactionAdded}
        defaultType={activeTab} // Pass the context-aware type here
      />
    </div>
  );
}
