import "dotenv/config";
import express from "express";
import TelegramBot from "node-telegram-bot-api";

// Suppress deprecation warnings for node-telegram-bot-api
process.removeAllListeners('warning');
import { tarotReader } from "./tarot/reader.js";
import { initDatabase } from "./database/init.js";
import { registerUser, incrementReadingCount, getUserStats, storeReading, getUserProfile } from "./database/users.js";
import { truncateMessage } from "./utils/messageSplitter.js";
import { 
  detectLanguage, 
  getUserPreferredLanguage, 
  setUserPreferredLanguage, 
  getTranslation, 
  SUPPORTED_LANGUAGES 
} from "./languages/index.js";
import { surveyManager, shouldCompleteSurvey, getSurveyIntroduction, getSurveyBenefits } from "./survey/index.js";
import { sendEnhancedReading, sendWelcomeMessage, sendSurveyQuestion } from "./visual/messageHandler.js";

// Validate env
const required = ["OPENAI_API_KEY", "TELEGRAM_BOT_TOKEN"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing required env vars:", missing.join(", "));
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Simple health endpoint (useful for hosting)
app.get("/health", (_req, res) => res.json({ ok: true }));

// Initialize database
initDatabase();

// Start HTTP server (optional for polling, but handy for deploys)
app.listen(PORT, () => {
  console.log(`HTTP server listening on http://localhost:${PORT}`);
});

// Telegram bot (long polling)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text ?? "";

  // Register or update user
  try {
    registerUser(
      msg.from.id,
      msg.from.username || null,
      msg.from.first_name || null,
      msg.from.last_name || null
    );
  } catch (error) {
    console.error('❌ Error registering user:', error.message);
  }

  if (!text) {
    return bot.sendMessage(chatId, "Please send text messages only 🙂");
  }

  // Get user's language preference
  const userLanguage = await getUserPreferredLanguage(chatId);
  
  // Handle commands
  if (text.startsWith("/")) {
    return handleCommand(chatId, text, userLanguage);
  }

  // Handle regular messages as tarot questions
  try {
    await bot.sendChatAction(chatId, "typing");
    
    // Check if this is a survey response FIRST (highest priority)
    const surveyResponse = await handleSurveyResponse(chatId, text, userLanguage);
    if (surveyResponse) {
      return; // Response already handled
    }
    
    // Check if this is a language selection response
    const languageChoice = await handleLanguageResponse(chatId, text, userLanguage);
    if (languageChoice) {
      return; // Response already handled
    }
    
    // Check if this is a response to full deck command
    const deckChoice = await handleFullDeckResponse(chatId, text, userLanguage);
    if (deckChoice) {
      return; // Response already handled
    }
    
    // Perform a general tarot reading based on the user's message
    const reading = await tarotReader.performGeneralReading(text, userLanguage, chatId);
    await sendEnhancedReading(bot, chatId, reading, userLanguage, true);
    incrementReadingCount(chatId);
    storeReading(chatId, {
      readingType: 'general',
      spreadName: reading.spreadName,
      cards: reading.cards,
      interpretation: reading.narrative,
      userQuestion: text,
      aiEnhanced: reading.aiEnhanced || false,
      personalized: reading.personalized || false
    });
    await sendCommandsMessage(chatId, userLanguage);
  } catch (err) {
    console.error("Bot error:", err);
    const errorMsg = err?.response?.data?.error?.message || err?.message || String(err);
    await bot.sendMessage(chatId, getTranslation('error_generic', userLanguage));
  }
});

// Handle callback queries (for survey buttons)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  try {
    const userLanguage = await getUserPreferredLanguage(chatId);
    
    if (data.startsWith('survey_')) {
      await handleSurveyCallback(chatId, data, userLanguage, query);
    }
    
    // Answer the callback query
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Error handling callback query:', error);
    await bot.answerCallbackQuery(query.id, { text: 'Error processing request' });
  }
});

