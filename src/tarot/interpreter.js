// Tarot Card Interpretation Module
// This module handles card interpretation and context-specific meanings

import { getCardMeaning, getCardKeywords, getCardDescription, isMajorArcana, getCardElement, getTranslatedCardName, getTranslatedCardMeaning } from './cards.js';
import { getPositionInfo } from './spreads.js';
import { getTranslation } from '../languages/index.js';

/**
 * Interpret a single card in a reading
 * @param {Object} card - The card object
 * @param {string} context - The reading context (general, love, career, health)
 * @param {boolean} isReversed - Whether the card is reversed
 * @param {Object} position - The position information (optional)
 * @returns {Object} Interpretation object
 */
export function interpretCard(card, context = 'general', isReversed = false, position = null) {
  // Get basic card information
  const meaning = getCardMeaning(card, context, isReversed);
  const keywords = getCardKeywords(card);
  const description = getCardDescription(card);
  const orientation = isReversed ? 'Reversed' : 'Upright';
  
  // Create interpretation object
  const interpretation = {
    card: card,
    name: card.name,
    suit: card.suit,
    orientation: orientation,
    isReversed: isReversed,
    isMajorArcana: isMajorArcana(card),
    element: getCardElement(card),
    keywords: keywords,
    description: description,
    meaning: meaning,
    context: context,
    position: position
  };
  
  // Add position-specific interpretation if position is provided
  if (position) {
    interpretation.positionName = position.name;
    interpretation.positionDescription = position.description;
    interpretation.positionMeaning = position.meaning;
  }
  
  return interpretation;
}

/**
 * Interpret multiple cards in a spread
 * @param {Array} cards - Array of card objects
 * @param {string} spreadName - Name of the spread
 * @param {string} context - The reading context
 * @param {Array} reversedCards - Array of card indices that are reversed (optional)
 * @returns {Array} Array of interpretation objects
 */
export function interpretSpread(cards, spreadName, context = 'general', reversedCards = []) {
  const interpretations = [];
  
  cards.forEach((card, index) => {
    const isReversed = reversedCards.includes(index);
    const position = getPositionInfo(spreadName, index + 1);
    
    const interpretation = interpretCard(card, context, isReversed, position);
    interpretations.push(interpretation);
  });
  
  return interpretations;
}

/**
 * Generate a narrative interpretation of a spread
 * @param {Array} interpretations - Array of card interpretations
 * @param {string} spreadName - Name of the spread
 * @param {string} context - The reading context
 * @param {string} language - Language for the narrative
 * @returns {string} Narrative interpretation
 */
export function generateNarrative(interpretations, spreadName, context = 'general', language = 'en') {
  let narrative = `🔮 **${spreadName.charAt(0).toUpperCase() + spreadName.slice(1)} Reading**\n\n`;
  
  // Add context-specific introduction
  const contextIntros = {
    love: getTranslation('reading_love_intro', language),
    career: getTranslation('reading_career_intro', language),
    health: getTranslation('reading_health_intro', language),
    general: getTranslation('reading_general_intro', language)
  };
  
  narrative += contextIntros[context] || getTranslation('reading_general_intro', language);
  narrative += getTranslation('reading_wisdom_intro', language) + "\n\n";
  
  // Interpret each card
  interpretations.forEach((interpretation, index) => {
    const cardNum = index + 1;
    const positionName = interpretation.positionName || `Card ${cardNum}`;
    
    narrative += `**${cardNum}. ${positionName}**\n`;
    narrative += `🎴 ${interpretation.name} (${interpretation.orientation})\n`;
    
    if (interpretation.isMajorArcana) {
      narrative += `✨ Major Arcana\n`;
    } else {
      narrative += `⚡ ${interpretation.suit} (${interpretation.element})\n`;
    }
    
    narrative += `📝 ${interpretation.meaning}\n\n`;
  });
  
  return narrative;
}

/**
 * Generate a summary interpretation
 * @param {Array} interpretations - Array of card interpretations
 * @param {string} context - The reading context
 * @returns {string} Summary interpretation
 */
export function generateSummary(interpretations, context = 'general', language = 'en') {
  let summary = getTranslation('reading_summary_title', language) + "\n\n";
  
  // Count card types
  const majorArcana = interpretations.filter(i => i.isMajorArcana).length;
  const minorArcana = interpretations.filter(i => !i.isMajorArcana).length;
  const reversed = interpretations.filter(i => i.isReversed).length;
  
  summary += getTranslation('reading_cards_drawn', language, { count: interpretations.length }) + "\n";
  summary += getTranslation('reading_major_arcana', language, { count: majorArcana }) + "\n";
  summary += getTranslation('reading_minor_arcana', language, { count: minorArcana }) + "\n";
  summary += getTranslation('reading_reversed', language, { count: reversed }) + "\n\n";
  
  // Analyze dominant themes
  const themes = analyzeThemes(interpretations);
  if (themes.length > 0) {
    summary += getTranslation('reading_dominant_themes', language) + "\n";
    themes.forEach(theme => {
      summary += `• ${theme}\n`;
    });
    summary += "\n";
  }
  
  // Generate overall message
  const overallMessage = generateOverallMessage(interpretations, context, language);
  summary += getTranslation('reading_overall_message', language) + "\n" + overallMessage + "\n\n";
  
  return summary;
}

/**
 * Analyze themes in a reading
 * @param {Array} interpretations - Array of card interpretations
 * @returns {Array} Array of dominant themes
 */
