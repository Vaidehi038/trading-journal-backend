import { useEffect, useState } from "react";

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/analytics")
      .then(res => res.json())
      .then(setAnalytics);

    fetch("http://localhost:3001/trades")
      .then(res => res.json())
      .then(setTrades);
  }, []);

  return (
    <div className="container-fluid">
      
      {/* Title */}
      <h2 className="fw-bold mb-4">Dashboard</h2>

      {/* Cards */}
      {analytics && (
        <div className="row g-4">

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 p-3">
              <small className="text-muted">Total P&L</small>
              <h4 className="fw-bold text-success">
                ${analytics.totalPnl.toFixed(2)}
              </h4>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 p-3">
              <small className="text-muted">Win Rate</small>
              <h4 className="fw-bold">
                {analytics.winRate.toFixed(2)}%
              </h4>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 p-3">
              <small className="text-muted">Total Trades</small>
              <h4 className="fw-bold">
                {analytics.totalTrades}
              </h4>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 p-3">
              <small className="text-muted">Avg P&L</small>
              <h4 className="fw-bold">
                ${analytics.avgPnl.toFixed(2)}
              </h4>
            </div>
          </div>

        </div>
      )}

      {/* Table */}
      <div className="mt-5">
        <h5 className="fw-semibold mb-3">Recent Trades</h5>

        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>P&L</th>
                  <th>Outcome</th>
                </tr>
              </thead>

              <tbody>
                {trades.map(trade => (
                  <tr key={trade.id}>

                    <td>
                      {trade.trade_date.split("T")[0]}
                    </td>

                    <td>{trade.ticker}</td>

                    <td>{trade.trade_type}</td>

                    <td>{trade.quantity}</td>

                    <td className={
                      Number(trade.pnl) >= 0
                        ? "text-success fw-semibold"
                        : "text-danger fw-semibold"
                    }>
                      ${Number(trade.pnl).toFixed(2)}
                    </td>

                    <td>
                      <span className={
                        trade.outcome === "Successful"
                          ? "badge bg-success-subtle text-success"
                          : "badge bg-danger-subtle text-danger"
                      }>
                        {trade.outcome}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;