import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Trash2,
  ShieldAlert,
  ChevronRight,
  FileText,
  Table,
  CircleDollarSign,
  ArrowLeft,
  Calendar,
  Palette,
  Check
} from "lucide-react";
import * as XLSX from "xlsx";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { db } from "../lib/db";

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(db.getSettings());
  const [budgetInput, setBudgetInput] = useState("");
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const currentMonthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  useEffect(() => {
    const currentBudget = db.getBudgetForMonth(currentMonthKey);
    setBudgetInput(currentBudget.toString());
  }, []);

  const themes = [
    { id: "emerald", name: "Emerald Pro", color: "#10b981" },
    { id: "midnight", name: "Midnight Ocean", color: "#0ea5e9" },
    { id: "royal", name: "Royal Crimson", color: "#f59e0b" },
    { id: "sunset", name: "Sunset Gold", color: "#f97316" },
  ];

  const handleUpdateBudget = () => {
    const amount = parseFloat(budgetInput) || 0;
    db.updateBudget(currentMonthKey, amount);
    alert(`Budget for ${currentMonthName} and future months updated!`);
  };

  const handleThemeChange = (themeId) => {
    const updated = db.updateSettings({ theme: themeId });
    setSettings(updated);
  };

  const handleExport = async (format) => {
    const transactions = db.getTransactions();
    if (transactions.length === 0) {
      alert("No data found");
      return;
    }

    const exportData = transactions.map(tx => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Type: tx.flow_type.toUpperCase(),
      Category: tx.categories?.name || "Other",
      Amount: tx.amount,
      Trip: tx.trip?.name || ""
    }));

    const fileName = `Finance_Backup_${new Date().toISOString().split('T')[0]}.${format}`;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

    try {
      if (Capacitor.isNativePlatform()) {
        const base64Data = XLSX.write(workbook, { bookType: format === 'xlsx' ? 'xlsx' : 'csv', type: 'base64' });
        const savedFile = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
        await Share.share({ title: 'Financial Backup', url: savedFile.uri });
      } else {
        XLSX.writeFile(workbook, fileName, format === 'csv' ? { bookType: 'csv' } : {});
      }
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center shrink-0">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-900/50 border border-white/5 rounded-2xl text-gray-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-[0.3em] text-white">Settings</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-40 mt-4">
        {/* Theme Engine */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5 px-2">
            <Palette size={16} className="text-[var(--accent-primary)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Theme Engine</h2>
          </div>
          <div className="bg-gray-900/30 border border-white/5 rounded-[2.5rem] p-6 grid grid-cols-2 gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${settings.theme === t.id ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-light)]' : 'border-gray-900 bg-gray-950/50'}`}
              >
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                    <span className="text-[10px] font-black uppercase tracking-tight">{t.name}</span>
                </div>
                {settings.theme === t.id && <Check size={14} className="text-[var(--accent-primary)]" />}
              </button>
            ))}
          </div>
        </section>

        {/* Budget Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5 px-2">
            <CircleDollarSign size={16} className="text-[var(--accent-primary)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Monthly Budget</h2>
          </div>
          <div className="bg-gray-900/30 border border-white/5 rounded-[2.5rem] p-7">
            <div className="flex items-center bg-gray-950 rounded-2xl px-5 py-4 border border-white/5 mb-5 shadow-inner">
              <span className="text-gray-600 font-bold mr-3 text-lg">₹</span>
              <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} className="bg-transparent outline-none w-full font-black text-2xl text-white" />
            </div>
            <button onClick={handleUpdateBudget} className="w-full bg-[var(--accent-primary)] text-white font-black py-5 rounded-3xl uppercase tracking-[0.2em] text-[10px]">Update Limit</button>
          </div>
        </section>

        {/* Export Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5 px-2">
            <Download size={16} className="text-[var(--accent-secondary)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Data Archiving</h2>
          </div>
          <div className="grid gap-4">
            <button onClick={() => handleExport("xlsx")} className="bg-gray-900/30 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-[var(--accent-secondary-light)] p-4 rounded-2xl text-[var(--accent-secondary)]"><Table size={24} /></div>
                <div className="text-left"><p className="font-bold text-sm text-gray-200">Microsoft Excel</p><p className="text-[9px] font-black text-gray-600 uppercase">Spreadsheet .xlsx</p></div>
              </div>
              <ChevronRight size={20} className="text-gray-800" />
            </button>
            <button onClick={() => handleExport("csv")} className="bg-gray-900/30 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-[var(--accent-primary-light)] p-4 rounded-2xl text-[var(--accent-primary)]"><FileText size={24} /></div>
                <div className="text-left"><p className="font-bold text-sm text-gray-200">Raw Data</p><p className="text-[9px] font-black text-gray-600 uppercase">Comma Separated .csv</p></div>
              </div>
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <div className="flex items-center gap-2 mb-5 px-2">
            <ShieldAlert size={16} className="text-[var(--accent-tertiary)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Security</h2>
          </div>
          <button onClick={handleClearData} className="w-full bg-red-500/5 border border-red-500/10 text-red-500/50 p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Trash2 size={22} /><div className="text-left"><p className="font-bold text-sm">Factory Reset</p><p className="text-[9px] font-black uppercase tracking-widest mt-0.5">Delete everything locally</p></div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