async function handleCommand(chatId, command, language = 'en') {
  const cmd = command.toLowerCase().trim();
  
  try {
    await bot.sendChatAction(chatId, "typing");
    
    switch (cmd) {
      case "/start":
        await sendWelcomeMessage(bot, chatId, language);
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/help":
        await bot.sendMessage(
          chatId,
          getTranslation('help', language),
          { parse_mode: 'HTML' }
        );
        // Don't send commands message after help command
        break;
        
      case "/language":
        await handleLanguageCommand(chatId, language);
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/daily":
        const dailyReading = await tarotReader.performDailyReading(language, chatId);
        await sendEnhancedReading(bot, chatId, dailyReading, language, true);
        incrementReadingCount(chatId);
        storeReading(chatId, {
          readingType: 'daily',
          spreadName: dailyReading.spreadName,
          cards: dailyReading.cards,
          interpretation: dailyReading.narrative,
          userQuestion: dailyReading.userQuestion || '',
          aiEnhanced: dailyReading.aiEnhanced || false,
          personalized: dailyReading.personalized || false
        });
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/love":
        const loveReading = await tarotReader.performLoveReading('', language, chatId);
        await sendEnhancedReading(bot, chatId, loveReading, language, true);
        incrementReadingCount(chatId);
        storeReading(chatId, {
          readingType: 'love',
          spreadName: loveReading.spreadName,
          cards: loveReading.cards,
          interpretation: loveReading.narrative,
          userQuestion: loveReading.userQuestion || '',
          aiEnhanced: loveReading.aiEnhanced || false,
          personalized: loveReading.personalized || false
        });
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/career":
        const careerReading = await tarotReader.performCareerReading('', language, chatId);
        await sendEnhancedReading(bot, chatId, careerReading, language, true);
        incrementReadingCount(chatId);
        storeReading(chatId, {
          readingType: 'career',
          spreadName: careerReading.spreadName,
          cards: careerReading.cards,
          interpretation: careerReading.narrative,
          userQuestion: careerReading.userQuestion || '',
          aiEnhanced: careerReading.aiEnhanced || false,
          personalized: careerReading.personalized || false
        });
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/quick":
        const quickReading = await tarotReader.performQuickReading('general', '', language);
        
        await sendEnhancedReading(bot, chatId, quickReading, language, true);
        incrementReadingCount(chatId);
        storeReading(chatId, {
          readingType: 'quick',
          spreadName: quickReading.spreadName || 'Quick 3-Card Spread',
          cards: quickReading.cards || [],
          interpretation: quickReading.narrative || quickReading.interpretation,
          userQuestion: quickReading.userQuestion || '',
          aiEnhanced: quickReading.aiEnhanced || false,
          personalized: quickReading.personalized || false
        });
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/fulldeck":
        await handleFullDeckCommand(chatId, language);
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/profile":
        await handleProfileCommand(chatId, language);
        await sendCommandsMessage(chatId, language);
        break;
        
      case "/stats":
        const userStats = getUserStats(chatId);
        if (userStats) {
          const statsText = formatUserStats(userStats, language);
          await sendSafeMessage(chatId, statsText, {}, language);
        } else {
          await bot.sendMessage(chatId, getTranslation('error_generic', language));
        }
        await sendCommandsMessage(chatId, language);
        break;
        
      default:
        await bot.sendMessage(
          chatId,
          getTranslation('error_generic', language)
        );
    }
  } catch (err) {
    console.error("Command error:", err);
    const errorMsg = err?.response?.data?.error?.message || err?.message || String(err);
    await bot.sendMessage(chatId, `❌ Error: ${errorMsg}`);
  }
}

/**
 * Send tarot bot commands message
 * @param {number} chatId - Chat ID
 * @param {string} language - User language
 */
async function sendCommandsMessage(chatId, language = 'en') {
  try {
    const commandsText = getTranslation('tarot_bot_commands', language);
    await bot.sendMessage(chatId, commandsText, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error sending commands message:', error);
  }
}

/**
 * Safely send a message, truncating if too long
 * @param {number} chatId - Chat ID
 * @param {string} message - Message to send
 * @param {Object} options - Message options
 * @param {string} language - User language for fallback messages
 */
async function sendSafeMessage(chatId, message, options = {}, language = 'en') {
  try {
    // Check if message is too long and truncate if needed
    if (message.length > 4000) {
      console.log(`⚠️ Message too long (${message.length} chars), truncating...`);
      message = truncateMessage(message, 4000);
    }
    
    await bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML', 
      disable_web_page_preview: true,
      ...options 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    // Try sending a shorter fallback message
    const fallback = getTranslation('message_too_long', language);
    await bot.sendMessage(chatId, fallback, { parse_mode: 'HTML' });
  }
}

/**
 * Handle language selection command
 * @param {number} chatId - Chat ID
 * @param {string} currentLanguage - Current user language
 */
async function handleLanguageCommand(chatId, currentLanguage) {
  try {
    let message = getTranslation('language_select', currentLanguage) + '\n\n';
    
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, lang], index) => {
      const isCurrent = code === currentLanguage ? ' ✅' : '';
      message += `${index + 1}. ${lang.flag} ${lang.name}${isCurrent}\n`;
    });
    
    message += '\n' + getTranslation('choose_option', currentLanguage);
    
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error in language command:', error);
    await bot.sendMessage(chatId, getTranslation('error_generic', currentLanguage));
  }
}

