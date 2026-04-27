import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend, Cell} from "recharts";


function Analytics() {
  const [data, setData] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [range, setRange] = useState("overall");
  const [selectedDate, setSelectedDate] = useState("");

   const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
  };

 useEffect(() => {
  let url = "http://localhost:3001/analytics";

if (range !== "overall") {
  url += `?range=${range}`;

  if (selectedDate) {
    url += `&date=${selectedDate}`;
  }
}
  fetch(url)
    .then(res => res.json())
    .then(setData);

    fetch("http://localhost:3001/strategies")
    .then(res => res.json())
    .then(setStrategies);


}, [range, selectedDate]);

useEffect(() => {
  if (range === "overall") {
    setSelectedDate("");
  }
}, [range]);

  const getStrategyName = (id) => {
    const strategy = strategies.find(s => s.id === id);
    return strategy ? strategy.name : "Unknown";
  };
  const changeDate = (direction) => {
  const current = parseLocalDate(selectedDate);

  if (range === "day") {
    current.setDate(current.getDate() + direction);
  } else if (range === "week") {
    current.setDate(current.getDate() + 7 * direction);
  } else {
    current.setMonth(current.getMonth() + direction);
  }

  setSelectedDate(current.toISOString().split("T")[0]);
};

const formatDisplayDate = (range, date) => {
  const d = parseLocalDate(date);
  if (range === "day") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  else if (range === "week") {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const options = { month: "short", day: "numeric" };

    const startStr = start.toLocaleDateString("en-US", options);
    const endStr = end.toLocaleDateString("en-US", options);

    return `${startStr} – ${endStr}, ${end.getFullYear()}`;
  }

  else {
    return d.toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });
  }
};
  if (!data) return <p>Loading...</p>;
  const chartData = data.strategyPerformance.map(s => ({
  name: getStrategyName(s.strategy_id),
  pnl: s.totalPnl
}));

const pieData = [
  { name: "Long", value: data.longVsShort.long },
  { name: "Short", value: data.longVsShort.short }
];

  return (
    <div className="container-fluid">

      <h2 className="fw-bold mb-4 text-center">Analytics</h2>
  <div className="d-flex justify-content-between align-items-center mb-4">

  {/* Toggle buttons */}
  <div className="btn-group">
   {["overall", "day", "week", "month"].map((r) => (
      <button
        key={r}
        className={`btn ${range === r ? "btn-success" : "btn-outline-success"}`}
        onClick={() => setRange(r)}
      >
        {r.charAt(0).toUpperCase() + r.slice(1)}
      </button>
    ))}
  </div>

  {/* Navigation */}
  {range !== "overall" && (
  <div className="d-flex align-items-center gap-3">

    <button className="btn btn-light" onClick={() => changeDate(-1)}>
      ←
    </button>

    <h5 className="mb-0">
      {formatDisplayDate(range, selectedDate)}
    </h5>

    <button className="btn btn-light" onClick={() => changeDate(1)}>
      →
    </button>
     <input
    type="date"
    className="form-control w-auto"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
  />


  </div>
  )}

</div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <p>Total Trades</p>
            <h4>{data.totalTrades}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <p>Total P&L</p>
            <h4 className={data.totalPnl >= 0 ? "text-success" : "text-danger"}>
              ${data.totalPnl.toFixed(2)}
            </h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <p>Win Rate</p>
            <h4>{data.winRate.toFixed(2)}%</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <p>Avg P&L</p>
            <h4>${data.avgPnl.toFixed(2)}</h4>
          </div>
        </div>

      </div>

      {/* Strategy Performance */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="mb-3">Strategy Performance</h5>

        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Strategy</th>
              <th>Total Trades</th>
              <th>Total P&L</th>
              <th>Win Rate</th>
            </tr>
          </thead>

          <tbody>
            {data.strategyPerformance.map((s) => (
              <tr key={s.strategy_id}>
                <td>{getStrategyName(s.strategy_id)}</td>
                <td>{s.totalTrades}</td>
                <td className={s.totalPnl >= 0 ? "text-success" : "text-danger"}>
                  ${s.totalPnl.toFixed(2)}
                </td>
                <td>{s.winRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
   <div className="row g-4 mb-4">

  {/* Bar Chart */}
  <div className="col-md-8">
    <div className="card p-4 shadow-sm h-100">
      <h5 className="mb-3">Strategy P&L Chart</h5>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="pnl">
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.pnl >= 0 ? "#28a745" : "#dc3545"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Long vs Short */}
  <div className="col-md-4">
    <div className="card p-4 shadow-sm h-100">

      <h5 className="mb-3 text-center">Long vs Short</h5>

      <div className="text-center mb-3">
        <div className="text-success">
          Long: ${data.longVsShort.long.toFixed(2)}
        </div>
        <div className="text-primary">
          Short: ${data.longVsShort.short.toFixed(2)}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
          >
            <Cell fill="#28a745" />  {/* Long */}
            <Cell fill="#007bff" />  {/* Short */}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

    </div>
  </div>

</div>

    </div>
    
  );
}

export default Analytics;