export function analyzeThemes(interpretations) {
  const themes = [];
  const keywordCounts = {};
  
  // Collect all keywords
  interpretations.forEach(interpretation => {
    interpretation.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  // Find dominant themes (keywords that appear multiple times)
  Object.entries(keywordCounts)
    .filter(([keyword, count]) => count > 1)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([keyword]) => {
      themes.push(keyword);
    });
  
  return themes;
}

/**
 * Generate overall message for the reading
 * @param {Array} interpretations - Array of card interpretations
 * @param {string} context - The reading context
 * @param {string} language - Language for the message
 * @returns {string} Overall message
 */
export function generateOverallMessage(interpretations, context, language = 'en') {
  const reversedCount = interpretations.filter(i => i.isReversed).length;
  const totalCards = interpretations.length;
  const reversedPercentage = (reversedCount / totalCards) * 100;
  
  let message = "";
  
  // Analyze the energy of the reading
  if (reversedPercentage > 50) {
    message += getTranslation('reading_challenges_high', language);
  } else if (reversedPercentage > 25) {
    message += getTranslation('reading_challenges_mixed', language);
  } else {
    message += getTranslation('reading_challenges_low', language);
  }
  
  // Add context-specific guidance
  const contextGuidance = {
    love: getTranslation('reading_guidance_love', language),
    career: getTranslation('reading_guidance_career', language),
    health: getTranslation('reading_guidance_health', language),
    general: getTranslation('reading_guidance_general', language)
  };
  
  message += contextGuidance[context] || getTranslation('reading_guidance_general', language);
  
  return message;
}

/**
 * Generate advice based on the reading
 * @param {Array} interpretations - Array of card interpretations
 * @param {string} context - The reading context
 * @param {string} language - Language for the advice
 * @returns {string} Advice
 */
export function generateAdvice(interpretations, context, language = 'en') {
  let advice = getTranslation('reading_advice_title', language) + "\n\n";
  
  // Analyze the cards for specific advice
  const advicePoints = [];
  
  interpretations.forEach(interpretation => {
    const meaning = interpretation.meaning.toLowerCase();
    
    // Extract advice based on card meanings
    if (meaning.includes('trust') || meaning.includes('intuition')) {
      advicePoints.push("Trust your intuition and inner wisdom");
    }
    if (meaning.includes('action') || meaning.includes('move')) {
      advicePoints.push("Take action and move forward with confidence");
    }
    if (meaning.includes('patience') || meaning.includes('wait')) {
      advicePoints.push("Practice patience and allow things to unfold naturally");
    }
    if (meaning.includes('change') || meaning.includes('transform')) {
      advicePoints.push("Embrace change and transformation in your life");
    }
    if (meaning.includes('balance') || meaning.includes('harmony')) {
      advicePoints.push("Seek balance and harmony in all areas of your life");
    }
    if (meaning.includes('release') || meaning.includes('let go')) {
      advicePoints.push("Release what no longer serves you");
    }
    if (meaning.includes('focus') || meaning.includes('concentrate')) {
      advicePoints.push("Focus your energy and attention on your goals");
    }
  });
  
  // Remove duplicates and limit to top advice
  const uniqueAdvice = [...new Set(advicePoints)].slice(0, 3);
  
  if (uniqueAdvice.length > 0) {
    uniqueAdvice.forEach((point, index) => {
      advice += `${index + 1}. ${point}\n`;
    });
  } else {
    advice += "1. Trust the journey and remain open to guidance\n";
    advice += "2. Listen to your inner voice and intuition\n";
    advice += "3. Take one step at a time toward your goals\n";
  }
  
  return advice;
}

/**
 * Format a complete reading interpretation
 * @param {Array} interpretations - Array of card interpretations
 * @param {string} spreadName - Name of the spread
 * @param {string} context - The reading context
 * @param {string} aiEnhancedReading - AI-enhanced interpretation (optional)
 * @param {string} personalizedAdvice - Personalized AI advice (optional)
 * @param {string} language - Language for the reading
 * @returns {Object} Complete reading object
 */
export function formatCompleteReading(interpretations, spreadName, context = 'general', aiEnhancedReading = null, personalizedAdvice = null, language = 'en') {
  const narrative = generateNarrative(interpretations, spreadName, context, language);
  const summary = generateSummary(interpretations, context, language);
  const advice = generateAdvice(interpretations, context, language);
  
  // Use AI-enhanced content if available
  const finalNarrative = aiEnhancedReading || narrative;
  const finalAdvice = personalizedAdvice || advice;
  
  return {
    spreadName: spreadName,
    context: context,
    cards: interpretations,
    narrative: finalNarrative,
    summary: summary,
    advice: finalAdvice,
    aiEnhanced: !!aiEnhancedReading,
    personalized: !!personalizedAdvice,
    timestamp: new Date().toISOString(),
    cardCount: interpretations.length
  };
}

/**
 * Get a quick interpretation for a single card
 * @param {Object} card - The card object
 * @param {string} context - The reading context
 * @param {boolean} isReversed - Whether the card is reversed
 * @param {string} language - Language for the interpretation
 * @returns {string} Quick interpretation text
 */
export function getQuickInterpretation(card, context = 'general', isReversed = false, language = 'en') {
  const meaning = getTranslatedCardMeaning(card, context, isReversed, language);
  const orientation = isReversed ? getTranslation('card_reversed', language) : getTranslation('card_upright', language);
  const translatedCardName = getTranslatedCardName(card, language);
  
  return `🎴 **${translatedCardName}** (${orientation})\n📝 ${meaning}`;
}
