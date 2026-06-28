import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Trips from "./pages/Trips";
import { db } from "./lib/db";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    setIsLoading(true);
    try {
      const data = db.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <Layout onRefresh={fetchTransactions}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                transactions={transactions}
                isLoading={isLoading}
                onRefresh={fetchTransactions}
              />
            }
          />
          <Route
            path="/trips"
            element={
              <Trips
                transactions={transactions}
                onRefresh={fetchTransactions}
              />
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