/**
 * Handle language selection response
 * @param {number} chatId - Chat ID
 * @param {string} text - User's response text
 * @param {string} currentLanguage - Current user language
 * @returns {boolean} True if response was handled
 */
async function handleLanguageResponse(chatId, text, currentLanguage) {
  try {
    // Check if this looks like a language choice (number 1-3)
    const choice = parseInt(text.trim());
    if (choice >= 1 && choice <= 3) {
      const languages = ['en', 'ru', 'es'];
      const selectedLanguage = languages[choice - 1];
      
      // Set user's language preference
      await setUserPreferredLanguage(chatId, selectedLanguage);
      
      // Send confirmation message in the new language
      const confirmationMessage = getTranslation('language_changed', selectedLanguage, { 
        language: SUPPORTED_LANGUAGES[selectedLanguage].name 
      });
      
      await bot.sendMessage(chatId, confirmationMessage, { parse_mode: 'HTML' });
      
      return true; // Response handled
    }
    
    // Check if this looks like a language name
    const lowerText = text.toLowerCase();
    if (lowerText.includes('english') || lowerText.includes('английский') || lowerText.includes('inglés')) {
      await setUserPreferredLanguage(chatId, 'en');
      await bot.sendMessage(chatId, getTranslation('language_changed', 'en', { language: 'English' }), { parse_mode: 'HTML' });
      return true;
    } else if (lowerText.includes('русский') || lowerText.includes('russian')) {
      await setUserPreferredLanguage(chatId, 'ru');
      await bot.sendMessage(chatId, getTranslation('language_changed', 'ru', { language: 'Русский' }), { parse_mode: 'HTML' });
      return true;
    } else if (lowerText.includes('español') || lowerText.includes('spanish') || lowerText.includes('испанский')) {
      await setUserPreferredLanguage(chatId, 'es');
      await bot.sendMessage(chatId, getTranslation('language_changed', 'es', { language: 'Español' }), { parse_mode: 'HTML' });
      return true;
    }
    
    return false; // Not a language response
  } catch (error) {
    console.error('Error handling language response:', error);
    return false;
  }
}

/**
 * Handle full deck reading command with interactive options
 * @param {number} chatId - Chat ID
 * @param {string} language - User language
 */
async function handleFullDeckCommand(chatId, language) {
  try {
    const deckTypes = [
      { value: 'full', label: getTranslation('fulldeck_full', language) },
      { value: 'majors', label: getTranslation('fulldeck_majors', language) },
      { value: 'wands', label: getTranslation('fulldeck_wands', language) },
      { value: 'cups', label: getTranslation('fulldeck_cups', language) },
      { value: 'swords', label: getTranslation('fulldeck_swords', language) },
      { value: 'pentacles', label: getTranslation('fulldeck_pentacles', language) }
    ];
    
    let message = getTranslation('fulldeck_options', language) + '\n\n';
    
    deckTypes.forEach((type, index) => {
      message += `${index + 1}. <b>${type.label}</b>\n\n`;
    });
    
    message += getTranslation('choose_option', language);
    
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Error in full deck command:', error);
    await bot.sendMessage(chatId, getTranslation('error_generic', language));
  }
}

/**
 * Handle response to full deck command
 * @param {number} chatId - Chat ID
 * @param {string} text - User's response text
 * @param {string} language - User language
 * @returns {boolean} True if response was handled
 */
