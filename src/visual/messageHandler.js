// Visual Message Handler for Tarot Bot
// Handles sending card images, animations, and enhanced messages

import { getCardImage, getAnimation, createEnhancedReading, createWelcomeMessage } from './index.js';
import { getTranslation } from '../languages/index.js';
import { getTranslatedCardName } from '../tarot/cards.js';
import { createCardRepresentation, createSimpleCardDisplay, createCardGalleryWithSymbols } from './cardImages.js';

/**
 * Send card image with caption
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Chat ID
 * @param {Object} card - Card object
 * @param {string} language - User language
 */
export async function sendCardImage(bot, chatId, card, language = 'en') {
  try {
    const cardImage = getCardImage(card.name);
    
    if (cardImage) {
      // Send the actual card image
      const caption = formatCardCaption(card, language);
      await bot.sendPhoto(chatId, cardImage, {
        caption: caption,
        parse_mode: 'HTML'
      });
      return true;
    } else {
      // Fallback to beautiful card representation using Unicode art
      const cardArt = createCardRepresentation(card, language);
      const caption = formatCardCaption(card, language);

      // Send the card art as a monospace text message
      await bot.sendMessage(chatId, `\`\`\`\n${cardArt}\n\`\`\`\n\n${caption}`, {
        parse_mode: 'MarkdownV2'
      });
      return true;
    }
  } catch (error) {
    console.error('Error sending card message:', error);
    // Fallback to simple text
    const simpleDisplay = createSimpleCardDisplay(card, language);
    await bot.sendMessage(chatId, simpleDisplay, { parse_mode: 'HTML' });
    return false;
  }
}

/**
 * Send card gallery (multiple cards)
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Chat ID
 * @param {Array} cards - Array of card objects
 * @param {string} language - User language
 */
export async function sendCardGallery(bot, chatId, cards, language = 'en') {
  try {
    // Try to send as a media group with images
    const mediaGroup = [];
    let hasImages = false;
    
    for (const card of cards) {
      const cardImage = getCardImage(card.name);
      if (cardImage) {
        hasImages = true;
        const caption = formatCardCaption(card, language);
        mediaGroup.push({
          type: 'photo',
          media: cardImage,
          caption: caption,
          parse_mode: 'HTML'
        });
      }
    }
    
    if (hasImages && mediaGroup.length > 0) {
      // Send as media group (max 10 photos per group)
      const chunks = [];
      for (let i = 0; i < mediaGroup.length; i += 10) {
        chunks.push(mediaGroup.slice(i, i + 10));
      }
      
      for (const chunk of chunks) {
        await bot.sendMediaGroup(chatId, chunk);
      }
      return true;
    } else {
      // Fallback to text gallery
      const galleryText = createCardGalleryWithSymbols(cards, language);

      // Add detailed captions for each card
      let detailedGallery = galleryText + '\n\n';
      for (const card of cards) {
        const caption = formatCardCaption(card, language);
        detailedGallery += `${caption}\n\n`;
      }

      await bot.sendMessage(chatId, detailedGallery, { parse_mode: 'HTML' });
      return true;
    }
  } catch (error) {
    console.error('Error sending card gallery:', error);
    // Final fallback to simple text
    const galleryText = createCardGalleryWithSymbols(cards, language);
    await bot.sendMessage(chatId, galleryText, { parse_mode: 'HTML' });
    return false;
  }
}

/**
 * Send reading with visual enhancements
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Chat ID
 * @param {Object} reading - Reading object
 * @param {string} language - User language
 * @param {boolean} showCards - Whether to show card images
 */
export async function sendEnhancedReading(bot, chatId, reading, language = 'en', showCards = true) {
  try {
    // Send reading in progress message
    await bot.sendMessage(chatId, getTranslation('reading_in_progress', language));
    
    // Send card images if requested
    if (showCards && reading.cards && reading.cards.length > 0) {
      if (reading.cards.length === 1) {
        // Single card - send as photo
        await sendCardImage(bot, chatId, reading.cards[0], language);
      } else {
        // Multiple cards - send as gallery
        await sendCardGallery(bot, chatId, reading.cards, language);
      }
    }
    
    // Send enhanced reading text
    const readingText = createEnhancedReading(reading, language);
    await bot.sendMessage(chatId, readingText, { parse_mode: 'HTML' });
    
    return true;
  } catch (error) {
    console.error('Error sending enhanced reading:', error);
    return false;
  }
}

/**
 * Send welcome message with visual enhancements
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Chat ID
 * @param {string} language - User language
 */
export async function sendWelcomeMessage(bot, chatId, language = 'en') {
  try {
    const welcomeText = createWelcomeMessage(language);
    
    // Send welcome message as text
    await bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML' });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return false;
  }
}

/**
 * Send survey question with visual formatting
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Chat ID
 * @param {Object} question - Question object
 * @param {string} language - User language
 */
export async function sendSurveyQuestion(bot, chatId, question, language = 'en') {
  try {
    const questionText = formatSurveyQuestionVisual(question, language);
    
    // Create inline keyboard for survey options
    const keyboard = {
      inline_keyboard: question.options.map((option, index) => [{
        text: `${index + 1}. ${option.label}`,
        callback_data: `survey_${index + 1}`
      }])
    };
    
    // Add navigation buttons
    keyboard.inline_keyboard.push([
      { text: getTranslation('survey_previous', language), callback_data: 'survey_prev' },
      { text: getTranslation('survey_cancel_survey', language), callback_data: 'survey_cancel' }
    ]);
    
    await bot.sendMessage(chatId, questionText, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    return true;
  } catch (error) {
    console.error('Error sending survey question:', error);
    return false;
  }
}

/**
 * Format card caption for image
 * @param {Object} card - Card object
 * @param {string} language - User language
 * @returns {string} Formatted caption
 */
function formatCardCaption(card, language = 'en') {
  // Use the proper card translation function
  const cardName = getTranslatedCardName(card, language);
  const position = card.reversed ? getTranslation('card_reversed', language) : getTranslation('card_upright', language);
  
  // Enhanced formatting for better visual appeal
  let caption = `🃏 <b>${cardName}</b>\n`;
  caption += `📊 <i>${position}</i>\n`;
  
  if (card.meaning) {
    const meaningKey = `card_meaning_${card.name.toLowerCase().replace(/\s+/g, '_')}_${card.reversed ? 'reversed' : 'upright'}_general`;
    const translatedMeaning = getTranslation(meaningKey, language);
    const finalMeaning = translatedMeaning && translatedMeaning !== meaningKey ? translatedMeaning : card.meaning;
    caption += `\n💭 <b>${getTranslation('card_meaning', language)}:</b>\n`;
    caption += `<i>${finalMeaning}</i>`;
  }
  
  return caption;
}

/**
 * Format survey question with visual formatting
 * @param {Object} question - Question object
 * @param {string} language - User language
 * @returns {string} Formatted question text
 */
function formatSurveyQuestionVisual(question, language = 'en') {
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

export default {
  sendCardImage,
  sendCardGallery,
  sendEnhancedReading,
  sendWelcomeMessage,
  sendSurveyQuestion
};
