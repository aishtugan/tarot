// User Management Module
// Handles user registration, updates, and statistics

import { getDatabase } from './init.js';

/**
 * Register a new user
 * @param {number} id - Telegram user ID
 * @param {string} username - Telegram username
 * @param {string} first_name - User's first name
 * @param {string} last_name - User's last name
 * @returns {Object} User object
 */
export function registerUser(id, username, first_name, last_name) {
  const db = getDatabase();
  
  try {
    const result = db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, last_name, language)
      VALUES (?, ?, ?, ?, 'en')
    `).run(id, username, first_name, last_name);

    return {
      id: result.lastInsertRowid,
      telegram_id: id,
      username,
      first_name,
      last_name,
      language: 'en',
      profile_completed: false,
      total_readings: 0,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      // User already exists, return existing user
      return getUser(id);
    }
    throw error;
  }
}

/**
 * Get user by Telegram ID
 * @param {number} telegramId - Telegram user ID
 * @returns {Object|null} User object or null
 */
export function getUser(telegramId) {
  const db = getDatabase();
  
  const user = db.prepare(`
    SELECT * FROM users WHERE telegram_id = ?
  `).get(telegramId);
  
  return user || null;
}

/**
 * Get user language
 * @param {number} telegramId - Telegram user ID
 * @returns {Object|null} User object with language or null
 */
export function getUserLanguage(telegramId) {
  const db = getDatabase();
  
  const user = db.prepare(`
    SELECT language FROM users WHERE telegram_id = ?
  `).get(telegramId);
  
  return user || null;
}

/**
 * Set user language
 * @param {number} telegramId - Telegram user ID
 * @param {string} language - Language code
 */
export function setUserLanguage(telegramId, language) {
  const db = getDatabase();
  
  db.prepare(`
    UPDATE users SET language = ?, last_activity = CURRENT_TIMESTAMP 
    WHERE telegram_id = ?
  `).run(language, telegramId);
  
  console.log(`🌍 Language updated to ${language} for user ${telegramId}`);
}

/**
 * Update user profile information
 * @param {number} telegramId - Telegram user ID
 * @param {Object} profileData - Profile information
 */
export function updateUserProfile(telegramId, profileData) {
  const db = getDatabase();
  
  const {
    gender,
    age_group,
    emotional_state,
    life_focus,
    spiritual_beliefs,
    relationship_status,
    career_stage
  } = profileData;
  
  db.prepare(`
    UPDATE users SET 
      gender = ?,
      age_group = ?,
      emotional_state = ?,
      life_focus = ?,
      spiritual_beliefs = ?,
      relationship_status = ?,
      career_stage = ?,
      profile_completed = TRUE,
      last_activity = CURRENT_TIMESTAMP
    WHERE telegram_id = ?
  `).run(
    gender,
    age_group,
    emotional_state,
    life_focus,
    spiritual_beliefs,
    relationship_status,
    career_stage,
    telegramId
  );
  
  console.log(`👤 Profile updated for user ${telegramId}`);
}

/**
 * Get user profile information
 * @param {number} telegramId - Telegram user ID
 * @returns {Object|null} User profile or null
 */
export function getUserProfile(telegramId) {
  const db = getDatabase();
  
  const profile = db.prepare(`
    SELECT 
      profile_completed,
      gender,
      age_group,
      emotional_state,
      life_focus,
      spiritual_beliefs,
      relationship_status,
      career_stage
    FROM users WHERE telegram_id = ?
  `).get(telegramId);
  
  return profile || null;
}

/**
 * Check if user profile is completed
 * @param {number} telegramId - Telegram user ID
 * @returns {boolean} True if profile is completed
 */
export function isProfileCompleted(telegramId) {
  const profile = getUserProfile(telegramId);
  return profile ? profile.profile_completed : false;
}

/**
 * Increment user's reading count
 * @param {number} telegramId - Telegram user ID
 */
export function incrementReadingCount(telegramId) {
  const db = getDatabase();
  
  db.prepare(`
    UPDATE users SET 
      total_readings = total_readings + 1,
      last_activity = CURRENT_TIMESTAMP
    WHERE telegram_id = ?
  `).run(telegramId);
}

/**
 * Get user statistics
 * @param {number} telegramId - Telegram user ID
 * @returns {Object} User statistics
 */
export function getUserStats(telegramId) {
  const db = getDatabase();
  
  // Get user info
  const user = getUser(telegramId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get reading statistics from readings table
  const readingStats = db.prepare(`
    SELECT 
      COUNT(*) as total_readings,
      SUM(CASE WHEN ai_enhanced = 1 THEN 1 ELSE 0 END) as ai_enhanced_readings,
      SUM(CASE WHEN personalized = 1 THEN 1 ELSE 0 END) as personalized_readings,
      COUNT(DISTINCT reading_type) as types_used
    FROM readings r
    JOIN users u ON r.user_id = u.id
    WHERE u.telegram_id = ?
  `).get(telegramId);
  
  // Get favorite reading types
  const favoriteTypes = db.prepare(`
    SELECT 
      reading_type,
      COUNT(*) as count
    FROM readings r
    JOIN users u ON r.user_id = u.id
    WHERE u.telegram_id = ?
    GROUP BY reading_type
    ORDER BY count DESC
    LIMIT 5
  `).all(telegramId);
  
  return {
    user: {
      name: user.first_name || user.username || 'Unknown',
      member_since: user.created_at,
      profile_completed: user.profile_completed || false
    },
    stats: {
      total_readings: readingStats.total_readings || user.total_readings || 0,
      ai_enhanced_readings: readingStats.ai_enhanced_readings || 0,
      personalized_readings: readingStats.personalized_readings || 0,
      types_used: readingStats.types_used || 0
    },
    favorite_types: favoriteTypes
  };
}

/**
 * Store a reading in the database
 * @param {number} telegramId - Telegram user ID
 * @param {Object} readingData - Reading data
 */
export function storeReading(telegramId, readingData) {
  const db = getDatabase();
  
  const user = getUser(telegramId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const {
    readingType,
    spreadName,
    cards,
    interpretation,
    userQuestion,
    aiEnhanced = false,
    personalized = false
  } = readingData;
  
  db.prepare(`
    INSERT INTO readings (
      user_id, reading_type, spread_name, cards, interpretation, 
      user_question, ai_enhanced, personalized
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    readingType,
    spreadName,
    JSON.stringify(cards),
    interpretation,
    userQuestion,
    aiEnhanced ? 1 : 0,
    personalized ? 1 : 0
  );
  
  console.log(`📊 Reading stored for user ${telegramId}`);
}

/**
 * Get all users (for admin purposes)
 * @returns {Array} Array of user objects
 */
export function getAllUsers() {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT 
      telegram_id,
      username,
      first_name,
      last_name,
      language,
      profile_completed,
      total_readings,
      created_at,
      last_activity
    FROM users
    ORDER BY created_at DESC
  `).all();
}

export default {
  registerUser,
  getUser,
  getUserLanguage,
  setUserLanguage,
  updateUserProfile,
  getUserProfile,
  isProfileCompleted,
  incrementReadingCount,
  getUserStats,
  storeReading,
  getAllUsers
};