async function handleFullDeckResponse(chatId, text, language) {
  try {
    // Check if this looks like a deck choice (number 1-6)
    const choice = parseInt(text.trim());
    if (choice >= 1 && choice <= 6) {
      const deckTypes = ['full', 'majors', 'wands', 'cups', 'swords', 'pentacles'];
      const selectedDeck = deckTypes[choice - 1];
      
      // Perform the full deck reading
      const reading = await tarotReader.performFullDeckReading({
        deckType: selectedDeck,
        cardCount: 3,
        userQuestion: '',
        includeReversals: true,
        includeMinors: selectedDeck === 'full',
        language: language
      });
      
      const readingText = tarotReader.formatReadingForDisplay(reading, language);
      await sendSafeMessage(chatId, readingText, {}, language);
      
      incrementReadingCount(chatId);
      storeReading(chatId, {
        readingType: 'fulldeck',
        spreadName: reading.spreadName,
        cards: reading.cards,
        interpretation: reading.narrative,
        userQuestion: reading.userQuestion || '',
        aiEnhanced: reading.aiEnhanced || false,
        personalized: reading.personalized || false
      });
      
      return true; // Response handled
    }
    
    // Check if this looks like a question for full deck reading
    const questionKeywords = ['full deck', 'complete deck', 'all cards', 'majors', 'minors', 'wands', 'cups', 'swords', 'pentacles'];
    const isFullDeckQuestion = questionKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (isFullDeckQuestion) {
      // Determine deck type from question
      let deckType = 'full';
      if (text.toLowerCase().includes('majors')) deckType = 'majors';
      else if (text.toLowerCase().includes('wands')) deckType = 'wands';
      else if (text.toLowerCase().includes('cups')) deckType = 'cups';
      else if (text.toLowerCase().includes('swords')) deckType = 'swords';
      else if (text.toLowerCase().includes('pentacles')) deckType = 'pentacles';
      
      // Perform the full deck reading
      const reading = await tarotReader.performFullDeckReading({
        deckType,
        cardCount: 3,
        userQuestion: text,
        includeReversals: true,
        includeMinors: deckType === 'full',
        language: language
      });
      
      const readingText = tarotReader.formatReadingForDisplay(reading, language);
      await sendSafeMessage(chatId, readingText, {}, language);
      
      incrementReadingCount(chatId);
      storeReading(chatId, {
        readingType: 'fulldeck',
        spreadName: reading.spreadName,
        cards: reading.cards,
        interpretation: reading.narrative,
        userQuestion: text,
        aiEnhanced: reading.aiEnhanced || false,
        personalized: reading.personalized || false
      });
      
      return true; // Response handled
    }
    
    return false; // Not a full deck response
  } catch (error) {
    console.error('Error handling full deck response:', error);
    return false;
  }
}


/**
 * Format user statistics for display
 * @param {Object} userStats - User statistics object
 * @param {string} language - User language
 * @returns {string} Formatted statistics text
 */
function formatUserStats(userStats, language = 'en') {
  const { user, stats, favoriteTypes } = userStats;
  
  let text = getTranslation('stats_title', language) + '\n\n';
  
  text += getTranslation('stats_user', language, { name: user.first_name || 'Unknown' }) + '\n';
  text += getTranslation('stats_member_since', language, { date: new Date(user.created_at).toLocaleDateString() }) + '\n\n';
  
  text += getTranslation('stats_summary', language) + '\n';
  text += getTranslation('stats_total', language, { count: stats.total_readings || 0 }) + '\n';
  text += getTranslation('stats_ai_enhanced', language, { count: stats.ai_enhanced_readings || 0 }) + '\n';
  text += getTranslation('stats_personalized', language, { count: stats.personalized_readings || 0 }) + '\n';
  text += getTranslation('stats_types_used', language, { count: stats.reading_types_used || 0 }) + '\n\n';
  
  if (favoriteTypes && favoriteTypes.length > 0) {
    text += getTranslation('stats_favorites', language) + '\n';
    favoriteTypes.forEach((type, index) => {
      text += getTranslation('stats_favorite_item', language, { 
        index: index + 1, 
        type: type.reading_type, 
        count: type.count 
      }) + '\n';
    });
  }
  
  text += '\n' + getTranslation('stats_encouragement', language);
  
  return text;
}

/**
 * Handle profile command - start or manage user survey
 * @param {number} chatId - Chat ID
 * @param {string} language - User language
 */
async function handleProfileCommand(chatId, language = 'en') {
  try {
    // Check if user has completed profile
    const profileCompleted = await shouldCompleteSurvey(chatId);
    
    if (profileCompleted) {
      // User needs to complete survey
      const intro = getSurveyIntroduction(language);
      const benefits = getSurveyBenefits(language);
      
      const message = `${intro}\n\n${benefits}\n\n${getTranslation('survey_start', language)}`;
      
      // Start survey
      const firstQuestion = surveyManager.startSurvey(chatId, language);
      
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      await sendSurveyQuestion(bot, chatId, firstQuestion, language);
    } else {
      // User has completed profile, show current profile
      const profile = await getUserProfile(chatId);
      const profileText = formatUserProfile(profile, language);
      
      await bot.sendMessage(chatId, profileText, { parse_mode: 'HTML' });
    }
  } catch (error) {
    console.error('Error handling profile command:', error);
    await bot.sendMessage(chatId, getTranslation('error_generic', language));
  }
}

