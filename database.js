const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

// Ensure data directory exists
const dbPath = path.join(__dirname, 'data', 'remember_this.db');
fs.ensureDirSync(path.join(__dirname, 'data'));

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        date TEXT NOT NULL,
        image TEXT NOT NULL,
        shown INTEGER DEFAULT 0
    )`);
}

module.exports = db;
