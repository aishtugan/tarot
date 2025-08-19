import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/tarot_bot.db');
const db = new Database(dbPath);

// User management functions
export function registerUser(telegramId, username, firstName, lastName) {
  try {
    // Check if user already exists
    const existingUser = getUserById(telegramId);
    
    if (existingUser) {
      // User exists, update only the basic info, preserve reversal preference
      const stmt = db.prepare(`
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, updated_at = datetime('now')
        WHERE telegram_id = ?
      `);
      
      const result = stmt.run(username, firstName, lastName, telegramId);
      console.log(`✅ User updated: ${telegramId} (${username || firstName})`);
      return result;
    } else {
      // New user, insert with default reversal preference
      const stmt = db.prepare(`
        INSERT INTO users 
        (telegram_id, username, first_name, last_name, include_reversals, created_at, updated_at) 
        VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `);
      
      const result = stmt.run(telegramId, username, firstName, lastName);
      console.log(`✅ New user registered: ${telegramId} (${username || firstName})`);
      return result;
    }
  } catch (error) {
    console.error('❌ Error registering user:', error);
    throw error;
  }
}

export function getUserById(telegramId) {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
    return stmt.get(telegramId);
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
}

// Language management functions
export function getUserLanguage(telegramId) {
  try {
    const stmt = db.prepare('SELECT language FROM users WHERE telegram_id = ?');
    const result = stmt.get(telegramId);
    return result ? result.language : 'en';
  } catch (error) {
    console.error('❌ Error getting user language:', error);
    return 'en';
  }
}

export function setUserLanguage(telegramId, language) {
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET language = ?, updated_at = datetime('now') 
      WHERE telegram_id = ?
    `);
    const result = stmt.run(language, telegramId);
    console.log(`🌍 Language set to ${language} for user ${telegramId}`);
    return result;
  } catch (error) {
    console.error('❌ Error setting user language:', error);
    throw error;
  }
}

// Profile management functions
export function updateUserProfile(telegramId, profileData) {
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET profile_completed = 1,
          gender = ?,
          age_group = ?,
          emotional_state = ?,
          relationship_status = ?,
          career_field = ?,
          life_goals = ?,
          updated_at = datetime('now')
      WHERE telegram_id = ?
    `);
    
    const result = stmt.run(
      profileData.gender,
      profileData.ageGroup,
      profileData.emotionalState,
      profileData.relationshipStatus,
      profileData.careerField,
      profileData.lifeGoals,
      telegramId
    );
    
    console.log(`✅ Profile updated for user ${telegramId}`);
    return result;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
}

export function getUserProfile(telegramId) {
  try {
    const stmt = db.prepare(`
      SELECT gender, age_group, emotional_state, relationship_status, 
             career_field, life_goals, profile_completed
      FROM users 
      WHERE telegram_id = ?
    `);
    return stmt.get(telegramId);
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
}

export function isProfileCompleted(telegramId) {
  try {
    const stmt = db.prepare('SELECT profile_completed FROM users WHERE telegram_id = ?');
    const result = stmt.get(telegramId);
    return result ? Boolean(result.profile_completed) : false;
  } catch (error) {
    console.error('❌ Error checking profile completion:', error);
    return false;
  }
}

// Reversal preference functions
export function getUserReversalPreference(telegramId) {
  try {
    const stmt = db.prepare('SELECT include_reversals FROM users WHERE telegram_id = ?');
    const result = stmt.get(telegramId);
    // If result is null or include_reversals is null, default to true
    if (!result || result.include_reversals === null) {
      return true;
    }
    // Convert to number first, then to boolean
    return Boolean(Number(result.include_reversals));
  } catch (error) {
    console.error('❌ Error getting user reversal preference:', error);
    return true; // Default to true
  }
}

export function setUserReversalPreference(telegramId, includeReversals) {
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET include_reversals = ?, updated_at = datetime('now') 
      WHERE telegram_id = ?
    `);
    const result = stmt.run(includeReversals ? 1 : 0, telegramId);
    console.log(`🔄 Reversal preference set to ${includeReversals} for user ${telegramId}`);
    return result;
  } catch (error) {
    console.error('❌ Error setting user reversal preference:', error);
    throw error;
  }
}

// Reading statistics functions
export function incrementReadingCount(telegramId) {
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET readings_count = COALESCE(readings_count, 0) + 1,
          updated_at = datetime('now')
      WHERE telegram_id = ?
    `);
    return stmt.run(telegramId);
  } catch (error) {
    console.error('❌ Error incrementing reading count:', error);
  }
}

export function getUserStats(telegramId) {
  try {
    const stmt = db.prepare(`
      SELECT readings_count, created_at, last_reading_at
      FROM users 
      WHERE telegram_id = ?
    `);
    return stmt.get(telegramId);
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    return null;
  }
}

// Reading storage functions
export function storeReading(telegramId, readingData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO readings 
      (telegram_id, question, cards_drawn, interpretation, ai_enhanced, personalized, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(
      telegramId,
      readingData.question || '',
      JSON.stringify(readingData.cards || []),
      readingData.interpretation || '',
      readingData.aiEnhanced ? 1 : 0,
      readingData.personalized ? 1 : 0
    );
    
    // Update last reading timestamp
    const updateStmt = db.prepare(`
      UPDATE users 
      SET last_reading_at = datetime('now')
      WHERE telegram_id = ?
    `);
    updateStmt.run(telegramId);
    
    console.log(`✅ Reading stored for user ${telegramId}`);
    return result;
  } catch (error) {
    console.error('❌ Error storing reading:', error);
    throw error;
  }
}

export function getReadingHistory(telegramId, limit = 10) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM readings 
      WHERE telegram_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(telegramId, limit);
  } catch (error) {
    console.error('❌ Error getting reading history:', error);
    return [];
  }
}

// Database utility functions
export function closeDatabase() {
  if (db) {
    db.close();
  }
}

// Export database instance for testing
export { db };
