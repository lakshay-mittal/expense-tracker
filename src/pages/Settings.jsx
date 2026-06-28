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
  Calendar
} from "lucide-react";
import * as XLSX from "xlsx";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { db } from "../lib/db";

export default function Settings() {
  const navigate = useNavigate();
  const [budgetInput, setBudgetInput] = useState("");
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const currentMonthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  useEffect(() => {
    const currentBudget = db.getBudgetForMonth(currentMonthKey);
    setBudgetInput(currentBudget.toString());
  }, []);

  const handleUpdateBudget = () => {
    const amount = parseFloat(budgetInput) || 0;
    db.updateBudget(currentMonthKey, amount);
    alert(`Budget for ${currentMonthName} and future months updated!`);
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
        // NATIVE FLOW: Write to filesystem and share
        const base64Data = XLSX.write(workbook, {
          bookType: format === 'xlsx' ? 'xlsx' : 'csv',
          type: 'base64'
        });

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache, // Use Cache for temporary sharing
        });

        await Share.share({
          title: 'Financial Backup',
          text: `Here is your expense tracker export (${format.toUpperCase()})`,
          url: savedFile.uri,
          dialogTitle: 'Export Data',
        });

      } else {
        // BROWSER FLOW: Standard download
        if (format === "xlsx") {
          XLSX.writeFile(workbook, fileName);
        } else {
          XLSX.writeFile(workbook, fileName, { bookType: "csv" });
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleClearData = () => {
    if (window.confirm("PERMANENT ACTION: Wipe all data on this device?")) {
      db.clearAllData();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-gray-900/50 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-[0.3em] text-white">Settings</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-40 mt-4">
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5 px-2">
            <CircleDollarSign size={16} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Monthly Spending Limit</h2>
          </div>
          <div className="bg-gray-900/30 border border-white/5 rounded-[2.5rem] p-7">
            <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                    <Calendar size={12} />
                    Current Month: {currentMonthName}
                </span>
            </div>
            <div className="flex items-center bg-gray-950 rounded-2xl px-5 py-4 border border-white/5 mb-5 shadow-inner">
              <span className="text-gray-600 font-bold mr-3 text-lg">₹</span>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="bg-transparent outline-none w-full font-black text-2xl text-white placeholder-gray-800"
                placeholder="0.00"
              />
            </div>
            <button
              onClick={handleUpdateBudget}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-3xl uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-600/10 transition-all active:scale-95"
            >
              Update for {now.toLocaleString("default", { month: "short" })} & Future
            </button>
            <p className="text-[9px] text-center text-gray-600 mt-4 italic font-medium px-4">
                * Changes only affect current and upcoming months. Previous months remain unchanged.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5 px-2">
            <Download size={16} className="text-indigo-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Data Archiving</h2>
          </div>
          <div className="grid gap-4">
            <button
              onClick={() => handleExport("xlsx")}
              className="bg-gray-900/30 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-400 border border-indigo-500/10">
                  <Table size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm tracking-tight text-gray-200">Microsoft Excel</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Spreadsheet .xlsx</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-800 group-hover:text-gray-400 transition-colors" />
            </button>

            <button
              onClick={() => handleExport("csv")}
              className="bg-gray-900/30 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400 border border-emerald-500/10">
                  <FileText size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm tracking-tight text-gray-200">Raw Data</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Comma Separated .csv</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-800 group-hover:text-gray-400 transition-colors" />
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-5 px-2">
            <ShieldAlert size={16} className="text-red-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Security</h2>
          </div>
          <button
            onClick={handleClearData}
            className="w-full bg-red-500/5 border border-red-500/10 text-red-500/50 p-6 rounded-[2rem] flex items-center justify-between hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"
          >
            <div className="flex items-center gap-5">
              <Trash2 size={22} />
              <div className="text-left">
                <p className="font-bold text-sm tracking-tight">Factory Reset</p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-0.5">Delete everything locally</p>
              </div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