/**
 * Handle survey callback queries (button clicks)
 * @param {number} chatId - Chat ID
 * @param {string} data - Callback data
 * @param {string} language - User language
 * @param {Object} query - Callback query object
 */
async function handleSurveyCallback(chatId, data, language, query) {
  try {
    if (!surveyManager.hasActiveSession(chatId)) {
      await bot.sendMessage(chatId, getTranslation('survey_cancel', language));
      return;
    }
    
    if (data === 'survey_cancel') {
      surveyManager.cancelSurvey(chatId);
      await bot.sendMessage(chatId, getTranslation('survey_cancel', language));
      return;
    }
    
    if (data === 'survey_prev') {
      // Handle previous question (not implemented yet)
      await bot.sendMessage(chatId, getTranslation('survey_previous_not_available', language));
      return;
    }
    
    // Handle numeric selection (survey_1, survey_2, etc.)
    const choice = data.replace('survey_', '');
    const choiceNum = parseInt(choice);
    
    if (!isNaN(choiceNum)) {
      const result = surveyManager.processAnswer(chatId, choiceNum.toString());
      
      if (result.status === 'completed') {
        await bot.sendMessage(chatId, result.message, { parse_mode: 'HTML' });
      } else if (result.status === 'next_question') {
        await sendSurveyQuestion(bot, chatId, result.question, language);
      }
    }
  } catch (error) {
    console.error('Error handling survey callback:', error);
    await bot.sendMessage(chatId, getTranslation('error_generic', language));
  }
}

/**
 * Handle survey responses
 * @param {number} chatId - Chat ID
 * @param {string} text - User response
 * @param {string} language - User language
 * @returns {boolean} True if response was handled
 */
async function handleSurveyResponse(chatId, text, userLanguage) {
  try {
    // Check if user has active survey session
    if (!surveyManager.hasActiveSession(chatId)) {
      return false;
    }
    
    // Check for cancel command
    if (text.toLowerCase().includes('cancel') || text.toLowerCase().includes('отмена') || text.toLowerCase().includes('cancelar')) {
      surveyManager.cancelSurvey(chatId);
      await bot.sendMessage(chatId, getTranslation('survey_cancel', userLanguage));
      return true;
    }
    
    // Process the answer
    const result = surveyManager.processAnswer(chatId, text);
    
    if (result.status === 'completed') {
      // Survey completed
      await bot.sendMessage(chatId, result.message, { parse_mode: 'HTML' });
      return true;
    } else if (result.status === 'next_question') {
      // Show next question
      await sendSurveyQuestion(bot, chatId, result.question, userLanguage);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error handling survey response:', error);
    return false;
  }
}

/**
 * Format survey question for display
 * @param {Object} question - Question object
 * @param {string} language - User language
 * @returns {string} Formatted question text
 */
function formatSurveyQuestion(question, language = 'en') {
  let text = `📝 **${question.question}**\n\n`;
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
 * Format user profile for display
 * @param {Object} profile - User profile
 * @param {string} language - User language
 * @returns {string} Formatted profile text
 */
function formatUserProfile(profile, language = 'en') {
  if (!profile) {
    return getTranslation('error_generic', language);
  }
  
  let text = "👤 **Your Profile**\n\n";
  
  // Add profile fields if they exist
  if (profile.gender) text += `Gender: ${profile.gender}\n`;
  if (profile.age_group) text += `Age Group: ${profile.age_group}\n`;
  if (profile.emotional_state) text += `Emotional State: ${profile.emotional_state}\n`;
  if (profile.life_focus) text += `Life Focus: ${profile.life_focus}\n`;
  if (profile.spiritual_beliefs) text += `Spiritual Beliefs: ${profile.spiritual_beliefs}\n`;
  if (profile.relationship_status) text += `Relationship Status: ${profile.relationship_status}\n`;
  if (profile.career_stage) text += `Career Stage: ${profile.career_stage}\n`;
  
  text += `\n✅ Profile completed: ${profile.profile_completed ? 'Yes' : 'No'}`;
  
  return text;
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down…");
  process.exit(0);
});
