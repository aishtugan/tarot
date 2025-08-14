// Tarot Reading Engine
// This is the main module that orchestrates the entire tarot reading process

import { getRandomCards, getRandomCard, getFullDeckCards, getDeckTypeDescription, getAvailableDeckTypes } from './cards.js';
import { getSpread, getDefaultSpread, isValidSpread } from './spreads.js';
import { interpretSpread, formatCompleteReading, getQuickInterpretation } from './interpreter.js';
import { generateTarotInterpretation, generatePersonalizedAdvice } from '../gpt.js';
import { getTranslation } from '../languages/index.js';
import { getUserProfile } from '../database/users.js';

/**
 * Main Tarot Reading Engine
 * This class handles the complete reading process from start to finish
 */
export class TarotReader {
  constructor() {
    this.readingHistory = [];
  }
  
  /**
   * Perform a complete tarot reading
   * @param {string} readingType - Type of reading (daily, love, career, general, etc.)
   * @param {string} userQuestion - User's specific question (optional)
   * @param {string} spreadName - Specific spread to use (optional)
   * @param {boolean} includeReversals - Whether to include reversed cards
   * @param {string} language - Language for AI responses (en, ru, es)
   * @param {number} telegramId - User's Telegram ID for profile lookup (optional)
   * @returns {Object} Complete reading result
   */
  async performReading(readingType = 'general', userQuestion = '', spreadName = null, includeReversals = true, language = 'en', telegramId = null) {
    try {
      console.log(`🔮 Starting ${readingType} reading...`);
      
      // Step 1: Determine the spread to use
      const spread = this.determineSpread(readingType, spreadName);
      console.log(`📏 Using spread: ${spread.name} (${spread.cardCount} cards)`);
      
      // Step 2: Select cards for the reading
      const cards = this.selectCards(spread.cardCount, readingType, includeReversals);
      console.log(`🎴 Selected ${cards.length} cards`);
      
      // Step 3: Determine which cards are reversed
      const reversedCards = includeReversals ? this.determineReversedCards(cards.length) : [];
      
      // Step 4: Interpret the cards
      const interpretations = interpretSpread(cards, spread.name, readingType, reversedCards);
      
      // Step 5: Get user profile for personalization
      let userProfile = null;
      if (telegramId) {
        try {
          userProfile = await getUserProfile(telegramId);
        } catch (error) {
          console.log('⚠️ Could not retrieve user profile');
        }
      }
      
      // Step 6: Generate AI-enhanced interpretation (if GPT is available)
      let aiEnhancedReading = null;
      try {
        aiEnhancedReading = await generateTarotInterpretation(cards, spread.name, readingType, userQuestion, language, userProfile);
        console.log('🤖 AI enhancement applied');
      } catch (error) {
        console.log('⚠️ AI enhancement failed, using standard interpretation');
      }
      
      // Step 7: Generate personalized advice
      let personalizedAdvice = null;
      try {
        personalizedAdvice = await generatePersonalizedAdvice(cards, readingType, userQuestion, language, userProfile);
        console.log('💡 Personalized advice generated');
      } catch (error) {
        console.log('⚠️ Personalized advice failed');
      }
      
      // Step 8: Format the complete reading
      const reading = formatCompleteReading(interpretations, spread.name, readingType, aiEnhancedReading, personalizedAdvice, language);
      
      // Step 9: Add user question if provided
      if (userQuestion) {
        reading.userQuestion = userQuestion;
      }
      
      // Step 10: Store in reading history
      this.readingHistory.push(reading);
      
      console.log(`✅ Reading completed successfully`);
      
      return reading;
      
    } catch (error) {
      console.error('❌ Error performing reading:', error.message);
      throw new Error(`Failed to perform reading: ${error.message}`);
    }
  }
  
