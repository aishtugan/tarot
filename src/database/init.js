// Database Initialization Module
// Sets up SQLite database for storing user sessions and reading history

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export function initDatabase() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/tarot_bot.db');
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  db = new Database(dbPath);
  console.log(`📊 Database initialized: ${dbPath}`);
  
  createTables();
  return db;
}

function createTables() {
  try {
    // Users table with profile information
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        language TEXT DEFAULT 'en',
        profile_completed BOOLEAN DEFAULT FALSE,
        gender TEXT,
        age_group TEXT,
        emotional_state TEXT,
        relationship_status TEXT,
        career_field TEXT,
        life_goals TEXT,
        readings_count INTEGER DEFAULT 0,
        last_reading_at DATETIME,
        include_reversals BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new profile columns if they don't exist (for existing databases)
    const columns = [
      'profile_completed',
      'gender', 
      'age_group',
      'emotional_state',
      'relationship_status',
      'career_field',
      'life_goals',
      'readings_count',
      'last_reading_at',
      'include_reversals',
      'updated_at'
    ];
    
    columns.forEach(column => {
      try {
        db.exec(`ALTER TABLE users ADD COLUMN ${column} TEXT`);
      } catch (error) {
        // Column already exists, ignore error
      }
    });

    // Readings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY,
        telegram_id INTEGER NOT NULL,
        question TEXT,
        cards_drawn TEXT NOT NULL,
        interpretation TEXT,
        ai_enhanced BOOLEAN DEFAULT FALSE,
        personalized BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export default {
  initDatabase,
  getDatabase,
  createTables
};

