# Trading Journal

A full-stack trading journal application.

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL

## Project Structure
Trading-Journal
 |_trading-journal-backend
 |_trading-journal-frontend

## Backend Setup
cd trading-journal-backend
npm install
npm run dev

## Frontend Setup
cd trading-journal-frontend
npm install
npm run dev

## Database Setup
# Create Database
CREATE DATABASE trading_journal;
# Run Tables
CREATE TABLE strategies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  trade_date DATE,
  ticker TEXT,
  stock_name TEXT,
  trade_type TEXT CHECK (trade_type IN ('Long', 'Short')),
  quantity INTEGER,
  entry_price NUMERIC,
  stop_loss NUMERIC,
  target_price NUMERIC,
  pnl NUMERIC,
  outcome TEXT CHECK (outcome IN ('Successful', 'Unsuccessful')),
  strategy_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