  /**
   * Perform a quick single card reading
   * @param {string} readingType - Type of reading
   * @param {string} userQuestion - User's question
   * @param {string} language - Language for the reading
   * @returns {Object} Quick reading result
   */
  async performQuickReading(readingType = 'general', userQuestion = '', language = 'en') {
    try {
      console.log(`⚡ Performing quick reading...`);
      
      // Get a random card
      const card = getRandomCard();
      const isReversed = Math.random() < 0.3; // 30% chance of reversal
      
      // Get quick interpretation
      const interpretation = getQuickInterpretation(card, readingType, isReversed, language);
      
      const reading = {
        type: 'quick',
        readingType: readingType,
        card: card,
        interpretation: interpretation,
        isReversed: isReversed,
        userQuestion: userQuestion,
        timestamp: new Date().toISOString()
      };
      
      // Store in reading history
      this.readingHistory.push(reading);
      
      console.log(`✅ Quick reading completed`);
      
      return reading;
      
    } catch (error) {
      console.error('❌ Error performing quick reading:', error.message);
      throw new Error(`Failed to perform quick reading: ${error.message}`);
    }
  }
  
  /**
   * Perform a daily reading
   * @param {string} language - Language for AI responses
   * @returns {Object} Daily reading result
   */
  async performDailyReading(language = 'en', telegramId = null) {
    return this.performReading('daily', 'What guidance do I need for today?', 'single', true, language, telegramId);
  }
  
  /**
   * Perform a love reading
   * @param {string} userQuestion - Specific love question
   * @param {string} language - Language for AI responses
   * @returns {Object} Love reading result
   */
  async performLoveReading(userQuestion = '', language = 'en', telegramId = null) {
    const question = userQuestion || 'What guidance do I need for my love life?';
    return this.performReading('love', question, 'love', true, language, telegramId);
  }
  
  /**
   * Perform a career reading
   * @param {string} userQuestion - Specific career question
   * @param {string} language - Language for AI responses
   * @returns {Object} Career reading result
   */
  async performCareerReading(userQuestion = '', language = 'en', telegramId = null) {
    const question = userQuestion || 'What guidance do I need for my career?';
    return this.performReading('career', question, 'career', true, language, telegramId);
  }
  
  /**
   * Perform a general guidance reading
   * @param {string} userQuestion - User's question
   * @param {string} language - Language for AI responses
   * @returns {Object} General reading result
   */
  async performGeneralReading(userQuestion = '', language = 'en', telegramId = null) {
    return this.performReading('general', userQuestion, 'threeCard', true, language, telegramId);
  }

  /**
   * Perform a full deck reading with customizable options
   * @param {Object} options - Reading options
   * @param {string} options.deckType - 'full', 'majors', 'wands', 'cups', 'swords', 'pentacles'
   * @param {number} options.cardCount - Number of cards to draw (default: 3)
   * @param {string} options.userQuestion - User's question
   * @param {boolean} options.includeReversals - Whether to include reversed cards
   * @param {boolean} options.includeMinors - Whether to include minor arcana (for full deck)
   * @param {string} options.language - Language for AI responses (en, ru, es)
   * @returns {Object} Full deck reading result
   */
  async performFullDeckReading(options = {}) {
    try {
      const {
        deckType = 'full',
        cardCount = 3,
        userQuestion = '',
        includeReversals = true,
        includeMinors = true,
        language = 'en'
      } = options;
      
      console.log(`🔮 Starting full deck reading: ${deckType} (${cardCount} cards)`);
      
      // Get deck description for context
      const deckDescription = getDeckTypeDescription(deckType);
      console.log(`📚 Deck type: ${deckDescription}`);
      
      // Select cards based on deck type
      const cards = getFullDeckCards(cardCount, { deckType, includeMinors });
      console.log(`🎴 Selected ${cards.length} cards from ${deckType} deck`);
      
      // Determine reversed cards
      const reversedCards = includeReversals ? this.determineReversedCards(cards.length) : [];
      
      // Create spread name for this reading
      const spreadName = `${deckType.charAt(0).toUpperCase() + deckType.slice(1)} ${cardCount}-Card Reading`;
      
      // Interpret the cards
      const interpretations = interpretSpread(cards, spreadName, 'fullDeck', reversedCards);
      
      // Generate AI-enhanced interpretation
      let aiEnhancedReading = null;
      try {
        aiEnhancedReading = await generateTarotInterpretation(cards, spreadName, 'fullDeck', userQuestion, language);
        console.log('🤖 AI enhancement applied');
      } catch (error) {
        console.log('⚠️ AI enhancement failed, using standard interpretation');
      }
      
      // Generate personalized advice
      let personalizedAdvice = null;
      try {
        personalizedAdvice = await generatePersonalizedAdvice(cards, 'fullDeck', userQuestion, language);
        console.log('💡 Personalized advice generated');
      } catch (error) {
        console.log('⚠️ Personalized advice failed');
      }
      
      // Format the complete reading
      const reading = formatCompleteReading(interpretations, spreadName, 'fullDeck', aiEnhancedReading, personalizedAdvice);
      
      // Add metadata
      reading.deckType = deckType;
      reading.deckDescription = deckDescription;
      reading.cardCount = cards.length;
      reading.includeMinors = includeMinors;
      
      if (userQuestion) {
        reading.userQuestion = userQuestion;
      }
      
      // Store in reading history
      this.readingHistory.push(reading);
      
      console.log(`✅ Full deck reading completed successfully`);
      
      return reading;
      
    } catch (error) {
      console.error('❌ Error performing full deck reading:', error.message);
      throw new Error(`Failed to perform full deck reading: ${error.message}`);
    }
  }
  
