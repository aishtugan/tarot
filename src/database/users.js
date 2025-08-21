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
          spiritual_beliefs = ?,
          updated_at = datetime('now')
      WHERE telegram_id = ?
    `);
    
    const result = stmt.run(
      profileData.gender,
      profileData.ageGroup,
      profileData.spiritualBeliefs,
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
      SELECT gender, age_group, spiritual_beliefs, profile_completed
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
    const stmt = db.prepare('SELECT gender, age_group, spiritual_beliefs FROM users WHERE telegram_id = ?');
    const result = stmt.get(telegramId);
    
    if (!result) {
      return false;
    }
    
    // Profile is complete only if all 3 essential fields are filled
    const hasGender = result.gender && result.gender.trim() !== '';
    const hasAgeGroup = result.age_group && result.age_group.trim() !== '';
    const hasSpiritualBeliefs = result.spiritual_beliefs && result.spiritual_beliefs.trim() !== '';
    
    return hasGender && hasAgeGroup && hasSpiritualBeliefs;
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
    return result ? Boolean(Number(result.include_reversals)) : true;
  } catch (error) {
    console.error('❌ Error getting user reversal preference:', error);
    return true;
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

// Admin functions
export function getAllUserIds() {
  try {
    const stmt = db.prepare('SELECT telegram_id FROM users');
    const results = stmt.all();
    return results.map(row => row.telegram_id);
  } catch (error) {
    console.error('❌ Error getting all user IDs:', error);
    return [];
  }
}

export function getTotalReadings() {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM readings');
    const result = stmt.get();
    return result ? result.count : 0;
  } catch (error) {
    console.error('❌ Error getting total readings:', error);
    return 0;
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
    // Get user info
    const userStmt = db.prepare(`
      SELECT first_name, last_name, username, created_at, readings_count, last_reading_at
      FROM users 
      WHERE telegram_id = ?
    `);
    const user = userStmt.get(telegramId);
    
    if (!user) {
      return null;
    }
    
    // Get reading statistics
    const readingStatsStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_readings,
        SUM(CASE WHEN ai_enhanced = 1 THEN 1 ELSE 0 END) as ai_enhanced_readings,
        SUM(CASE WHEN personalized = 1 THEN 1 ELSE 0 END) as personalized_readings
      FROM readings 
      WHERE telegram_id = ?
    `);
    const readingStats = readingStatsStmt.get(telegramId);
    
    // Get favorite reading types from actual readings
    const favoriteTypesStmt = db.prepare(`
      SELECT 
        reading_type,
        COUNT(*) as count
      FROM readings 
      WHERE telegram_id = ?
      GROUP BY reading_type
      ORDER BY count DESC
      LIMIT 5
    `);
    
    const favoriteTypes = favoriteTypesStmt.all(telegramId);
    
    // If no readings found, provide default types
    if (favoriteTypes.length === 0) {
      favoriteTypes.push(
        { reading_type: 'Daily', count: 0 },
        { reading_type: 'Love', count: 0 },
        { reading_type: 'Career', count: 0 }
      );
    }
    
          return {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          created_at: user.created_at
        },
        stats: {
          total_readings: readingStats?.total_readings || 0,
          ai_enhanced_readings: readingStats?.ai_enhanced_readings || 0,
          personalized_readings: readingStats?.personalized_readings || 0,
          reading_types_used: favoriteTypes.length
        },
        favoriteTypes: favoriteTypes.map(item => ({
          type: item.reading_type || 'General',
          count: item.count
        }))
      };
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
      (telegram_id, question, reading_type, cards_drawn, interpretation, ai_enhanced, personalized, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(
      telegramId,
      readingData.question || '',
      readingData.readingType || 'general',
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
