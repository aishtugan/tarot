// Tarot Card Management Module
// This module handles loading, selecting, and managing tarot cards from the database

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getTranslation } from '../languages/index.js';

// Get the current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load tarot card data from JSON file
let tarotCards = null;

/**
 * Load tarot cards from the JSON database
 * @returns {Object} Complete tarot card database
 */
export function loadTarotCards() {
  try {
    // Load the tarot cards JSON file
    const cardsPath = join(__dirname, '../../data/tarot-cards.json');
    const cardsData = readFileSync(cardsPath, 'utf8');
    tarotCards = JSON.parse(cardsData);
    
    console.log('✅ Tarot cards loaded successfully');
    console.log(`📊 Loaded ${tarotCards.majorArcana.length} Major Arcana cards`);
    console.log(`📊 Loaded ${Object.keys(tarotCards.minorArcana).length} Minor Arcana suits`);
    
    return tarotCards;
  } catch (error) {
    console.error('❌ Error loading tarot cards:', error.message);
    throw new Error('Failed to load tarot card database');
  }
}

/**
 * Get all available tarot cards
 * @returns {Object} Complete tarot card database
 */
export function getAllCards() {
  if (!tarotCards) {
    loadTarotCards();
  }
  return tarotCards;
}

/**
 * Get all Major Arcana cards
 * @returns {Array} Array of Major Arcana cards
 */
export function getMajorArcana() {
  if (!tarotCards) {
    loadTarotCards();
  }
  return tarotCards.majorArcana;
}

/**
 * Get all Minor Arcana cards from a specific suit
 * @param {string} suit - The suit to get cards from (wands, cups, swords, pentacles)
 * @returns {Array} Array of Minor Arcana cards from the specified suit
 */
export function getMinorArcana(suit) {
  if (!tarotCards) {
    loadTarotCards();
  }
  
  const validSuits = ['wands', 'cups', 'swords', 'pentacles'];
  if (!validSuits.includes(suit)) {
    throw new Error(`Invalid suit: ${suit}. Must be one of: ${validSuits.join(', ')}`);
  }
  
  return tarotCards.minorArcana[suit] || [];
}

/**
 * Get all Minor Arcana cards from all suits
 * @returns {Array} Array of all Minor Arcana cards
 */
export function getAllMinorArcana() {
  if (!tarotCards) {
    loadTarotCards();
  }
  
  const allMinorArcana = [];
  Object.values(tarotCards.minorArcana).forEach(suitCards => {
    allMinorArcana.push(...suitCards);
  });
  
  return allMinorArcana;
}

/**
 * Get a specific card by name
 * @param {string} cardName - The name of the card to find
 * @returns {Object|null} The card object or null if not found
 */
export function getCardByName(cardName) {
  if (!tarotCards) {
    loadTarotCards();
  }
  
  // Search in Major Arcana
  const majorCard = tarotCards.majorArcana.find(card => 
    card.name.toLowerCase() === cardName.toLowerCase()
  );
  
  if (majorCard) {
    return majorCard;
  }
  
  // Search in Minor Arcana
  for (const suit of Object.values(tarotCards.minorArcana)) {
    const minorCard = suit.find(card => 
      card.name.toLowerCase() === cardName.toLowerCase()
    );
    
    if (minorCard) {
      return minorCard;
    }
  }
  
  return null;
}

/**
 * Get a random card from the entire deck
 * @returns {Object} Randomly selected card
 */
export function getRandomCard() {
  if (!tarotCards) {
    loadTarotCards();
  }
  
  // Combine all cards
  const allCards = [
    ...tarotCards.majorArcana,
    ...getAllMinorArcana()
  ];
  
  // Select random card
  const randomIndex = Math.floor(Math.random() * allCards.length);
  return allCards[randomIndex];
}

/**
 * Get a random Major Arcana card
 * @returns {Object} Randomly selected Major Arcana card
 */
export function getRandomMajorArcana() {
  if (!tarotCards) {
    loadTarotCards();
  }
  
  const randomIndex = Math.floor(Math.random() * tarotCards.majorArcana.length);
  return tarotCards.majorArcana[randomIndex];
}

/**
 * Get a random Minor Arcana card from a specific suit
 * @param {string} suit - The suit to select from (wands, cups, swords, pentacles)
 * @returns {Object} Randomly selected Minor Arcana card
 */
export function getRandomMinorArcana(suit) {
  const suitCards = getMinorArcana(suit);
  
  if (suitCards.length === 0) {
    throw new Error(`No cards found in suit: ${suit}`);
  }
  
  const randomIndex = Math.floor(Math.random() * suitCards.length);
  return suitCards[randomIndex];
}

