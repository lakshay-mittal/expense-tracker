# 💎 Expense Tracker Pro: The Offline-First Financial Companion

A premium, high-performance financial management application built with **React**, **Vite**, and **Capacitor**. Designed for ultimate privacy and speed, this app functions 100% offline, storing all your data directly on your device.

![Build Status](https://img.shields.io/badge/Status-Complete-emerald)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-blue)
![Offline](https://img.shields.io/badge/Network-100%25%20Offline-orange)

## ✨ Core Features

### 🏦 Triple-Pillar Financial Tracking
Manage your entire financial life in one place with three dedicated views:
- **Expenses**: Detailed spending breakdown with categories like Food, Commute, and Shopping.
- **Investments**: Track professional assets including Mutual Funds, Stocks, Fixed Deposits, and Gold.
- **Income**: Log Salary, Side Hustles, and other revenue streams.

### 🥧 Dynamic Visualization
- **Interactive Pie Charts**: Real-time category breakdowns for every financial pillar.
- **Calendar-Aware Dashboard**: Automatically tracks the current month and year.
- **Monthly Auto-Refresh**: Seamlessly handles transitions between calendar months.

### ✈️ Trips Management
- **Journey Tracking**: Create dedicated cards for specific trips (e.g., "Europe 2025").
- **Trip-Specific Totals**: See exactly how much you've spent on a particular adventure.
- **Integrated Tagging**: Trip-linked expenses are automatically tagged in your main activity list.

### 🛠️ Advanced Management
- **Full Edit/Delete Flow**: Click any transaction in your timeline to modify or remove it.
- **Backdating Support**: Log expenses for past dates with an integrated date picker.
- **12-Month Sliding Window**: Smart database management that automatically retains only the last 12 months of data to keep performance snappy.

### ⚙️ Personal Pro Settings
- **Professional Export**: Download your data as formatted **Excel (.xlsx)** or **CSV** files directly from the app.
- **Monthly Budgeting**: Set spending limits and track progress with a dynamic "Budget Health" bar.
- **Factory Reset**: Securely wipe all local data with a single click.

## 💎 Premium UI/UX
- **Glassmorphism Design**: High-end blurred backgrounds and sophisticated semi-transparent borders.
- **Balanced Navigation**: A sleek floating bottom dock for Home, Trips, and quick logging.
- **Native Experience**: Standard top-right settings access for a professional mobile feel.

## 🚀 Technical Stack
- **Frontend**: React 19 + Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Mobile Wrapper**: Capacitor 6 (Android)
- **Persistence**: 100% Offline LocalStorage Data Layer
- **Build Tool**: Vite 8

## 📱 Installation (Android)
1. Download the latest `expense-tracker-offline.apk`.
2. Transfer the file to your Android device.
3. Enable "Install from Unknown Sources" in your settings.
4. Open the APK and enjoy your private financial companion.

## 👨‍💻 Development
```bash
# Install dependencies
npm install

# Start the dev server (HTTP for easy browser testing)
npm run dev

# Build the web project
npm run build

# Sync and Build the Android APK
npx cap sync
cd android && ./gradlew assembleDebug
```

---
*Built for privacy. No cloud. No tracking. Just your finances, simplified.*
