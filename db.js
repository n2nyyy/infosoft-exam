const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('infosoft.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    address TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL,
    hourly_rate REAL NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    tool_name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    status TEXT DEFAULT 'Available'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    schedule_date TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Scheduled' -- Scheduled, In-Progress, Completed, Cancelled
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS booking_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    service_id INTEGER,
    hours_rendered REAL NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS billings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE,
    total_amount REAL NOT NULL,
    paid_amount REAL DEFAULT 0.0,
    status TEXT DEFAULT 'Unpaid' -- Unpaid, Partial, Paid
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    billing_id INTEGER,
    amount_paid REAL NOT NULL,
    payment_method TEXT NOT NULL, -- Cash, Bank Transfer, GCash, Check
    reference_no TEXT,
    payment_date TEXT NOT NULL
  )
`);

// Migration: safely add paid_amount if it doesn't exist yet
try {
  db.exec(`ALTER TABLE billings ADD COLUMN paid_amount REAL DEFAULT 0;`);
} catch (e) {
  // column already exists, safe to ignore
}

try {
  db.exec(`ALTER TABLE clients ADD COLUMN address TEXT;`);
} catch (e) {
  // safe to ignore
}

console.log("Database initialized and verified!");
module.exports = db;