/**
 * Get multiple random cards (without duplicates)
 * @param {number} count - Number of cards to select
 * @param {string} type - Type of cards to select ('all', 'major', 'minor', or specific suit)
 * @returns {Array} Array of randomly selected cards
 */
export function getRandomCards(count, type = 'all') {
  if (!tarotCards) {
    loadTarotCards();
  }
  
  let availableCards = [];
  
  // Select card pool based on type
  switch (type.toLowerCase()) {
    case 'major':
      availableCards = [...tarotCards.majorArcana];
      break;
    case 'minor':
      availableCards = [...getAllMinorArcana()];
      break;
    case 'wands':
    case 'cups':
    case 'swords':
    case 'pentacles':
      availableCards = [...getMinorArcana(type.toLowerCase())];
      break;
    case 'all':
    default:
      availableCards = [
        ...tarotCards.majorArcana,
        ...getAllMinorArcana()
      ];
      break;
  }
  
  // Ensure we don't try to select more cards than available
  const maxCount = Math.min(count, availableCards.length);
  const selectedCards = [];
  
  // Select random cards without duplicates
  for (let i = 0; i < maxCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    selectedCards.push(availableCards.splice(randomIndex, 1)[0]);
  }
  
  return selectedCards;
}

/**
 * Get cards for full deck reading with specified options
 * @param {number} count - Number of cards to select
 * @param {Object} options - Reading options
 * @param {string} options.deckType - 'full', 'majors', 'wands', 'cups', 'swords', 'pentacles'
 * @param {boolean} options.includeMinors - Whether to include minor arcana (default: true)
 * @returns {Array} Array of randomly selected cards
 */
export function getFullDeckCards(count, options = {}) {
  const {
    deckType = 'full',
    includeMinors = true
  } = options;
  
  if (!tarotCards) {
    loadTarotCards();
  }
  
  let availableCards = [];
  
  // Select card pool based on deck type
  switch (deckType.toLowerCase()) {
    case 'majors':
      // Majors-only reading
      availableCards = [...tarotCards.majorArcana];
      break;
      
    case 'wands':
      // Wands suit - motivation, creativity, passion
      availableCards = [...getMinorArcana('wands')];
      break;
      
    case 'cups':
      // Cups suit - emotions, relationships, intuition
      availableCards = [...getMinorArcana('cups')];
      break;
      
    case 'swords':
      // Swords suit - thoughts, challenges, communication
      availableCards = [...getMinorArcana('swords')];
      break;
      
    case 'pentacles':
      // Pentacles suit - material matters, work, finances
      availableCards = [...getMinorArcana('pentacles')];
      break;
      
    case 'full':
    default:
      // Full deck reading
      if (includeMinors) {
        // Include both majors and minors
        availableCards = [
          ...tarotCards.majorArcana,
          ...getAllMinorArcana()
        ];
      } else {
        // Majors only
        availableCards = [...tarotCards.majorArcana];
      }
      break;
  }
  
  // Ensure we don't try to select more cards than available
  const maxCount = Math.min(count, availableCards.length);
  const selectedCards = [];
  
  // Select random cards without duplicates
  for (let i = 0; i < maxCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    selectedCards.push(availableCards.splice(randomIndex, 1)[0]);
  }
  
  return selectedCards;
}

/**
 * Get deck type description for user guidance
 * @param {string} deckType - The type of deck being used
 * @returns {string} Description of the deck type
 */
export function getDeckTypeDescription(deckType) {
  const descriptions = {
    'full': 'Full deck (Majors + Minors) - Big themes and practical guidance',
    'majors': 'Major Arcana only - High-level direction and major life themes',
    'wands': 'Wands suit - Motivation, creativity, passion, and action',
    'cups': 'Cups suit - Emotions, relationships, intuition, and love',
    'swords': 'Swords suit - Thoughts, challenges, communication, and decisions',
    'pentacles': 'Pentacles suit - Material matters, work, finances, and practical concerns'
  };
  
  return descriptions[deckType.toLowerCase()] || descriptions['full'];
}

/**
 * Get available deck types for selection
 * @returns {Array} Array of available deck types with descriptions
 */
