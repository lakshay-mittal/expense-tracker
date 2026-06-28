const STORAGE_KEYS = {
  TRANSACTIONS: "et_transactions",
  CATEGORIES: "et_categories",
  SETTINGS: "et_settings",
  TRIPS: "et_trips",
};

const DEFAULT_CATEGORIES = [
  // Expenses
  { id: "exp_1", name: "Food & Dining", icon: "Coffee", type: "expense" },
  { id: "exp_2", name: "Gym & Health", icon: "Dumbbell", type: "expense" },
  { id: "exp_3", name: "Commute", icon: "Car", type: "expense" },
  { id: "exp_4", name: "Shopping", icon: "ShoppingBag", type: "expense" },
  { id: "exp_5", name: "Other Expenses", icon: "CircleDollarSign", type: "expense" },

  // Investments
  { id: "inv_1", name: "Mutual Funds", icon: "TrendingUp", type: "investment" },
  { id: "inv_2", name: "Stocks", icon: "LineChart", type: "investment" },
  { id: "inv_3", name: "FD (Fixed Deposit)", icon: "Lock", type: "investment" },
  { id: "inv_4", name: "Gold", icon: "Coins", type: "investment" },
  { id: "inv_5", name: "Other Investments", icon: "Briefcase", type: "investment" },

  // Income
  { id: "inc_1", name: "Salary", icon: "Wallet", type: "income" },
  { id: "inc_2", name: "Side Hustle", icon: "Zap", type: "income" },
  { id: "inc_3", name: "Other Income", icon: "PlusCircle", type: "income" },
];

export const db = {
  cleanupOldData: () => {
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    const filteredTxs = txs.filter(tx => new Date(tx.date) >= cutoff);
    if (filteredTxs.length !== txs.length) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTxs));
    }
  },

  getTransactions: () => {
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const cats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
    const trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || "[]");

    return txs.map((tx) => ({
      ...tx,
      categories: cats.find((c) => c.id === tx.category_id),
      trip: trips.find((t) => t.id === tx.trip_id),
    })).sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at));
  },

  addTransaction: (transaction) => {
    db.cleanupOldData();
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const newTx = {
      ...transaction,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      date: transaction.date || new Date().toISOString(),
    };
    txs.push(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    return { data: newTx, error: null };
  },

  updateTransaction: (id, updates) => {
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const index = txs.findIndex(tx => tx.id === id);
    if (index === -1) return { error: "Transaction not found" };

    txs[index] = { ...txs[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    return { data: txs[index], error: null };
  },

  deleteTransaction: (id) => {
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const filteredTxs = txs.filter(tx => tx.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTxs));
    return { error: null };
  },

  // TRIP METHODS
  getTrips: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || "[]")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  addTrip: (name) => {
    const trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || "[]");
    const newTrip = {
      id: crypto.randomUUID(),
      name,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    trips.push(newTrip);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return newTrip;
  },

  deleteTrip: (id) => {
    const trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || "[]");
    const filteredTrips = trips.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(filteredTrips));

    // Also unlink transactions from this trip (keep the transactions, just remove the link)
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const updatedTxs = txs.map(tx => tx.trip_id === id ? { ...tx, trip_id: null } : tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));

    return { error: null };
  },

  getCategories: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
  },

  getCategoriesByType: (type) => {
    const cats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
    return cats.filter(c => c.type === type);
  },

  getSettings: () => {
    const defaultSettings = {
      monthlyBudget: 0,
      currency: "₹",
      defaultView: "expense"
    };
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(defaultSettings));
  },

  updateSettings: (updates) => {
    const current = db.getSettings();
    const newData = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newData));
    return newData;
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
    window.location.reload();
  }
};

const initDB = () => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));

  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify([]));
  }

  db.cleanupOldData();
};

initDB();
