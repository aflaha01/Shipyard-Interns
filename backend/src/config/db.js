// Legacy raw SQLite connection — kept for reference. Use src/config/database.js (Sequelize) instead.
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = process.env.DB_PATH || "./database/database.db";

const db = new sqlite3.Database(
  path.resolve(dbPath),
  (err) => {
    if (err) {
      console.error("Database connection failed:", err.message);
    } else {
      console.log("Connected to SQLite database");
    }
  }
);

// Users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('dev', 'lead', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Projects table
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )
`);

module.exports = db;