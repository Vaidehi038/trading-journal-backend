const { Pool } = require("pg");

const pool = new Pool({
 user: "vaidehigandhi",
  host: "localhost",
  database: "trading_journal",
  password: "",
  port: 5432,
});

module.exports = pool;