  /**
   * Determine which spread to use for the reading
   * @param {string} readingType - Type of reading
   * @param {string} spreadName - Specific spread name (optional)
   * @returns {Object} Spread object
   */
  determineSpread(readingType, spreadName = null) {
    // If specific spread is requested, validate and use it
    if (spreadName && isValidSpread(spreadName)) {
      const spread = getSpread(spreadName);
      if (spread) {
        return spread;
      }
    }
    
    // Otherwise, use default spread for reading type
    const defaultSpreadName = getDefaultSpread(readingType);
    const spread = getSpread(defaultSpreadName);
    
    if (!spread) {
      throw new Error(`No valid spread found for reading type: ${readingType}`);
    }
    
    return spread;
  }
  
  /**
   * Select cards for the reading
   * @param {number} cardCount - Number of cards to select
   * @param {string} readingType - Type of reading
   * @param {boolean} includeReversals - Whether to include reversed cards
   * @returns {Array} Array of selected cards
   */
  selectCards(cardCount, readingType, includeReversals = true) {
    try {
      // Select cards based on reading type
      let cardType = 'all';
      
      // For specific reading types, we might want to favor certain card types
      switch (readingType) {
        case 'love':
          // Love readings might favor Cups (emotions) and Major Arcana
          cardType = Math.random() < 0.6 ? 'cups' : 'all';
          break;
        case 'career':
          // Career readings might favor Pentacles (material) and Major Arcana
          cardType = Math.random() < 0.6 ? 'pentacles' : 'all';
          break;
        case 'daily':
          // Daily readings can use any cards
          cardType = 'all';
          break;
        default:
          cardType = 'all';
      }
      
      const cards = getRandomCards(cardCount, cardType);
      
      console.log(`🎴 Selected cards: ${cards.map(card => card.name).join(', ')}`);
      
      return cards;
      
    } catch (error) {
      console.error('❌ Error selecting cards:', error.message);
      throw new Error(`Failed to select cards: ${error.message}`);
    }
  }
  
  /**
   * Determine which cards should be reversed
   * @param {number} cardCount - Number of cards in the reading
   * @returns {Array} Array of card indices that should be reversed
   */
  determineReversedCards(cardCount) {
    const reversedCards = [];
    
    // 30% chance for each card to be reversed
    for (let i = 0; i < cardCount; i++) {
      if (Math.random() < 0.3) {
        reversedCards.push(i);
      }
    }
    
    console.log(`🔄 Cards reversed: ${reversedCards.length} out of ${cardCount}`);
    
    return reversedCards;
  }
  
