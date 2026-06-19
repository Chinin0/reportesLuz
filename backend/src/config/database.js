const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../reports.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initialize();
          resolve(this);
        }
      });
    });
  }

  initialize() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,

          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          address TEXT,

          problem_type TEXT NOT NULL CHECK(problem_type IN ('apagado', 'parpadea', 'danado', 'otro')),
          description TEXT NOT NULL,
          photo_url TEXT,

          reporter_name TEXT,
          reporter_email TEXT,
          reporter_phone TEXT,

          status TEXT DEFAULT 'pendiente' CHECK(status IN ('pendiente', 'asignado', 'en_progreso', 'resuelto', 'rechazado')),
          priority TEXT DEFAULT 'media' CHECK(priority IN ('baja', 'media', 'alta')),
          admin_notes TEXT,

          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,

          assigned_to TEXT,
          assigned_date DATETIME
        )
      `, (err) => {
        if (err) console.error('Error creating reports table:', err);
        else console.log('Reports table ready');
      });

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_status ON reports(status)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_location ON reports(latitude, longitude)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_created_at ON reports(created_at DESC)
      `);
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

const db = new Database();

// Si se ejecuta directamente, inicializar la BD
if (require.main === module) {
  db.connect()
    .then(() => {
      console.log('Database initialized successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = db;