export function getAvailableDeckTypes() {
  return [
    { value: 'full', label: 'Full Deck', description: 'Majors + Minors (recommended)' },
    { value: 'majors', label: 'Major Arcana Only', description: 'High-level direction' },
    { value: 'wands', label: 'Wands Suit', description: 'Motivation & creativity' },
    { value: 'cups', label: 'Cups Suit', description: 'Emotions & relationships' },
    { value: 'swords', label: 'Swords Suit', description: 'Thoughts & challenges' },
    { value: 'pentacles', label: 'Pentacles Suit', description: 'Material & practical matters' }
  ];
}

/**
 * Get card meaning for a specific context
 * @param {Object} card - The card object
 * @param {string} context - The context (general, love, career, health)
 * @param {boolean} isReversed - Whether the card is reversed
 * @returns {string} The card meaning for the specified context
 */
export function getCardMeaning(card, context = 'general', isReversed = false) {
  if (!card || !card.meanings) {
    return 'Meaning not available for this card.';
  }
  
  const orientation = isReversed ? 'reversed' : 'upright';
  const meanings = card.meanings[orientation];
  
  if (!meanings) {
    return 'Meaning not available for this orientation.';
  }
  
  return meanings[context] || meanings.general || 'Meaning not available for this context.';
}

/**
 * Get translated card meaning for a specific context
 * @param {Object} card - The card object
 * @param {string} context - The context (general, love, career, health)
 * @param {boolean} isReversed - Whether the card is reversed
 * @param {string} language - Language code
 * @returns {string} The translated card meaning for the specified context
 */
export function getTranslatedCardMeaning(card, context = 'general', isReversed = false, language = 'en') {
  if (!card || !card.name) {
    return getTranslation('card_meaning_not_available', language);
  }
  
  // Try to get translated meaning from the translation system
  const orientation = isReversed ? 'reversed' : 'upright';
  const translationKey = `card_meaning_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${orientation}_${context}`;
  const translatedMeaning = getTranslation(translationKey, language);
  
  // If translation exists and is not the same as the key, use it
  if (translatedMeaning && translatedMeaning !== translationKey) {
    return translatedMeaning;
  }
  
  // Fallback to original meaning from card database
  return getCardMeaning(card, context, isReversed);
}

/**
 * Get card keywords
 * @param {Object} card - The card object
 * @returns {Array} Array of card keywords
 */
export function getCardKeywords(card) {
  return card.keywords || [];
}

/**
 * Get card description
 * @param {Object} card - The card object
 * @returns {string} Card description
 */
export function getCardDescription(card) {
  return card.description || 'No description available for this card.';
}

/**
 * Get translated card name
 * @param {Object} card - The card object
 * @param {string} language - Language code
 * @returns {string} Translated card name
 */
export function getTranslatedCardName(card, language = 'en') {
  if (!card || !card.name) {
    return 'Unknown Card';
  }
  
  // Try to get translated name from the translation system
  const translationKey = `card_name_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const translatedName = getTranslation(translationKey, language);
  
  // If translation exists and is not the same as the key, use it
  if (translatedName && translatedName !== translationKey) {
    return translatedName;
  }
  
  // For Minor Arcana cards that don't have translations yet, return the original name
  // This prevents showing the translation key like "card_name_three_of_pentacles"
  return card.name;
}

/**
 * Get translated card description
 * @param {Object} card - The card object
 * @param {string} language - Language code
 * @returns {string} Translated card description
 */
export function getTranslatedCardDescription(card, language = 'en') {
  if (!card || !card.description) {
    return getTranslation('card_no_description', language);
  }
  
  // Try to get translated description from the translation system
  const translationKey = `card_desc_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const translatedDesc = getTranslation(translationKey, language);
  
  // If translation exists and is not the same as the key, use it
  if (translatedDesc && translatedDesc !== translationKey) {
    return translatedDesc;
  }
  
  // Fallback to original description
  return card.description;
}

/**
 * Check if a card is Major Arcana
 * @param {Object} card - The card object
 * @returns {boolean} True if the card is Major Arcana
 */
export function isMajorArcana(card) {
  return card.suit === 'Major Arcana';
}

/**
 * Check if a card is Minor Arcana
 * @param {Object} card - The card object
 * @returns {boolean} True if the card is Minor Arcana
 */
export function isMinorArcana(card) {
  return card.suit !== 'Major Arcana';
}

/**
 * Get the element of a Minor Arcana card
 * @param {Object} card - The card object
 * @returns {string|null} The element of the card or null if Major Arcana
 */
export function getCardElement(card) {
  if (isMajorArcana(card)) {
    return null;
  }
  
  return card.element || null;
}

// Initialize cards when module is loaded
loadTarotCards();