  /**
   * Get reading history
   * @param {number} limit - Maximum number of readings to return
   * @returns {Array} Array of recent readings
   */
  getReadingHistory(limit = 10) {
    return this.readingHistory
      .slice(-limit)
      .reverse(); // Most recent first
  }
  
  /**
   * Get a specific reading from history
   * @param {number} index - Index of the reading (0 = most recent)
   * @returns {Object|null} Reading object or null if not found
   */
  getReadingFromHistory(index) {
    const history = this.getReadingHistory();
    return history[index] || null;
  }
  
  /**
   * Clear reading history
   */
  clearReadingHistory() {
    this.readingHistory = [];
    console.log('🗑️ Reading history cleared');
  }
  
  /**
   * Get reading statistics
   * @returns {Object} Reading statistics
   */
  getReadingStats() {
    const totalReadings = this.readingHistory.length;
    const readingTypes = {};
    const spreadTypes = {};
    
    this.readingHistory.forEach(reading => {
      // Count reading types
      const type = reading.readingType || reading.type || 'unknown';
      readingTypes[type] = (readingTypes[type] || 0) + 1;
      
      // Count spread types
      const spread = reading.spreadName || 'quick';
      spreadTypes[spread] = (spreadTypes[spread] || 0) + 1;
    });
    
    return {
      totalReadings,
      readingTypes,
      spreadTypes,
      averageCardsPerReading: this.calculateAverageCardsPerReading()
    };
  }
  
  /**
   * Calculate average cards per reading
   * @returns {number} Average number of cards per reading
   */
  calculateAverageCardsPerReading() {
    if (this.readingHistory.length === 0) {
      return 0;
    }
    
    const totalCards = this.readingHistory.reduce((sum, reading) => {
      return sum + (reading.cardCount || 1);
    }, 0);
    
    return Math.round((totalCards / this.readingHistory.length) * 10) / 10;
  }
  
  /**
   * Format reading for display
   * @param {Object} reading - Reading object
   * @param {string} language - Language for display
   * @returns {string} Formatted reading text
   */
  formatReadingForDisplay(reading, language = 'en') {
    if (reading.type === 'quick') {
      return this.formatQuickReading(reading, language);
    } else {
      return this.formatFullReading(reading, language);
    }
  }
  
  /**
   * Format quick reading for display
   * @param {Object} reading - Quick reading object
   * @param {string} language - Language for display
   * @returns {string} Formatted quick reading
   */
  formatQuickReading(reading, language = 'en') {
    const readingType = reading.readingType.charAt(0).toUpperCase() + reading.readingType.slice(1);
    let text = getTranslation('quick_reading_title', language, { type: readingType }) + "\n\n";
    
    if (reading.userQuestion) {
      text += getTranslation('reading_your_question', language, { question: reading.userQuestion }) + "\n\n";
    }
    
    text += reading.interpretation;
    text += `\n\n⏰ *${getTranslation('reading_performed_on', language, { date: new Date(reading.timestamp).toLocaleString() })}*`;
    
    return text;
  }
  
  /**
   * Format full reading for display
   * @param {Object} reading - Full reading object
   * @param {string} language - Language for display
   * @returns {string} Formatted full reading
   */
  formatFullReading(reading, language = 'en') {
    let text = '';
    
    // Add narrative
    text += reading.narrative;
    text += '\n';
    
    // Add summary
    text += reading.summary;
    text += '\n';
    
    // Add advice
    text += reading.advice;
    text += '\n';
    
    // Add user question if provided
    if (reading.userQuestion) {
      text += getTranslation('reading_your_question', language, { question: reading.userQuestion }) + "\n\n";
    }
    
    // Add timestamp
    text += `⏰ *${getTranslation('reading_performed_on', language, { date: new Date(reading.timestamp).toLocaleString() })}*`;
    
    return text;
  }
}

// Export a singleton instance
export const tarotReader = new TarotReader();
