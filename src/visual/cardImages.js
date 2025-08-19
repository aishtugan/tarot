// Tarot Card Images Module
// Provides simple, reliable card representations for Telegram

import { getTranslatedCardName } from '../tarot/cards.js';
import { getTranslation } from '../languages/index.js';

// Simple card representation using Unicode symbols and text
const CARD_SYMBOLS = {
  // Major Arcana symbols
  'The Fool': '🃏',
  'The Magician': '🔮',
  'The High Priestess': '🌙',
  'The Empress': '👑',
  'The Emperor': '⚜️',
  'The Hierophant': '⛪',
  'The Lovers': '💕',
  'The Chariot': '🏛️',
  'Strength': '🦁',
  'The Hermit': '🧙',
  'Wheel of Fortune': '🎡',
  'Justice': '⚖️',
  'The Hanged Man': '🕊️',
  'Death': '💀',
  'Temperance': '🍷',
  'The Devil': '😈',
  'The Tower': '🗼',
  'The Star': '⭐',
  'The Moon': '🌙',
  'The Sun': '☀️',
  'Judgement': '👼',
  'The World': '🌍',
  
  // Minor Arcana - Wands
  'Ace of Wands': '🔥',
  'Two of Wands': '🔥🔥',
  'Three of Wands': '🔥🔥🔥',
  'Four of Wands': '🔥🔥🔥🔥',
  'Five of Wands': '🔥🔥🔥🔥🔥',
  'Six of Wands': '🔥🔥🔥🔥🔥🔥',
  'Seven of Wands': '🔥🔥🔥🔥🔥🔥🔥',
  'Eight of Wands': '🔥🔥🔥🔥🔥🔥🔥🔥',
  'Nine of Wands': '🔥🔥🔥🔥🔥🔥🔥🔥🔥',
  'Ten of Wands': '🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥',
  'Page of Wands': '🔥👶',
  'Knight of Wands': '🔥🐎',
  'Queen of Wands': '🔥👸',
  'King of Wands': '🔥👑',
  
  // Minor Arcana - Cups
  'Ace of Cups': '💧',
  'Two of Cups': '💧💧',
  'Three of Cups': '💧💧💧',
  'Four of Cups': '💧💧💧💧',
  'Five of Cups': '💧💧💧💧💧',
  'Six of Cups': '💧💧💧💧💧💧',
  'Seven of Cups': '💧💧💧💧💧💧💧',
  'Eight of Cups': '💧💧💧💧💧💧💧💧',
  'Nine of Cups': '💧💧💧💧💧💧💧💧💧',
  'Ten of Cups': '💧💧💧💧💧💧💧💧💧💧',
  'Page of Cups': '💧👶',
  'Knight of Cups': '💧🐎',
  'Queen of Cups': '💧👸',
  'King of Cups': '💧👑',
  
  // Minor Arcana - Swords
  'Ace of Swords': '⚔️',
  'Two of Swords': '⚔️⚔️',
  'Three of Swords': '⚔️⚔️⚔️',
  'Four of Swords': '⚔️⚔️⚔️⚔️',
  'Five of Swords': '⚔️⚔️⚔️⚔️⚔️',
  'Six of Swords': '⚔️⚔️⚔️⚔️⚔️⚔️',
  'Seven of Swords': '⚔️⚔️⚔️⚔️⚔️⚔️⚔️',
  'Eight of Swords': '⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️',
  'Nine of Swords': '⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️',
  'Ten of Swords': '⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️⚔️',
  'Page of Swords': '⚔️👶',
  'Knight of Swords': '⚔️🐎',
  'Queen of Swords': '⚔️👸',
  'King of Swords': '⚔️👑',
  
  // Minor Arcana - Pentacles
  'Ace of Pentacles': '💰',
  'Two of Pentacles': '💰💰',
  'Three of Pentacles': '💰💰💰',
  'Four of Pentacles': '💰💰💰💰',
  'Five of Pentacles': '💰💰💰💰💰',
  'Six of Pentacles': '💰💰💰💰💰💰',
  'Seven of Pentacles': '💰💰💰💰💰💰💰',
  'Eight of Pentacles': '💰💰💰💰💰💰💰💰',
  'Nine of Pentacles': '💰💰💰💰💰💰💰💰💰',
  'Ten of Pentacles': '💰💰💰💰💰💰💰💰💰💰',
  'Page of Pentacles': '💰👶',
  'Knight of Pentacles': '💰🐎',
  'Queen of Pentacles': '💰👸',
  'King of Pentacles': '💰👑'
};

/**
 * Get card symbol representation
 * @param {string} cardName - Name of the card
 * @returns {string} Card symbol or default symbol
 */
export function getCardSymbol(cardName) {
  return CARD_SYMBOLS[cardName] || '🃏';
}

/**
 * Create a beautiful card representation using text and symbols
 * @param {Object} card - Card object
 * @param {string} language - User language
 * @returns {string} Formatted card representation
 */
export function createCardRepresentation(card, language = 'en') {
  const cardName = getTranslatedCardName(card, language);
  const symbol = getCardSymbol(card.name);
  const position = card.isReversed ? getTranslation('card_reversed', language) : getTranslation('card_upright', language);
  
  // Create a beautiful card frame using Unicode box drawing characters
  const cardFrame = [
    '┌─────────────────────────┐',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '│                         │',
    '└─────────────────────────┘'
  ];
  
  // Insert card symbol in the center
  const centerRow = Math.floor(cardFrame.length / 2);
  cardFrame[centerRow] = `│         ${symbol}         │`;
  
  // Add card name at the bottom
  const nameRow = cardFrame.length - 2;
  const namePadding = Math.max(0, 25 - cardName.length);
  const leftPadding = Math.floor(namePadding / 2);
  const rightPadding = namePadding - leftPadding;
  
  cardFrame[nameRow] = `│${' '.repeat(leftPadding)}${cardName}${' '.repeat(rightPadding)}│`;
  
  // Add position indicator
  const positionRow = 1;
  const positionText = `[${position}]`;
  const posPadding = Math.max(0, 25 - positionText.length);
  const posLeftPadding = Math.floor(posPadding / 2);
  const posRightPadding = posPadding - posLeftPadding;
  
  cardFrame[positionRow] = `│${' '.repeat(posLeftPadding)}${positionText}${' '.repeat(posRightPadding)}│`;
  
  return cardFrame.join('\n');
}

/**
 * Create a simple card display for inline messages
 * @param {Object} card - Card object
 * @param {string} language - User language
 * @returns {string} Simple card display
 */
export function createSimpleCardDisplay(card, language = 'en') {
  const cardName = getTranslatedCardName(card, language);
  const symbol = getCardSymbol(card.name);
  const position = card.isReversed ? getTranslation('card_reversed', language) : getTranslation('card_upright', language);
  
  return `${symbol} <b>${cardName}</b> (${position})`;
}

/**
 * Create a card gallery with symbols
 * @param {Array} cards - Array of card objects
 * @param {string} language - User language
 * @returns {string} Formatted gallery with symbols
 */
export function createCardGalleryWithSymbols(cards, language = 'en') {
  let text = `🎴 <b>${getTranslation('reading_cards_drawn', language, { count: cards.length })}</b>\n\n`;
  
  cards.forEach((card, index) => {
    const cardDisplay = createSimpleCardDisplay(card, language);
    text += `${index + 1}. ${cardDisplay}\n`;
  });
  
  return text;
}

export default {
  getCardSymbol,
  createCardRepresentation,
  createSimpleCardDisplay,
  createCardGalleryWithSymbols
};
