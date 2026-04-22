import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Strategies from "./pages/Strategies";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "trades": return <Trades />;
      case "analytics": return <Analytics />;
      case "calendar": return <Calendar />;
      case "strategies": return <Strategies />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">Trading Journal</h2>

        <div className="menu">

          <div 
            className={`menu-item ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </div>

          <div 
            className={`menu-item ${activePage === "trades" ? "active" : ""}`}
            onClick={() => setActivePage("trades")}
          >
            Trades
          </div>

          <div 
            className={`menu-item ${activePage === "analytics" ? "active" : ""}`}
            onClick={() => setActivePage("analytics")}
          >
            Analytics
          </div>

          <div 
            className={`menu-item ${activePage === "calendar" ? "active" : ""}`}
            onClick={() => setActivePage("calendar")}
          >
            Calendar
          </div>

          <div 
            className={`menu-item ${activePage === "strategies" ? "active" : ""}`}
            onClick={() => setActivePage("strategies")}
          >
            Strategies
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderPage()}
      </div>

    </div>
  );
}

export default App;