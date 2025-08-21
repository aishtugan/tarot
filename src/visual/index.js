// Visual Effects Module for Tarot Bot
// Handles card images, animations, and enhanced formatting

import { getTranslation } from '../languages/index.js';
import { getTranslatedCardName } from '../tarot/cards.js';
import { createCardRepresentation, createSimpleCardDisplay, createCardGalleryWithSymbols } from './cardImages.js';

// Major Arcana cards that have images available
const MAJOR_ARCANA_CARDS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
];

// Animation URLs - Disabled for now
const ANIMATIONS = {
  // Animations removed to avoid annoyance
};

/**
 * Get card image URL
 * @param {string} cardName - Name of the card
 * @returns {string} Image URL or null if not found
 */
export function getCardImage(cardName) {
  // Use our locally generated tarot card images
  const cardMapping = {
    // Major Arcana - Updated to match actual filenames
    'The Fool': 'major/fool.jpg',
    'The Magician': 'major/magician.jpg',
    'The High Priestess': 'major/priestess.jpg',
    'The Empress': 'major/empress.jpg',
    'The Emperor': 'major/emperor.jpg',
    'The Hierophant': 'major/hierophant.jpg',
    'The Lovers': 'major/lovers.jpg',
    'The Chariot': 'major/chariot.jpg',
    'Strength': 'major/strength.jpg',
    'The Hermit': 'major/hermit.jpg',
    'Wheel of Fortune': 'major/fortune.jpg',
    'Justice': 'major/justice.jpg',
    'The Hanged Man': 'major/hanged.jpg',
    'Death': 'major/death.jpg',
    'Temperance': 'major/temperance.jpg',
    'The Devil': 'major/devil.jpg',
    'The Tower': 'major/tower.jpg',
    'The Star': 'major/star.jpg',
    'The Moon': 'major/moon.jpg',
    'The Sun': 'major/sun.jpg',
    'Judgement': 'major/judgement.jpg',
    'The World': 'major/world.jpg',
    
    // Minor Arcana - Wands
    'Ace of Wands': 'minor/wands/ace.jpg',
    'Two of Wands': 'minor/wands/two.jpg',
    'Three of Wands': 'minor/wands/three.jpg',
    'Four of Wands': 'minor/wands/four.jpg',
    'Five of Wands': 'minor/wands/five.jpg',
    'Six of Wands': 'minor/wands/six.jpg',
    'Seven of Wands': 'minor/wands/seven.jpg',
    'Eight of Wands': 'minor/wands/eight.jpg',
    'Nine of Wands': 'minor/wands/nine.jpg',
    'Ten of Wands': 'minor/wands/ten.jpg',
    'Page of Wands': 'minor/wands/page.jpg',
    'Knight of Wands': 'minor/wands/knight.jpg',
    'Queen of Wands': 'minor/wands/queen.jpg',
    'King of Wands': 'minor/wands/king.jpg',
    
    // Minor Arcana - Cups
    'Ace of Cups': 'minor/cups/ace.jpg',
    'Two of Cups': 'minor/cups/two.jpg',
    'Three of Cups': 'minor/cups/three.jpg',
    'Four of Cups': 'minor/cups/four.jpg',
    'Five of Cups': 'minor/cups/five.jpg',
    'Six of Cups': 'minor/cups/six.jpg',
    'Seven of Cups': 'minor/cups/seven.jpg',
    'Eight of Cups': 'minor/cups/eight.jpg',
    'Nine of Cups': 'minor/cups/nine.jpg',
    'Ten of Cups': 'minor/cups/ten.jpg',
    'Page of Cups': 'minor/cups/page.jpg',
    'Knight of Cups': 'minor/cups/knight.jpg',
    'Queen of Cups': 'minor/cups/queen.jpg',
    'King of Cups': 'minor/cups/king.jpg',
    
    // Minor Arcana - Swords
    'Ace of Swords': 'minor/swords/ace.jpg',
    'Two of Swords': 'minor/swords/two.jpg',
    'Three of Swords': 'minor/swords/three.jpg',
    'Four of Swords': 'minor/swords/four.jpg',
    'Five of Swords': 'minor/swords/five.jpg',
    'Six of Swords': 'minor/swords/six.jpg',
    'Seven of Swords': 'minor/swords/seven.jpg',
    'Eight of Swords': 'minor/swords/eight.jpg',
    'Nine of Swords': 'minor/swords/nine.jpg',
    'Ten of Swords': 'minor/swords/ten.jpg',
    'Page of Swords': 'minor/swords/page.jpg',
    'Knight of Swords': 'minor/swords/knight.jpg',
    'Queen of Swords': 'minor/swords/queen.jpg',
    'King of Swords': 'minor/swords/king.jpg',
    
    // Minor Arcana - Pentacles
    'Ace of Pentacles': 'minor/pentacles/ace.jpg',
    'Two of Pentacles': 'minor/pentacles/two.jpg',
    'Three of Pentacles': 'minor/pentacles/three.jpg',
    'Four of Pentacles': 'minor/pentacles/four.jpg',
    'Five of Pentacles': 'minor/pentacles/five.jpg',
    'Six of Pentacles': 'minor/pentacles/six.jpg',
    'Seven of Pentacles': 'minor/pentacles/seven.jpg',
    'Eight of Pentacles': 'minor/pentacles/eight.jpg',
    'Nine of Pentacles': 'minor/pentacles/nine.jpg',
    'Ten of Pentacles': 'minor/pentacles/ten.jpg',
    'Page of Pentacles': 'minor/pentacles/page.jpg',
    'Knight of Pentacles': 'minor/pentacles/knight.jpg',
    'Queen of Pentacles': 'minor/pentacles/queen.jpg',
    'King of Pentacles': 'minor/pentacles/king.jpg'
  };
  
  const imagePath = cardMapping[cardName];
  if (imagePath) {
    // Return the local image path
    return `images/${imagePath}`;
  }
  
  return null;
}

