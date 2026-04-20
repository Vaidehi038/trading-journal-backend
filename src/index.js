const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Test DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// Strategies Table

app.post("/strategies", async (req, res) => {
  try {
    const { label, description } = req.body;

    const result = await pool.query(
      "INSERT INTO strategies (label, description) VALUES ($1, $2) RETURNING *",
      [label, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Strategy already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});
app.get("/strategies", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM strategies");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/strategies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const result = await pool.query(
      "UPDATE strategies SET description = $1 WHERE id = $2 RETURNING *",
      [description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Strategy not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Trades Table

app.post("/trades", async (req, res) => {
  try {
    const {
      date,
      ticker,
      stock_name,
      trade_type,
      quantity,
      entry_price,
      stop_loss,
      target_price,
      outcome,
      strategy_id,
    } = req.body;

    let pnl = 0;

    if (outcome === "successful") {
      pnl =
        trade_type === "long"
          ? (target_price - entry_price) * quantity
          : (entry_price - target_price) * quantity;
    } else {
      pnl =
        trade_type === "long"
          ? (stop_loss - entry_price) * quantity
          : (entry_price - stop_loss) * quantity;
    }

    // ✅ CLEAN DATE STORAGE
    const tradeDate = date || new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `INSERT INTO trades 
      (trade_date, ticker, stock_name, trade_type, quantity, entry_price, stop_loss, target_price, outcome, strategy_id, pnl)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        tradeDate,
        ticker,
        stock_name,
        trade_type,
        quantity,
        entry_price,
        stop_loss,
        target_price,
        outcome,
        strategy_id,
        pnl,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/trades", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM trades ORDER BY trade_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/trades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM trades WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json({ message: "Trade deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Analysis Tab

app.get("/analytics", async (req, res) => {
  try {
    const { range, date } = req.query;

    let query = "SELECT * FROM trades";
    let values = [];

    if (range === "day" && date) {
      query += " WHERE trade_date = $1";
      values = [date];
    } 
    
    else if (range === "week" && date) {
  query += " WHERE trade_date BETWEEN $1 AND $2";

  const selectedDate = new Date(date);

  const firstDay = new Date(selectedDate);
  firstDay.setDate(selectedDate.getDate() - selectedDate.getDay());

  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  values = [
    firstDay.toISOString().split("T")[0],
    lastDay.toISOString().split("T")[0]
  ];
}
    
    else if (range === "month" && date) {
  query += " WHERE trade_date BETWEEN $1 AND $2";

  const [year, month] = date.split("-");

  const firstDay = `${year}-${month}-01`;

  const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

  values = [firstDay, lastDay];
}

    const result = await pool.query(query, values);
    const trades = result.rows;

    const totalTrades = trades.length;

    const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0);

    const winningTrades = trades.filter(t => Number(t.pnl) > 0).length;

    const winRate = totalTrades === 0 ? 0 : (winningTrades / totalTrades) * 100;

    const avgPnl = totalTrades === 0 ? 0 : totalPnl / totalTrades;
    const strategyMap = {};

    trades.forEach((trade) => {
      const id = trade.strategy_id;

      if (!strategyMap[id]) {
    strategyMap[id] = {
      strategy_id: id,
      totalPnl: 0,
      totalTrades: 0,
      wins: 0
    };
  }

  strategyMap[id].totalPnl += Number(trade.pnl);
  strategyMap[id].totalTrades += 1;

  if (Number(trade.pnl) > 0) {
    strategyMap[id].wins += 1;
  }
});

const strategyPerformance = Object.values(strategyMap).map(s => ({
  strategy_id: s.strategy_id,
  totalPnl: s.totalPnl,
  totalTrades: s.totalTrades,
  winRate: s.totalTrades === 0 ? 0 : (s.wins / s.totalTrades) * 100
}));
const longTrades = trades.filter(t => t.trade_type.toLowerCase() === "long");
const shortTrades = trades.filter(t => t.trade_type.toLowerCase() === "short");

const longPnl = longTrades.reduce((sum, t) => sum + Number(t.pnl), 0);
const shortPnl = shortTrades.reduce((sum, t) => sum + Number(t.pnl), 0);

    res.json({
  totalTrades,
  totalPnl,
  winRate,
  avgPnl,
  strategyPerformance,
  longVsShort: {
    long: longPnl,
    short: shortPnl
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//calendar
app.get("/calendar", async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;

    const lastDay = new Date(year, month, 0)
      .toISOString()
      .split("T")[0];

    const result = await pool.query(
      `SELECT trade_date, pnl FROM trades 
       WHERE trade_date BETWEEN $1 AND $2`,
      [firstDay, lastDay]
    );

    const trades = result.rows;

    const calendarData = {};

    trades.forEach((trade) => {
      const date = trade.trade_date.toISOString().split("T")[0];

      if (!calendarData[date]) {
        calendarData[date] = 0;
      }

      calendarData[date] += Number(trade.pnl);
    });

    res.json(calendarData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});