/**
 * Get animation URL
 * @param {string} animationType - Type of animation
 * @returns {string} Animation URL or null if not found
 */
export function getAnimation(animationType) {
  return ANIMATIONS[animationType] || null;
}

/**
 * Format card display with visual elements
 * @param {Object} card - Card object
 * @param {string} language - User language
 * @returns {string} Formatted card text
 */
export function formatCardDisplay(card, language = 'en') {
  // Use our new beautiful card representation system
  return createSimpleCardDisplay(card, language);
}

/**
 * Create card gallery message
 * @param {Array} cards - Array of card objects
 * @param {string} language - User language
 * @returns {string} Formatted gallery text
 */
export function createCardGallery(cards, language = 'en') {
  // Use our new beautiful card gallery with symbols
  return createCardGalleryWithSymbols(cards, language);
}

/**
 * Create enhanced reading message with visual elements
 * @param {Object} reading - Reading object
 * @param {string} language - User language
 * @returns {string} Enhanced reading text
 */
export function createEnhancedReading(reading, language = 'en') {
  let text = `🔮 <b>${getTranslation('reading_summary_title', language)}</b>\n\n`;
  
  // Add card gallery
  text += createCardGallery(reading.cards, language);
  text += '\n';
  
  // Add interpretation
  if (reading.narrative) {
    text += `💫 <b>${getTranslation('reading_overall_message', language)}</b>\n`;
    text += `${reading.narrative}\n\n`;
  }
  
  // Add advice
  if (reading.advice) {
    text += `💡 <b>${getTranslation('reading_advice_title', language)}</b>\n`;
    text += `${reading.advice}\n\n`;
  }
  
  // Add personalization note if applicable
  if (reading.personalized) {
    text += `✨ <i>${getTranslation('reading_personalized_note', language)}</i>\n`;
  }
  
  return text;
}

/**
 * Create survey question with visual formatting
 * @param {Object} question - Question object
 * @param {string} language - User language
 * @returns {string} Formatted question text
 */
export function formatSurveyQuestionVisual(question, language = 'en') {
  let text = `📝 <b>${question.question}</b>\n\n`;
  text += `📊 ${getTranslation('survey_progress', language, { 
    current: question.progress.split('/')[0], 
    total: question.progress.split('/')[1] 
  })}\n\n`;
  
  question.options.forEach((option, index) => {
    text += `${index + 1}. ${option.label}\n`;
  });
  
  text += `\n💡 ${getTranslation('survey_skip', language)}`;
  
  return text;
}

/**
 * Create welcome message with visual elements
 * @param {string} language - User language
 * @returns {string} Enhanced welcome message
 */
export function createWelcomeMessage(language = 'en') {
  let text = `🔮 <b>${getTranslation('welcome_title', language)}</b>\n\n`;
  text += `${getTranslation('welcome_message', language)}\n\n`;
  text += `✨ <b>${getTranslation('welcome_features', language)}</b>\n`;
  text += `• ${getTranslation('feature_cards', language)}\n`;
  text += `• ${getTranslation('feature_ai', language)}\n`;
  text += `• ${getTranslation('feature_personalized', language)}\n`;
  text += `• ${getTranslation('feature_multilingual', language)}\n\n`;
  text += `💫 ${getTranslation('welcome_instruction', language)}`;
  
  return text;
}

export default {
  getCardImage,
  getAnimation,
  formatCardDisplay,
  createCardGallery,
  createEnhancedReading,
  formatSurveyQuestionVisual,
  createWelcomeMessage
};
