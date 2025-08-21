// Language Management Module
// Handles multi-language support for the tarot bot

import { getUserLanguage, setUserLanguage } from '../database/users.js';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸', code: 'en' },
  ru: { name: 'Русский', flag: '🇷🇺', code: 'ru' },
  es: { name: 'Español', flag: '🇪🇸', code: 'es' }
};

// Language detection patterns
const LANGUAGE_PATTERNS = {
  ru: /[а-яё]/i,
  es: /[ñáéíóúü]/i
};

/**
 * Detect language from text
 * @param {string} text - Text to analyze
 * @returns {string} Detected language code
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  
  const lowerText = text.toLowerCase();
  
  // Check for Russian characters
  if (LANGUAGE_PATTERNS.ru.test(text)) {
    return 'ru';
  }
  
  // Check for Spanish characters
  if (LANGUAGE_PATTERNS.es.test(text)) {
    return 'es';
  }
  
  // Check for common Spanish words
  const spanishWords = ['hola', 'gracias', 'por favor', 'si', 'no', 'que', 'como', 'donde', 'cuando', 'porque'];
  if (spanishWords.some(word => lowerText.includes(word))) {
    return 'es';
  }
  
  // Check for common Russian words
  const russianWords = ['привет', 'спасибо', 'пожалуйста', 'да', 'нет', 'что', 'как', 'где', 'когда', 'почему'];
  if (russianWords.some(word => lowerText.includes(word))) {
    return 'ru';
  }
  
  return 'en';
}

/**
 * Get user's preferred language
 * @param {number} telegramId - Telegram user ID
 * @returns {string} Language code
 */
export function getUserPreferredLanguage(telegramId) {
  try {
    const language = getUserLanguage(telegramId);
    return language || 'en';
  } catch (error) {
    console.error('Error getting user language:', error);
    return 'en';
  }
}

/**
 * Set user's preferred language
 * @param {number} telegramId - Telegram user ID
 * @param {string} language - Language code
 */
export function setUserPreferredLanguage(telegramId, language) {
  try {
    if (!SUPPORTED_LANGUAGES[language]) {
      throw new Error(`Unsupported language: ${language}`);
    }
    setUserLanguage(telegramId, language);
    console.log(`🌍 Language set to ${language} for user ${telegramId}`);
  } catch (error) {
    console.error('Error setting user language:', error);
  }
}

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} language - Language code
 * @param {Object} params - Parameters for interpolation
 * @returns {string} Translated text
 */
export function getTranslation(key, language = 'en', params = {}) {
  const translations = TRANSLATIONS[language] || TRANSLATIONS.en;
  let text = translations[key] || key;
  
  // Replace parameters
  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });
  
  return text;
}

// Translation dictionary
const TRANSLATIONS = {
  en: {
    // Welcome and help
    welcome: "🔮 Welcome to the Mystical Tarot Bot!\n\nI'm your personal tarot reader, ready to guide you through life's mysteries.\n\nUse /help to see all available commands.",
         help: "🔮 <b>Tarot Bot Commands</b>\n\n📖 <b>Reading Types:</b>\n• /daily - Daily card reading\n• /love - Love & relationship reading\n• /career - Career & work reading\n• /quick - Quick 3-card reading\n• /fulldeck - Advanced full deck options\n\n📊 <b>Other Commands:</b>\n• /profile - Complete personal survey for better readings\n• /reversals - Toggle card reversals on/off\n• /stats - View your reading statistics\n• /language - Change language\n• /help - Show this help\n\n💬 <b>Or simply ask me a question!",
    tarot_bot_commands: "🔮 <b>Available Commands:</b>\n\n📖 <b>Reading Types:</b>\n• /daily - Daily card reading\n• /love - Love & relationship reading\n• /career - Career & work reading\n• /quick - Quick 3-card reading\n• /fulldeck - Advanced full deck options\n\n📊 <b>Other Commands:</b>\n• /profile - Complete personal survey for better readings\n• /reversals - Toggle card reversals on/off\n• /stats - View your reading statistics\n• /language - Change language\n• /help - Show detailed help\n\n💬 <b>Or simply ask me a question!",
    
    // Language selection
    language_select: "🌍 <b>Select Your Language</b>\n\nChoose your preferred language for the bot interface:",
    language_changed: "✅ Language changed to {language}!",
    language_current: "🌍 Your current language is: {language}",
    
    // Reading types
    daily_reading: "🔮 <b>Daily Card Reading</b>\n\nToday's card brings you wisdom and guidance...",
    love_reading: "💕 <b>Love & Relationship Reading</b>\n\nLet the cards reveal insights about your heart...",
    career_reading: "💼 <b>Career & Work Reading</b>\n\nDiscover what the cards say about your professional path...",
    quick_reading: "⚡ <b>Quick 3-Card Reading</b>\n\nPast • Present • Future",
    quick_spread_name: "Quick 3-Card Spread",
    fulldeck_options: "🔮 <b>Full Deck Reading Options</b>\n\nChoose your preferred deck type:",
    
    // Full deck options
    fulldeck_full: "Full Deck (Majors + Minors) - Big themes and practical guidance",
    fulldeck_majors: "Major Arcana Only - High-level direction and major life themes",
    fulldeck_wands: "Wands Suit - Motivation, creativity, passion, and action",
    fulldeck_cups: "Cups Suit - Emotions, relationships, intuition, and love",
    fulldeck_swords: "Swords Suit - Thoughts, challenges, communication, and decisions",
    fulldeck_pentacles: "Pentacles Suit - Material matters, work, finances, and practical concerns",
    
    // Statistics
    stats_title: "📊 <b>Your Tarot Reading Statistics</b>",
    stats_user: "👤 <b>User:</b> {name}",
    stats_member_since: "📅 <b>Member since:</b> {date}",
    stats_summary: "🔮 <b>Reading Summary:</b>",
    stats_total: "• Total readings: {count}",
    stats_ai_enhanced: "• AI-enhanced readings: {count}",
    stats_personalized: "• Personalized readings: {count}",
    stats_types_used: "• Reading types used: {count}",
    stats_favorites: "⭐ <b>Your Favorite Reading Types:</b>",
    stats_favorite_item: "{index}. {type}: {count} readings",
    stats_encouragement: "✨ Keep exploring the mystical world of tarot!",
    
    // Messages
    reading_in_progress: "🔮 Shuffling the cards...",
    reading_complete: "✅ Reading completed!",
    error_generic: "❌ An error occurred. Please try again.",
    error_reading: "❌ Error performing reading. Please try again.",
    message_too_long: "🔮 Your tarot reading is ready! The message was too long to display completely. Please try a different reading type.",
    
    // Prompts
    ask_question: "💭 What would you like to know? Ask me anything!",
    choose_option: "Please choose an option (1-3) or ask your question:",
    
    // Card information
    card_upright: "Upright",
    card_reversed: "Reversed",
    card_keywords: "Keywords",
    card_meaning: "Meaning",
    card_advice: "Advice",
    card_reversed_note: "Note: Card image shown upright for clarity, but meaning is reversed",
    card_type_major_arcana: "Major Arcana",
    card_type_minor_arcana: "Minor Arcana",
    
    // Reading sections
    reading_summary_title: "**🔮 Reading Summary**",
    reading_cards_drawn: "📊 **Cards Drawn:** {count}",
    reading_major_arcana: "✨ **Major Arcana:** {count}",
    reading_minor_arcana: "⚡ **Minor Arcana:** {count}",
    reading_reversed: "🔄 **Reversed:** {count}",
    reading_dominant_themes: "**🎯 Dominant Themes:**",
    reading_overall_message: "**💫 Overall Message:**",
    reading_advice_title: "**💡 Advice for Moving Forward:**",
    
    // Reading introductions
    reading_love_intro: "This reading focuses on matters of the heart and relationships. ",
    reading_career_intro: "This reading explores your professional path and work life. ",
    reading_health_intro: "This reading addresses your physical and emotional well-being. ",
    reading_general_intro: "This reading provides general guidance for your life journey. ",
    reading_wisdom_intro: "Let the cards reveal their wisdom to you.",
    
    // Reading challenges
    reading_challenges_high: "This reading suggests you may be experiencing some challenges or resistance. The high number of reversed cards indicates internal conflicts or external obstacles. Consider what you might be resisting or what needs to be released.\n\n",
    reading_challenges_mixed: "This reading shows a mix of energies. While there are some challenges, there are also opportunities for growth and positive change.\n\n",
    reading_challenges_low: "This reading carries predominantly positive energy. The cards suggest favorable circumstances and clear paths forward.\n\n",
    
    // Reading guidance
    reading_guidance_love: "In matters of love, focus on open communication and emotional honesty. Trust your heart while remaining grounded in reality.",
    reading_guidance_career: "In your career, leverage your strengths and be open to new opportunities. Professional growth often comes through challenges.",
    reading_guidance_health: "For your health, listen to your body's wisdom and maintain balance in all aspects of your life.",
    reading_guidance_general: "Trust your intuition and remain open to the guidance the universe is offering you.",
    
    // Advice points
    advice_trust_intuition: "Trust your intuition and inner wisdom",
    advice_take_action: "Take action and move forward with confidence",
    advice_patience: "Practice patience and allow things to unfold naturally",
    advice_embrace_change: "Embrace change and transformation in your life",
    advice_balance_harmony: "Seek balance and harmony in all areas of your life",
    advice_release: "Release what no longer serves you",
    advice_focus: "Focus your energy and attention on your goals",
    advice_trust_journey: "Trust the journey and remain open to guidance",
    advice_listen_inner_voice: "Listen to your inner voice and intuition",
    advice_one_step: "Take one step at a time toward your goals",
    
          // Reading display
      reading_your_question: "❓ **Your Question:** {question}",
      reading_performed_on: "Reading performed on {date}",
      reading_personalized_note: "This reading has been personalized based on your profile information.",
      
      // Welcome and features
      welcome_title: "🔮 Welcome to the Mystical Tarot Bot!",
      welcome_message: "I'm your personal tarot reader, ready to guide you through life's mysteries with beautiful card imagery and personalized insights.",
      welcome_features: "✨ What makes this bot special:",
      feature_cards: "Beautiful card images for every reading",
      feature_ai: "AI-enhanced interpretations for deeper insights",
      feature_personalized: "Personalized readings based on your profile",
      feature_multilingual: "Full support in English, Russian, and Spanish",
      welcome_instruction: "Use /help to see all available commands and start your mystical journey!",
    
    // Quick reading
    quick_reading_title: "🔮 **Quick {type} Reading**",
    
    // Card names (Major Arcana)
    card_name_the_fool: "The Fool",
    card_name_the_magician: "The Magician",
    card_name_the_high_priestess: "The High Priestess",
    card_name_the_empress: "The Empress",
    card_name_the_emperor: "The Emperor",
    card_name_the_hierophant: "The Hierophant",
    card_name_the_lovers: "The Lovers",
    card_name_the_chariot: "The Chariot",
    card_name_strength: "Strength",
    card_name_the_hermit: "The Hermit",
    card_name_wheel_of_fortune: "Wheel of Fortune",
    card_name_justice: "Justice",
    card_name_the_hanged_man: "The Hanged Man",
    card_name_death: "Death",
    card_name_temperance: "Temperance",
    card_name_the_devil: "The Devil",
    card_name_the_tower: "The Tower",
    card_name_the_star: "The Star",
    card_name_the_moon: "The Moon",
    card_name_the_sun: "The Sun",
    card_name_judgement: "Judgement",
    card_name_the_world: "The World",
    
    // Minor Arcana card names (Wands)
    card_name_ace_of_wands: "Ace of Wands",
    card_name_two_of_wands: "Two of Wands",
    card_name_three_of_wands: "Three of Wands",
    card_name_four_of_wands: "Four of Wands",
    card_name_five_of_wands: "Five of Wands",
    card_name_six_of_wands: "Six of Wands",
    card_name_seven_of_wands: "Seven of Wands",
    card_name_eight_of_wands: "Eight of Wands",
    card_name_nine_of_wands: "Nine of Wands",
    card_name_ten_of_wands: "Ten of Wands",
    card_name_page_of_wands: "Page of Wands",
    card_name_knight_of_wands: "Knight of Wands",
    card_name_queen_of_wands: "Queen of Wands",
    card_name_king_of_wands: "King of Wands",
    
    // Minor Arcana card names (Cups)
    card_name_ace_of_cups: "Ace of Cups",
    card_name_two_of_cups: "Two of Cups",
    card_name_three_of_cups: "Three of Cups",
    card_name_four_of_cups: "Four of Cups",
    card_name_five_of_cups: "Five of Cups",
    card_name_six_of_cups: "Six of Cups",
    card_name_seven_of_cups: "Seven of Cups",
    card_name_eight_of_cups: "Eight of Cups",
    card_name_nine_of_cups: "Nine of Cups",
    card_name_ten_of_cups: "Ten of Cups",
    card_name_page_of_cups: "Page of Cups",
    card_name_knight_of_cups: "Knight of Cups",
    card_name_queen_of_cups: "Queen of Cups",
    card_name_king_of_cups: "King of Cups",
    
    // Minor Arcana card names (Swords)
    card_name_ace_of_swords: "Ace of Swords",
    card_name_two_of_swords: "Two of Swords",
    card_name_three_of_swords: "Three of Swords",
    card_name_four_of_swords: "Four of Swords",
    card_name_five_of_swords: "Five of Swords",
    card_name_six_of_swords: "Six of Swords",
    card_name_seven_of_swords: "Seven of Swords",
    card_name_eight_of_swords: "Eight of Swords",
    card_name_nine_of_swords: "Nine of Swords",
    card_name_ten_of_swords: "Ten of Swords",
    card_name_page_of_swords: "Page of Swords",
    card_name_knight_of_swords: "Knight of Swords",
    card_name_queen_of_swords: "Queen of Swords",
    card_name_king_of_swords: "King of Swords",
    
    // Minor Arcana card names (Pentacles)
    card_name_ace_of_pentacles: "Ace of Pentacles",
    card_name_two_of_pentacles: "Two of Pentacles",
    card_name_three_of_pentacles: "Three of Pentacles",
    card_name_four_of_pentacles: "Four of Pentacles",
    card_name_five_of_pentacles: "Five of Pentacles",
    card_name_six_of_pentacles: "Six of Pentacles",
    card_name_seven_of_pentacles: "Seven of Pentacles",
    card_name_eight_of_pentacles: "Eight of Pentacles",
    card_name_nine_of_pentacles: "Nine of Pentacles",
    card_name_ten_of_pentacles: "Ten of Pentacles",
    card_name_page_of_pentacles: "Page of Pentacles",
    card_name_knight_of_pentacles: "Knight of Pentacles",
    card_name_queen_of_pentacles: "Queen of Pentacles",
    card_name_king_of_pentacles: "King of Pentacles",
    
    // Card descriptions
    card_no_description: "No description available for this card.",
    
    // Card meaning fallback
    card_meaning_not_available: "Meaning not available for this card.",
    
    // Card meanings (Major Arcana - General context, Upright)
    card_meaning_the_fool_upright_general: "New beginnings, innocence, spontaneity, free spirit",
    card_meaning_the_magician_upright_general: "Manifestation, power, skill, concentration, action",
    card_meaning_the_high_priestess_upright_general: "Intuition, mystery, spirituality, inner knowledge, divine feminine",
    card_meaning_the_empress_upright_general: "Fertility, nurturing, abundance, sensuality, nature",
    card_meaning_the_emperor_upright_general: "Authority, structure, control, fatherhood, power, stability",
    card_meaning_the_hierophant_upright_general: "Tradition, conformity, morality, ethics, education, belief",
    card_meaning_the_lovers_upright_general: "Love, harmony, relationships, values alignment, choices",
    card_meaning_the_chariot_upright_general: "Control, willpower, determination, success, action, direction",
    card_meaning_strength_upright_general: "Courage, persuasion, influence, compassion, inner strength",
    card_meaning_the_hermit_upright_general: "Soul-searching, introspection, being alone, inner guidance",
    card_meaning_wheel_of_fortune_upright_general: "Good luck, karma, life cycles, destiny, a turning point",
    card_meaning_justice_upright_general: "Justice, fairness, truth, cause and effect, law",
    card_meaning_the_hanged_man_upright_general: "Surrender, letting go, new perspectives, enlightenment",
    card_meaning_death_upright_general: "Endings, change, transformation, transition",
    card_meaning_temperance_upright_general: "Balance, moderation, patience, purpose, meaning",
    card_meaning_the_devil_upright_general: "Shadow self, attachment, addiction, restriction, sexuality",
    card_meaning_the_tower_upright_general: "Sudden change, upheaval, chaos, revelation, awakening",
    card_meaning_the_star_upright_general: "Hope, faith, purpose, renewal, spirituality",
    card_meaning_the_moon_upright_general: "Illusion, fear, anxiety, subconscious, intuition",
    card_meaning_the_sun_upright_general: "Positivity, fun, warmth, success, vitality",
    card_meaning_judgement_upright_general: "Judgement, rebirth, inner calling, absolution",
    card_meaning_the_world_upright_general: "Completion, integration, accomplishment, travel",
    
         // Card meanings (Major Arcana - General context, Reversed)
     card_meaning_the_fool_reversed_general: "Holding back, recklessness, risk-taking, inconsideration",
     card_meaning_the_magician_reversed_general: "Manipulation, poor planning, untapped talents",
     card_meaning_the_high_priestess_reversed_general: "Secrets, disconnected from intuition, withdrawal, silence",
     card_meaning_the_empress_reversed_general: "Creative block, dependence on others, emptiness",
     card_meaning_the_emperor_reversed_general: "Domination, excessive control, rigidity, inflexibility",
     card_meaning_the_hierophant_reversed_general: "Personal beliefs, freedom, challenging the status quo",
     card_meaning_the_lovers_reversed_general: "Self-love, disharmony, imbalance, misalignment of values",
     card_meaning_the_chariot_reversed_general: "Lack of control, lack of direction, aggression",
     card_meaning_strength_reversed_general: "Inner strength, self-doubt, low energy, raw emotion",
     card_meaning_the_hermit_reversed_general: "Isolation, loneliness, withdrawal",
     card_meaning_wheel_of_fortune_reversed_general: "Bad luck, lack of control, clinging to control, unwelcome changes",
     card_meaning_justice_reversed_general: "Unfairness, lack of accountability, dishonesty",
     card_meaning_the_hanged_man_reversed_general: "Resistance, stalling, indecision, delay",
     card_meaning_death_reversed_general: "Resistance to change, inability to move on, stagnation",
     card_meaning_temperance_reversed_general: "Imbalance, excess, self-healing, re-alignment",
     card_meaning_the_devil_reversed_general: "Releasing limiting beliefs, exploring dark thoughts, detachment",
     card_meaning_the_tower_reversed_general: "Fear of change, avoiding disaster, delaying the inevitable",
     card_meaning_the_star_reversed_general: "Lack of faith, despair, disconnection, discouragement",
     card_meaning_the_moon_reversed_general: "Release of fear, repressed emotion, inner confusion",
     card_meaning_the_sun_reversed_general: "Inner child, feeling down, overly optimistic",
     card_meaning_judgement_reversed_general: "Self-doubt, inner critic, ignoring the call",
     card_meaning_the_world_reversed_general: "Lack of completion, lack of closure, delay",
     
     // Survey translations
     survey_introduction: "🔮 **Personal Profile Survey**\n\nTo provide you with the most accurate and personalized tarot readings, I'd like to learn a bit more about you. This information helps me tailor the interpretations to your unique situation and life circumstances.\n\nYour privacy is important - all information is stored securely and used only to enhance your reading experience.",
     survey_benefits: "✨ **Benefits of completing the survey:**\n• More accurate and relevant readings\n• Personalized interpretations based on your life situation\n• Better guidance for your specific circumstances\n• Enhanced spiritual connection through understanding your background",
     survey_start: "Let's begin! This will only take a few minutes.",
     survey_completed: "🎉 **Survey Completed!**\n\nThank you for sharing your information. Your profile has been saved and will help provide more personalized and accurate tarot readings.\n\nYou can now enjoy enhanced readings that are tailored to your unique situation!",
     survey_skip: "You can skip this survey and complete it later using /profile command.",
           survey_cancel: "Survey cancelled. You can restart it anytime with /profile command.",
      survey_previous_not_available: "Previous question navigation is not available yet. Please use text input.",
     
     // Survey questions
     survey_question_gender: "What is your gender identity?",
     survey_question_age_group: "What is your age group?",
     survey_question_emotional_state: "How would you describe your current emotional state?",
     survey_question_life_focus: "What area of life are you most focused on right now?",
     survey_question_spiritual_beliefs: "How would you describe your spiritual beliefs?",
     survey_question_relationship_status: "What is your current relationship status?",
     survey_question_career_stage: "What stage are you at in your career or work life?",
     
     // Survey navigation
     survey_next: "Next",
     survey_previous: "Previous",
     survey_finish: "Finish Survey",
     survey_cancel_survey: "Cancel Survey",
     survey_progress: "Question {current} of {total}",
     
     // Reversal-related translations
     reversals_enabled: "🔄 <b>Card Reversals Enabled</b>\n\nYour tarot readings will now include reversed cards, which can provide additional depth and nuance to the interpretations.",
     reversals_disabled: "🔄 <b>Card Reversals Disabled</b>\n\nYour tarot readings will now show all cards in their upright position for simpler interpretations.",
     
     // Profile update translations
     profile_update_prompt: "Would you like to update your profile information?",
     profile_update_yes: "Yes, Update Profile",
     profile_update_no: "No, Keep Current",
     profile_update_cancelled: "✅ Profile update cancelled. Your current profile information will be kept."
   },
  
  ru: {
    // Welcome and help
    welcome: "🔮 Добро пожаловать в Мистический Таро Бот!\n\nЯ ваш личный таролог, готовый провести вас через тайны жизни.\n\nИспользуйте /help для просмотра всех доступных команд.",
         help: "🔮 <b>Команды Таро Бота</b>\n\n📖 <b>Типы гаданий:</b>\n• /daily - Карта дня\n• /love - Гадание на любовь и отношения\n• /career - Гадание на карьеру и работу\n• /quick - Быстрое гадание на 3 карты\n• /fulldeck - Расширенные опции полной колоды\n\n📊 <b>Другие команды:</b>\n• /profile - Пройти персональный опрос для лучших гаданий\n• /reversals - Включить/выключить перевернутые карты\n• /stats - Просмотр статистики гаданий\n• /language - Смена языка\n• /help - Показать эту справку\n\n💬 <b>Или просто задайте мне вопрос!</b>",
    tarot_bot_commands: "🔮 <b>Доступные команды:</b>\n\n📖 <b>Типы гаданий:</b>\n• /daily - Карта дня\n• /love - Гадание на любовь и отношения\n• /career - Гадание на карьеру и работу\n• /quick - Быстрое гадание на 3 карты\n• /fulldeck - Расширенные опции полной колоды\n\n📊 <b>Другие команды:</b>\n• /profile - Пройти персональный опрос для лучших гаданий\n• /reversals - Включить/выключить перевернутые карты\n• /stats - Просмотр статистики гаданий\n• /language - Смена языка\n• /help - Показать подробную справку\n\n💬 <b>Или просто задайте мне вопрос!</b>",
    
    // Language selection
    language_select: "🌍 <b>Выберите язык</b>\n\nВыберите предпочитаемый язык для интерфейса бота:",
    language_changed: "✅ Язык изменен на {language}!",
    language_current: "🌍 Ваш текущий язык: {language}",
    
    // Reading types
    daily_reading: "🔮 <b>Карта дня</b>\n\nСегодняшняя карта приносит вам мудрость и руководство...",
    love_reading: "💕 <b>Гадание на любовь и отношения</b>\n\nПозвольте картам раскрыть тайны вашего сердца...",
    career_reading: "💼 <b>Гадание на карьеру и работу</b>\n\nУзнайте, что карты говорят о вашем профессиональном пути...",
    quick_reading: "⚡ <b>Быстрое гадание на 3 карты</b>\n\nПрошлое • Настоящее • Будущее",
    quick_spread_name: "Быстрый расклад на 3 карты",
    fulldeck_options: "🔮 <b>Опции гадания полной колодой</b>\n\nВыберите предпочитаемый тип колоды:",
    
    // Full deck options
    fulldeck_full: "Полная колода (Старшие + Младшие арканы) - Большие темы и практические советы",
    fulldeck_majors: "Только Старшие арканы - Высокий уровень направления и основные жизненные темы",
    fulldeck_wands: "Масть Жезлов - Мотивация, творчество, страсть и действие",
    fulldeck_cups: "Масть Кубков - Эмоции, отношения, интуиция и любовь",
    fulldeck_swords: "Масть Мечей - Мысли, вызовы, общение и решения",
    fulldeck_pentacles: "Масть Пентаклей - Материальные вопросы, работа, финансы и практические заботы",
    
    // Statistics
    stats_title: "📊 <b>Статистика ваших гаданий</b>",
    stats_user: "👤 <b>Пользователь:</b> {name}",
    stats_member_since: "📅 <b>Участник с:</b> {date}",
    stats_summary: "🔮 <b>Сводка гаданий:</b>",
    stats_total: "• Всего гаданий: {count}",
    stats_ai_enhanced: "• Гадания с ИИ: {count}",
    stats_personalized: "• Персонализированные гадания: {count}",
    stats_types_used: "• Использованных типов: {count}",
    stats_favorites: "⭐ <b>Ваши любимые типы гаданий:</b>",
    stats_favorite_item: "{index}. {type}: {count} гаданий",
    stats_encouragement: "✨ Продолжайте исследовать мистический мир таро!",
    
    // Messages
    reading_in_progress: "🔮 Перемешиваю карты...",
    reading_complete: "✅ Гадание завершено!",
    error_generic: "❌ Произошла ошибка. Попробуйте еще раз.",
    error_reading: "❌ Ошибка при гадании. Попробуйте еще раз.",
    message_too_long: "🔮 Ваше гадание готово! Сообщение было слишком длинным для полного отображения. Попробуйте другой тип гадания.",
    
    // Prompts
    ask_question: "💭 Что вы хотите узнать? Спрашивайте что угодно!",
    choose_option: "Пожалуйста, выберите опцию (1-3) или задайте свой вопрос:",
    
    // Card information
    card_upright: "Прямое положение",
    card_reversed: "Перевернутое положение",
    card_keywords: "Ключевые слова",
    card_meaning: "Значение",
    card_advice: "Совет",
    card_reversed_note: "Примечание: Изображение карты показано прямо для ясности, но значение перевернутое",
    card_type_major_arcana: "Старшие арканы",
    card_type_minor_arcana: "Младшие арканы",
    
    // Reading sections
    reading_summary_title: "**🔮 Сводка гадания**",
    reading_cards_drawn: "📊 **Вытянутые карты:** {count}",
    reading_major_arcana: "✨ **Старшие арканы:** {count}",
    reading_minor_arcana: "⚡ **Младшие арканы:** {count}",
    reading_reversed: "🔄 **Перевернутые:** {count}",
    reading_dominant_themes: "**🎯 Основные темы:**",
    reading_overall_message: "**💫 Общее послание:**",
    reading_advice_title: "**💡 Совет для движения вперед:**",
    
    // Reading introductions
    reading_love_intro: "Это гадание фокусируется на вопросах сердца и отношений. ",
    reading_career_intro: "Это гадание исследует ваш профессиональный путь и работу. ",
    reading_health_intro: "Это гадание касается вашего физического и эмоционального благополучия. ",
    reading_general_intro: "Это гадание предоставляет общее руководство для вашего жизненного пути. ",
    reading_wisdom_intro: "Позвольте картам раскрыть свою мудрость.",
    
    // Reading challenges
    reading_challenges_high: "Это гадание предполагает, что вы можете испытывать некоторые трудности или сопротивление. Большое количество перевернутых карт указывает на внутренние конфликты или внешние препятствия. Подумайте о том, чему вы можете сопротивляться или что нужно отпустить.\n\n",
    reading_challenges_mixed: "Это гадание показывает смешанную энергию. Хотя есть некоторые трудности, есть также возможности для роста и позитивных изменений.\n\n",
    reading_challenges_low: "Это гадание несет преимущественно позитивную энергию. Карты предполагают благоприятные обстоятельства и четкие пути вперед.\n\n",
    
    // Reading guidance
    reading_guidance_love: "В вопросах любви сосредоточьтесь на открытом общении и эмоциональной честности. Доверяйте своему сердцу, оставаясь заземленными в реальности.",
    reading_guidance_career: "В карьере используйте свои сильные стороны и будьте открыты новым возможностям. Профессиональный рост часто приходит через вызовы.",
    reading_guidance_health: "Для здоровья слушайте мудрость своего тела и поддерживайте баланс во всех аспектах жизни.",
    reading_guidance_general: "Доверяйте своей интуиции и оставайтесь открытыми руководству, которое предлагает вселенная.",
    
    // Advice points
    advice_trust_intuition: "Доверяйте своей интуиции и внутреннему мудрости",
    advice_take_action: "Действуйте и продвигайтесь вперед с уверенностью",
    advice_patience: "Практикуйте терпение и позвольте вещам развиваться естественным образом",
    advice_embrace_change: "Принимайте изменения и трансформацию в своей жизни",
    advice_balance_harmony: "Ищите баланс и гармонию во всех областях вашей жизни",
    advice_release: "Освобождайте то, что больше не служит вам",
    advice_focus: "Сосредоточьте свою энергию и внимание на своих целях",
    advice_trust_journey: "Доверяйте пути и оставайтесь открытыми руководству",
    advice_listen_inner_voice: "Слушайте свою внутреннюю голос и интуицию",
    advice_one_step: "Делайте один шаг за раз к своим целям",
    
          // Reading display
      reading_your_question: "❓ **Ваш вопрос:** {question}",
      reading_performed_on: "Гадание выполнено {date}",
      reading_personalized_note: "Это гадание было персонализировано на основе информации вашего профиля.",
      
      // Welcome and features
      welcome_title: "🔮 Добро пожаловать в Мистический Таро Бот!",
      welcome_message: "Я ваш личный таролог, готовый провести вас через тайны жизни с красивыми изображениями карт и персонализированными прозрениями.",
      welcome_features: "✨ Что делает этого бота особенным:",
      feature_cards: "Красивые изображения карт для каждого гадания",
      feature_ai: "Улучшенные интерпретации с ИИ для более глубоких прозрений",
      feature_personalized: "Персонализированные гадания на основе вашего профиля",
      feature_multilingual: "Полная поддержка на английском, русском и испанском языках",
      welcome_instruction: "Используйте /help для просмотра всех доступных команд и начните свой мистический путь!",
    
    // Quick reading
    quick_reading_title: "🔮 **Быстрое {type} гадание**",
    
    // Card names (Major Arcana)
    card_name_the_fool: "Шут",
    card_name_the_magician: "Маг",
    card_name_the_high_priestess: "Верховная Жрица",
    card_name_the_empress: "Императрица",
    card_name_the_emperor: "Император",
    card_name_the_hierophant: "Иерофант",
    card_name_the_lovers: "Влюбленные",
    card_name_the_chariot: "Колесница",
    card_name_strength: "Сила",
    card_name_the_hermit: "Отшельник",
    card_name_wheel_of_fortune: "Колесо Фортуны",
    card_name_justice: "Справедливость",
    card_name_the_hanged_man: "Повешенный",
    card_name_death: "Смерть",
    card_name_temperance: "Умеренность",
    card_name_the_devil: "Дьявол",
    card_name_the_tower: "Башня",
    card_name_the_star: "Звезда",
    card_name_the_moon: "Луна",
    card_name_the_sun: "Солнце",
    card_name_judgement: "Суд",
    card_name_the_world: "Мир",
    
    // Minor Arcana card names (Wands)
    card_name_ace_of_wands: "Туз Жезлов",
    card_name_two_of_wands: "Двойка Жезлов",
    card_name_three_of_wands: "Тройка Жезлов",
    card_name_four_of_wands: "Четверка Жезлов",
    card_name_five_of_wands: "Пятерка Жезлов",
    card_name_six_of_wands: "Шестерка Жезлов",
    card_name_seven_of_wands: "Семерка Жезлов",
    card_name_eight_of_wands: "Восьмерка Жезлов",
    card_name_nine_of_wands: "Девятка Жезлов",
    card_name_ten_of_wands: "Десятка Жезлов",
    card_name_page_of_wands: "Паж Жезлов",
    card_name_knight_of_wands: "Рыцарь Жезлов",
    card_name_queen_of_wands: "Дама Жезлов",
    card_name_king_of_wands: "Король Жезлов",
    
    // Minor Arcana card names (Cups)
    card_name_ace_of_cups: "Туз Кубков",
    card_name_two_of_cups: "Двойка Кубков",
    card_name_three_of_cups: "Тройка Кубков",
    card_name_four_of_cups: "Четверка Кубков",
    card_name_five_of_cups: "Пятерка Кубков",
    card_name_six_of_cups: "Шестерка Кубков",
    card_name_seven_of_cups: "Семерка Кубков",
    card_name_eight_of_cups: "Восьмерка Кубков",
    card_name_nine_of_cups: "Девятка Кубков",
    card_name_ten_of_cups: "Десятка Кубков",
    card_name_page_of_cups: "Паж Кубков",
    card_name_knight_of_cups: "Рыцарь Кубков",
    card_name_queen_of_cups: "Дама Кубков",
    card_name_king_of_cups: "Король Кубков",
    
    // Minor Arcana card names (Swords)
    card_name_ace_of_swords: "Туз Мечей",
    card_name_two_of_swords: "Двойка Мечей",
    card_name_three_of_swords: "Тройка Мечей",
    card_name_four_of_swords: "Четверка Мечей",
    card_name_five_of_swords: "Пятерка Мечей",
    card_name_six_of_swords: "Шестерка Мечей",
    card_name_seven_of_swords: "Семерка Мечей",
    card_name_eight_of_swords: "Восьмерка Мечей",
    card_name_nine_of_swords: "Девятка Мечей",
    card_name_ten_of_swords: "Десятка Мечей",
    card_name_page_of_swords: "Паж Мечей",
    card_name_knight_of_swords: "Рыцарь Мечей",
    card_name_queen_of_swords: "Дама Мечей",
    card_name_king_of_swords: "Король Мечей",
    
    // Minor Arcana card names (Pentacles)
    card_name_ace_of_pentacles: "Туз Пентаклей",
    card_name_two_of_pentacles: "Двойка Пентаклей",
    card_name_three_of_pentacles: "Тройка Пентаклей",
    card_name_four_of_pentacles: "Четверка Пентаклей",
    card_name_five_of_pentacles: "Пятерка Пентаклей",
    card_name_six_of_pentacles: "Шестерка Пентаклей",
    card_name_seven_of_pentacles: "Семерка Пентаклей",
    card_name_eight_of_pentacles: "Восьмерка Пентаклей",
    card_name_nine_of_pentacles: "Девятка Пентаклей",
    card_name_ten_of_pentacles: "Десятка Пентаклей",
    card_name_page_of_pentacles: "Паж Пентаклей",
    card_name_knight_of_pentacles: "Рыцарь Пентаклей",
    card_name_queen_of_pentacles: "Дама Пентаклей",
    card_name_king_of_pentacles: "Король Пентаклей",
    
    // Card descriptions
    card_no_description: "Описание для этой карты недоступно.",
    
    // Card meaning fallback
    card_meaning_not_available: "Значение для этой карты недоступно.",
    
    // Card meanings (Major Arcana - General context, Upright)
    card_meaning_the_fool_upright_general: "Новые начинания, невинность, спонтанность, свободный дух",
    card_meaning_the_magician_upright_general: "Проявление, сила, мастерство, концентрация, действие",
    card_meaning_the_high_priestess_upright_general: "Интуиция, тайна, духовность, внутреннее знание, божественная женственность",
    card_meaning_the_empress_upright_general: "Плодородие, забота, изобилие, чувственность, природа",
    card_meaning_the_emperor_upright_general: "Авторитет, структура, контроль, отцовство, сила, стабильность",
    card_meaning_the_hierophant_upright_general: "Традиция, соответствие, мораль, этика, образование, вера",
    card_meaning_the_lovers_upright_general: "Любовь, гармония, отношения, выравнивание ценностей, выбор",
    card_meaning_the_chariot_upright_general: "Контроль, сила воли, решимость, успех, действие, направление",
    card_meaning_strength_upright_general: "Мужество, убеждение, влияние, сострадание, внутренняя сила",
    card_meaning_the_hermit_upright_general: "Поиск души, самоанализ, одиночество, внутреннее руководство",
    card_meaning_wheel_of_fortune_upright_general: "Удача, карма, жизненные циклы, судьба, поворотный момент",
    card_meaning_justice_upright_general: "Справедливость, честность, правда, причина и следствие, закон",
    card_meaning_the_hanged_man_upright_general: "Сдача, отпускание, новые перспективы, просветление",
    card_meaning_death_upright_general: "Завершения, изменения, трансформация, переход",
    card_meaning_temperance_upright_general: "Баланс, умеренность, терпение, цель, смысл",
    card_meaning_the_devil_upright_general: "Теневое я, привязанность, зависимость, ограничение, сексуальность",
    card_meaning_the_tower_upright_general: "Внезапные изменения, потрясения, хаос, откровение, пробуждение",
    card_meaning_the_star_upright_general: "Надежда, вера, цель, обновление, духовность",
    card_meaning_the_moon_upright_general: "Иллюзия, страх, тревога, подсознание, интуиция",
    card_meaning_the_sun_upright_general: "Позитивность, веселье, тепло, успех, жизненная сила",
    card_meaning_judgement_upright_general: "Суд, возрождение, внутренний зов, отпущение грехов",
    card_meaning_the_world_upright_general: "Завершение, интеграция, достижение, путешествия",
    
         // Card meanings (Major Arcana - General context, Reversed)
     card_meaning_the_fool_reversed_general: "Сдерживание, безрассудство, риск, невнимательность",
     card_meaning_the_magician_reversed_general: "Манипуляция, плохое планирование, нераскрытые таланты",
     card_meaning_the_high_priestess_reversed_general: "Тайны, отключение от интуиции, отстранение, молчание",
     card_meaning_the_empress_reversed_general: "Творческий блок, зависимость от других, пустота",
     card_meaning_the_emperor_reversed_general: "Доминирование, чрезмерный контроль, жесткость, негибкость",
     card_meaning_the_hierophant_reversed_general: "Личные убеждения, свобода, вызов статус-кво",
     card_meaning_the_lovers_reversed_general: "Любовь к себе, дисгармония, дисбаланс, несоответствие ценностей",
     card_meaning_the_chariot_reversed_general: "Отсутствие контроля, отсутствие направления, агрессия",
     card_meaning_strength_reversed_general: "Внутренняя сила, неуверенность в себе, низкая энергия, сырые эмоции",
     card_meaning_the_hermit_reversed_general: "Изоляция, одиночество, отстранение",
     card_meaning_wheel_of_fortune_reversed_general: "Неудача, отсутствие контроля, цепляние за контроль, нежелательные изменения",
     card_meaning_justice_reversed_general: "Несправедливость, отсутствие ответственности, нечестность",
     card_meaning_the_hanged_man_reversed_general: "Сопротивление, задержка, нерешительность, промедление",
     card_meaning_death_reversed_general: "Сопротивление изменениям, неспособность двигаться дальше, застой",
     card_meaning_temperance_reversed_general: "Дисбаланс, избыток, самоисцеление, перестройка",
     card_meaning_the_devil_reversed_general: "Освобождение от ограничивающих убеждений, исследование темных мыслей, отстранение",
     card_meaning_the_tower_reversed_general: "Страх изменений, избегание катастрофы, отсрочка неизбежного",
     card_meaning_the_star_reversed_general: "Отсутствие веры, отчаяние, отключение, уныние",
     card_meaning_the_moon_reversed_general: "Освобождение от страха, подавленные эмоции, внутренняя путаница",
     card_meaning_the_sun_reversed_general: "Внутренний ребенок, подавленность, чрезмерный оптимизм",
     card_meaning_judgement_reversed_general: "Неуверенность в себе, внутренний критик, игнорирование зова",
     card_meaning_the_world_reversed_general: "Отсутствие завершения, отсутствие закрытия, задержка",
     
     // Survey translations
     survey_introduction: "🔮 **Персональный опрос профиля**\n\nЧтобы предоставить вам наиболее точные и персонализированные гадания на таро, я хотел бы узнать немного больше о вас. Эта информация помогает мне адаптировать интерпретации к вашей уникальной ситуации и жизненным обстоятельствам.\n\nВаша конфиденциальность важна - вся информация хранится безопасно и используется только для улучшения вашего опыта гадания.",
     survey_benefits: "✨ **Преимущества заполнения опроса:**\n• Более точные и релевантные гадания\n• Персонализированные интерпретации на основе вашей жизненной ситуации\n• Лучшие советы для ваших конкретных обстоятельств\n• Улучшенная духовная связь через понимание вашего фона",
     survey_start: "Давайте начнем! Это займет всего несколько минут.",
     survey_completed: "🎉 **Опрос завершен!**\n\nСпасибо за предоставленную информацию. Ваш профиль сохранен и поможет предоставить более персонализированные и точные гадания на таро.\n\nТеперь вы можете наслаждаться улучшенными гаданиями, адаптированными к вашей уникальной ситуации!",
     survey_skip: "Вы можете пропустить этот опрос и заполнить его позже, используя команду /profile.",
           survey_cancel: "Опрос отменен. Вы можете перезапустить его в любое время с помощью команды /profile.",
      survey_previous_not_available: "Навигация к предыдущему вопросу пока недоступна. Пожалуйста, используйте текстовый ввод.",
     
     // Survey questions
     survey_question_gender: "Какой у вас пол?",
     survey_question_age_group: "Какая у вас возрастная группа?",
     survey_question_emotional_state: "Как бы вы описали свое текущее эмоциональное состояние?",
     survey_question_life_focus: "На какой области жизни вы сейчас больше всего сосредоточены?",
     survey_question_spiritual_beliefs: "Как бы вы описали свои духовные убеждения?",
     survey_question_relationship_status: "Какой у вас текущий статус отношений?",
     survey_question_career_stage: "На каком этапе вы находитесь в карьере или работе?",
     
     // Survey navigation
     survey_next: "Далее",
     survey_previous: "Назад",
     survey_finish: "Завершить опрос",
     survey_cancel_survey: "Отменить опрос",
     survey_progress: "Вопрос {current} из {total}",
     
     // Reversal-related translations
     reversals_enabled: "🔄 <b>Перевернутые карты включены</b>\n\nВаши гадания на таро теперь будут включать перевернутые карты, которые могут предоставить дополнительную глубину и нюансы в интерпретациях.",
     reversals_disabled: "🔄 <b>Перевернутые карты отключены</b>\n\nВаши гадания на таро теперь будут показывать все карты в прямом положении для более простых интерпретаций.",
     
     // Profile update translations
     profile_update_prompt: "Хотите ли вы обновить информацию в профиле?",
     profile_update_yes: "Да, обновить профиль",
     profile_update_no: "Нет, оставить текущий",
     profile_update_cancelled: "✅ Обновление профиля отменено. Ваша текущая информация в профиле будет сохранена."
   },
  
  es: {
    // Welcome and help
    welcome: "🔮 ¡Bienvenido al Bot Místico de Tarot!\n\nSoy tu lector de tarot personal, listo para guiarte a través de los misterios de la vida.\n\nUsa /help para ver todos los comandos disponibles.",
         help: "🔮 <b>Comandos del Bot de Tarot</b>\n\n📖 <b>Tipos de Lecturas:</b>\n• /daily - Lectura de carta diaria\n• /love - Lectura de amor y relaciones\n• /career - Lectura de carrera y trabajo\n• /quick - Lectura rápida de 3 cartas\n• /fulldeck - Opciones avanzadas de mazo completo\n\n📊 <b>Otros Comandos:</b>\n• /profile - Completar encuesta personal para mejores lecturas\n• /reversals - Activar/desactivar cartas invertidas\n• /stats - Ver estadísticas de lecturas\n• /language - Cambiar idioma\n• /help - Mostrar esta ayuda\n\n💬 <b>¡O simplemente hazme una pregunta!</b>",
    tarot_bot_commands: "🔮 <b>Comandos Disponibles:</b>\n\n📖 <b>Tipos de Lecturas:</b>\n• /daily - Lectura de carta diaria\n• /love - Lectura de amor y relaciones\n• /career - Lectura de carrera y trabajo\n• /quick - Lectura rápida de 3 cartas\n• /fulldeck - Opciones avanzadas de mazo completo\n\n📊 <b>Otros Comandos:</b>\n• /profile - Completar encuesta personal para mejores lecturas\n• /reversals - Activar/desactivar cartas invertidas\n• /stats - Ver estadísticas de lecturas\n• /language - Cambiar idioma\n• /help - Mostrar ayuda detallada\n\n💬 <b>¡O simplemente hazme una pregunta!</b>",
    
    // Language selection
    language_select: "🌍 <b>Selecciona tu idioma</b>\n\nElige tu idioma preferido para la interfaz del bot:",
    language_changed: "✅ ¡Idioma cambiado a {language}!",
    language_current: "🌍 Tu idioma actual es: {language}",
    
    // Reading types
    daily_reading: "🔮 <b>Lectura de Carta Diaria</b>\n\nLa carta de hoy te trae sabiduría y guía...",
    love_reading: "💕 <b>Lectura de Amor y Relaciones</b>\n\nDeja que las cartas revelen insights sobre tu corazón...",
    career_reading: "💼 <b>Lectura de Carrera y Trabajo</b>\n\nDescubre qué dicen las cartas sobre tu camino profesional...",
    quick_reading: "⚡ <b>Lectura Rápida de 3 Cartas</b>\n\nPasado • Presente • Futuro",
    quick_spread_name: "Tirada Rápida de 3 Cartas",
    fulldeck_options: "🔮 <b>Opciones de Lectura de Mazo Completo</b>\n\nElige tu tipo de mazo preferido:",
    
    // Full deck options
    fulldeck_full: "Mazo completo (Mayores + Menores) - Grandes temas y guía práctica",
    fulldeck_majors: "Solo Arcanos Mayores - Dirección de alto nivel y temas principales de vida",
    fulldeck_wands: "Palo de Bastos - Motivación, creatividad, pasión y acción",
    fulldeck_cups: "Palo de Copas - Emociones, relaciones, intuición y amor",
    fulldeck_swords: "Palo de Espadas - Pensamientos, desafíos, comunicación y decisiones",
    fulldeck_pentacles: "Palo de Oros - Asuntos materiales, trabajo, finanzas y preocupaciones prácticas",
    
    // Statistics
    stats_title: "📊 <b>Tus Estadísticas de Lectura de Tarot</b>",
    stats_user: "👤 <b>Usuario:</b> {name}",
    stats_member_since: "📅 <b>Miembro desde:</b> {date}",
    stats_summary: "🔮 <b>Resumen de Lecturas:</b>",
    stats_total: "• Total de lecturas: {count}",
    stats_ai_enhanced: "• Lecturas con IA: {count}",
    stats_personalized: "• Lecturas personalizadas: {count}",
    stats_types_used: "• Tipos de lectura usados: {count}",
    stats_favorites: "⭐ <b>Tus Tipos de Lectura Favoritos:</b>",
    stats_favorite_item: "{index}. {type}: {count} lecturas",
    stats_encouragement: "✨ ¡Sigue explorando el mundo místico del tarot!",
    
    // Messages
    reading_in_progress: "🔮 Barajando las cartas...",
    reading_complete: "✅ ¡Lectura completada!",
    error_generic: "❌ Ocurrió un error. Por favor, inténtalo de nuevo.",
    error_reading: "❌ Error al realizar la lectura. Por favor, inténtalo de nuevo.",
    message_too_long: "🔮 ¡Tu lectura de tarot está lista! El mensaje era demasiado largo para mostrarlo completamente. Por favor, prueba un tipo de lectura diferente.",
    
    // Prompts
    ask_question: "💭 ¿Qué te gustaría saber? ¡Pregúntame lo que quieras!",
    choose_option: "Por favor, elige una opción (1-3) o haz tu pregunta:",
    
    // Card information
    card_upright: "Derecha",
    card_reversed: "Invertida",
    card_keywords: "Palabras clave",
    card_meaning: "Significado",
    card_advice: "Consejo",
    card_reversed_note: "Nota: La imagen de la carta se muestra derecha para mayor claridad, pero el significado está invertido",
    card_type_major_arcana: "Arcanos Mayores",
    card_type_minor_arcana: "Arcanos Menores",
    
    // Reading sections
    reading_summary_title: "**🔮 Resumen de Lectura**",
    reading_cards_drawn: "📊 **Cartas Extraídas:** {count}",
    reading_major_arcana: "✨ **Arcanos Mayores:** {count}",
    reading_minor_arcana: "⚡ **Arcanos Menores:** {count}",
    reading_reversed: "🔄 **Invertidas:** {count}",
    reading_dominant_themes: "**🎯 Temas Dominantes:**",
    reading_overall_message: "**💫 Mensaje General:**",
    reading_advice_title: "**💡 Consejo para Avanzar:**",
    
    // Reading introductions
    reading_love_intro: "Esta lectura se enfoca en asuntos del corazón y relaciones. ",
    reading_career_intro: "Esta lectura explora tu camino profesional y vida laboral. ",
    reading_health_intro: "Esta lectura aborda tu bienestar físico y emocional. ",
    reading_general_intro: "Esta lectura proporciona guía general para tu viaje de vida. ",
    reading_wisdom_intro: "Deja que las cartas revelen su sabiduría.",
    
    // Reading challenges
    reading_challenges_high: "Esta lectura sugiere que puedes estar experimentando algunos desafíos o resistencia. El alto número de cartas invertidas indica conflictos internos u obstáculos externos. Considera qué podrías estar resistiendo o qué necesita ser liberado.\n\n",
    reading_challenges_mixed: "Esta lectura muestra una mezcla de energías. Aunque hay algunos desafíos, también hay oportunidades para el crecimiento y cambio positivo.\n\n",
    reading_challenges_low: "Esta lectura lleva predominantemente energía positiva. Las cartas sugieren circunstancias favorables y caminos claros hacia adelante.\n\n",
    
    // Reading guidance
    reading_guidance_love: "En asuntos de amor, enfócate en la comunicación abierta y la honestidad emocional. Confía en tu corazón mientras permaneces arraigado en la realidad.",
    reading_guidance_career: "En tu carrera, aprovecha tus fortalezas y sé abierto a nuevas oportunidades. El crecimiento profesional a menudo viene a través de desafíos.",
    reading_guidance_health: "Para tu salud, escucha la sabiduría de tu cuerpo y mantén el equilibrio en todos los aspectos de tu vida.",
    reading_guidance_general: "Confía en tu intuición y permanece abierto a la guía que el universo te está ofreciendo.",
    
    // Advice points
    advice_trust_intuition: "Confía en tu intuición y en tu sabiduría interior",
    advice_take_action: "Actúa y avanza con confianza",
    advice_patience: "Practica paciencia y deja que las cosas evolucionen naturalmente",
    advice_embrace_change: "Acepta los cambios y la transformación en tu vida",
    advice_balance_harmony: "Busca el equilibrio y la armonía en todas las áreas de tu vida",
    advice_release: "Libera lo que ya no te sirve",
    advice_focus: "Concentra tu energía y atención en tus objetivos",
    advice_trust_journey: "Confía en el viaje y permanece abierto a la guía",
    advice_listen_inner_voice: "Escucha tu voz interior y tu intuición",
    advice_one_step: "Toma un paso a la vez hacia tus objetivos",
    
          // Reading display
      reading_your_question: "❓ **Tu Pregunta:** {question}",
      reading_performed_on: "Lectura realizada el {date}",
      reading_personalized_note: "Esta lectura ha sido personalizada basándose en la información de tu perfil.",
      
      // Welcome and features
      welcome_title: "🔮 ¡Bienvenido al Bot Místico de Tarot!",
      welcome_message: "Soy tu lector de tarot personal, listo para guiarte a través de los misterios de la vida con hermosas imágenes de cartas e insights personalizados.",
      welcome_features: "✨ Lo que hace especial a este bot:",
      feature_cards: "Hermosas imágenes de cartas para cada lectura",
      feature_ai: "Interpretaciones mejoradas con IA para insights más profundos",
      feature_personalized: "Lecturas personalizadas basadas en tu perfil",
      feature_multilingual: "Soporte completo en inglés, ruso y español",
      welcome_instruction: "¡Usa /help para ver todos los comandos disponibles y comienza tu viaje místico!",
    
    // Quick reading
    quick_reading_title: "🔮 **Lectura Rápida {type}**",
    
    // Card names (Major Arcana)
    card_name_the_fool: "El Loco",
    card_name_the_magician: "El Mago",
    card_name_the_high_priestess: "La Sacerdotisa",
    card_name_the_empress: "La Emperatriz",
    card_name_the_emperor: "El Emperador",
    card_name_the_hierophant: "El Hierofante",
    card_name_the_lovers: "Los Enamorados",
    card_name_the_chariot: "El Carro",
    card_name_strength: "La Fuerza",
    card_name_the_hermit: "El Ermitaño",
    card_name_wheel_of_fortune: "La Rueda de la Fortuna",
    card_name_justice: "La Justicia",
    card_name_the_hanged_man: "El Colgado",
    card_name_death: "La Muerte",
    card_name_temperance: "La Templanza",
    card_name_the_devil: "El Diablo",
    card_name_the_tower: "La Torre",
    card_name_the_star: "La Estrella",
    card_name_the_moon: "La Luna",
    card_name_the_sun: "El Sol",
    card_name_judgement: "El Juicio",
    card_name_the_world: "El Mundo",
    
    // Minor Arcana card names (Wands)
    card_name_ace_of_wands: "As de Bastos",
    card_name_two_of_wands: "Dos de Bastos",
    card_name_three_of_wands: "Tres de Bastos",
    card_name_four_of_wands: "Cuatro de Bastos",
    card_name_five_of_wands: "Cinco de Bastos",
    card_name_six_of_wands: "Seis de Bastos",
    card_name_seven_of_wands: "Siete de Bastos",
    card_name_eight_of_wands: "Ocho de Bastos",
    card_name_nine_of_wands: "Nueve de Bastos",
    card_name_ten_of_wands: "Diez de Bastos",
    card_name_page_of_wands: "Paje de Bastos",
    card_name_knight_of_wands: "Caballero de Bastos",
    card_name_queen_of_wands: "Reina de Bastos",
    card_name_king_of_wands: "Rey de Bastos",
    
    // Minor Arcana card names (Cups)
    card_name_ace_of_cups: "As de Copas",
    card_name_two_of_cups: "Dos de Copas",
    card_name_three_of_cups: "Tres de Copas",
    card_name_four_of_cups: "Cuatro de Copas",
    card_name_five_of_cups: "Cinco de Copas",
    card_name_six_of_cups: "Seis de Copas",
    card_name_seven_of_cups: "Siete de Copas",
    card_name_eight_of_cups: "Ocho de Copas",
    card_name_nine_of_cups: "Nueve de Copas",
    card_name_ten_of_cups: "Diez de Copas",
    card_name_page_of_cups: "Paje de Copas",
    card_name_knight_of_cups: "Caballero de Copas",
    card_name_queen_of_cups: "Reina de Copas",
    card_name_king_of_cups: "Rey de Copas",
    
    // Minor Arcana card names (Swords)
    card_name_ace_of_swords: "As de Espadas",
    card_name_two_of_swords: "Dos de Espadas",
    card_name_three_of_swords: "Tres de Espadas",
    card_name_four_of_swords: "Cuatro de Espadas",
    card_name_five_of_swords: "Cinco de Espadas",
    card_name_six_of_swords: "Seis de Espadas",
    card_name_seven_of_swords: "Siete de Espadas",
    card_name_eight_of_swords: "Ocho de Espadas",
    card_name_nine_of_swords: "Nueve de Espadas",
    card_name_ten_of_swords: "Diez de Espadas",
    card_name_page_of_swords: "Paje de Espadas",
    card_name_knight_of_swords: "Caballero de Espadas",
    card_name_queen_of_swords: "Reina de Espadas",
    card_name_king_of_swords: "Rey de Espadas",
    
    // Minor Arcana card names (Pentacles)
    card_name_ace_of_pentacles: "As de Oros",
    card_name_two_of_pentacles: "Dos de Oros",
    card_name_three_of_pentacles: "Tres de Oros",
    card_name_four_of_pentacles: "Cuatro de Oros",
    card_name_five_of_pentacles: "Cinco de Oros",
    card_name_six_of_pentacles: "Seis de Oros",
    card_name_seven_of_pentacles: "Siete de Oros",
    card_name_eight_of_pentacles: "Ocho de Oros",
    card_name_nine_of_pentacles: "Nueve de Oros",
    card_name_ten_of_pentacles: "Diez de Oros",
    card_name_page_of_pentacles: "Paje de Oros",
    card_name_knight_of_pentacles: "Caballero de Oros",
    card_name_queen_of_pentacles: "Reina de Oros",
    card_name_king_of_pentacles: "Rey de Oros",
    
    // Card descriptions
    card_no_description: "No hay descripción disponible para esta carta.",
    
    // Card meaning fallback
    card_meaning_not_available: "No hay significado disponible para esta carta.",
    
    // Card meanings (Major Arcana - General context, Upright)
    card_meaning_the_fool_upright_general: "Nuevos comienzos, inocencia, espontaneidad, espíritu libre",
    card_meaning_the_magician_upright_general: "Manifestación, poder, habilidad, concentración, acción",
    card_meaning_the_high_priestess_upright_general: "Intuición, misterio, espiritualidad, conocimiento interior, femenino divino",
    card_meaning_the_empress_upright_general: "Fertilidad, crianza, abundancia, sensualidad, naturaleza",
    card_meaning_the_emperor_upright_general: "Autoridad, estructura, control, paternidad, poder, estabilidad",
    card_meaning_the_hierophant_upright_general: "Tradición, conformidad, moralidad, ética, educación, creencia",
    card_meaning_the_lovers_upright_general: "Amor, armonía, relaciones, alineación de valores, elecciones",
    card_meaning_the_chariot_upright_general: "Control, fuerza de voluntad, determinación, éxito, acción, dirección",
    card_meaning_strength_upright_general: "Coraje, persuasión, influencia, compasión, fuerza interior",
    card_meaning_the_hermit_upright_general: "Búsqueda del alma, introspección, estar solo, guía interior",
    card_meaning_wheel_of_fortune_upright_general: "Buena suerte, karma, ciclos de vida, destino, un punto de inflexión",
    card_meaning_justice_upright_general: "Justicia, equidad, verdad, causa y efecto, ley",
    card_meaning_the_hanged_man_upright_general: "Rendición, soltar, nuevas perspectivas, iluminación",
    card_meaning_death_upright_general: "Finales, cambio, transformación, transición",
    card_meaning_temperance_upright_general: "Equilibrio, moderación, paciencia, propósito, significado",
    card_meaning_the_devil_upright_general: "Sombra del yo, apego, adicción, restricción, sexualidad",
    card_meaning_the_tower_upright_general: "Cambio repentino, convulsión, caos, revelación, despertar",
    card_meaning_the_star_upright_general: "Esperanza, fe, propósito, renovación, espiritualidad",
    card_meaning_the_moon_upright_general: "Ilusión, miedo, ansiedad, subconsciente, intuición",
    card_meaning_the_sun_upright_general: "Positividad, diversión, calidez, éxito, vitalidad",
    card_meaning_judgement_upright_general: "Juicio, renacimiento, llamado interior, absolución",
    card_meaning_the_world_upright_general: "Finalización, integración, logro, viajes",
    
         // Card meanings (Major Arcana - General context, Reversed)
     card_meaning_the_fool_reversed_general: "Retención, imprudencia, toma de riesgos, falta de consideración",
     card_meaning_the_magician_reversed_general: "Manipulación, mala planificación, talentos no aprovechados",
     card_meaning_the_high_priestess_reversed_general: "Secretos, desconexión de la intuición, retiro, silencio",
     card_meaning_the_empress_reversed_general: "Bloqueo creativo, dependencia de otros, vacío",
     card_meaning_the_emperor_reversed_general: "Dominación, control excesivo, rigidez, inflexibilidad",
     card_meaning_the_hierophant_reversed_general: "Creencias personales, libertad, desafiar el status quo",
     card_meaning_the_lovers_reversed_general: "Amor propio, desarmonía, desequilibrio, desalineación de valores",
     card_meaning_the_chariot_reversed_general: "Falta de control, falta de dirección, agresión",
     card_meaning_strength_reversed_general: "Fuerza interior, duda de sí mismo, baja energía, emoción cruda",
     card_meaning_the_hermit_reversed_general: "Aislamiento, soledad, retiro",
     card_meaning_wheel_of_fortune_reversed_general: "Mala suerte, falta de control, aferrarse al control, cambios no deseados",
     card_meaning_justice_reversed_general: "Injusticia, falta de responsabilidad, deshonestidad",
     card_meaning_the_hanged_man_reversed_general: "Resistencia, estancamiento, indecisión, retraso",
     card_meaning_death_reversed_general: "Resistencia al cambio, incapacidad para seguir adelante, estancamiento",
     card_meaning_temperance_reversed_general: "Desequilibrio, exceso, auto-curación, re-alineación",
     card_meaning_the_devil_reversed_general: "Liberar creencias limitantes, explorar pensamientos oscuros, desapego",
     card_meaning_the_tower_reversed_general: "Miedo al cambio, evitar el desastre, retrasar lo inevitable",
     card_meaning_the_star_reversed_general: "Falta de fe, desesperación, desconexión, desánimo",
     card_meaning_the_moon_reversed_general: "Liberación del miedo, emoción reprimida, confusión interior",
     card_meaning_the_sun_reversed_general: "Niño interior, sentirse deprimido, excesivamente optimista",
     card_meaning_judgement_reversed_general: "Duda de sí mismo, crítico interior, ignorar la llamada",
     card_meaning_the_world_reversed_general: "Falta de finalización, falta de cierre, retraso",
     
     // Survey translations
     survey_introduction: "🔮 **Encuesta de Perfil Personal**\n\nPara proporcionarte las lecturas de tarot más precisas y personalizadas, me gustaría conocer un poco más sobre ti. Esta información me ayuda a adaptar las interpretaciones a tu situación única y circunstancias de vida.\n\nTu privacidad es importante - toda la información se almacena de forma segura y se usa solo para mejorar tu experiencia de lectura.",
     survey_benefits: "✨ **Beneficios de completar la encuesta:**\n• Lecturas más precisas y relevantes\n• Interpretaciones personalizadas basadas en tu situación de vida\n• Mejor orientación para tus circunstancias específicas\n• Conexión espiritual mejorada a través del entendimiento de tu contexto",
     survey_start: "¡Empecemos! Solo tomará unos minutos.",
     survey_completed: "🎉 **¡Encuesta Completada!**\n\nGracias por compartir tu información. Tu perfil ha sido guardado y ayudará a proporcionar lecturas de tarot más personalizadas y precisas.\n\n¡Ahora puedes disfrutar de lecturas mejoradas que están adaptadas a tu situación única!",
     survey_skip: "Puedes omitir esta encuesta y completarla más tarde usando el comando /profile.",
           survey_cancel: "Encuesta cancelada. Puedes reiniciarla en cualquier momento con el comando /profile.",
      survey_previous_not_available: "La navegación a la pregunta anterior no está disponible aún. Por favor, usa entrada de texto.",
     
     // Survey questions
     survey_question_gender: "¿Cuál es tu identidad de género?",
     survey_question_age_group: "¿Cuál es tu grupo de edad?",
     survey_question_emotional_state: "¿Cómo describirías tu estado emocional actual?",
     survey_question_life_focus: "¿En qué área de la vida te enfocas más ahora?",
     survey_question_spiritual_beliefs: "¿Cómo describirías tus creencias espirituales?",
     survey_question_relationship_status: "¿Cuál es tu estado de relación actual?",
     survey_question_career_stage: "¿En qué etapa estás en tu carrera o vida laboral?",
     
     // Survey navigation
     survey_next: "Siguiente",
     survey_previous: "Anterior",
     survey_finish: "Finalizar Encuesta",
     survey_cancel_survey: "Cancelar Encuesta",
     survey_progress: "Pregunta {current} de {total}",
     
     // Reversal-related translations
     reversals_enabled: "🔄 <b>Cartas Invertidas Habilitadas</b>\n\nTus lecturas de tarot ahora incluirán cartas invertidas, que pueden proporcionar profundidad adicional y matices a las interpretaciones.",
     reversals_disabled: "🔄 <b>Cartas Invertidas Deshabilitadas</b>\n\nTus lecturas de tarot ahora mostrarán todas las cartas en posición derecha para interpretaciones más simples.",
     
     // Profile update translations
     profile_update_prompt: "¿Te gustaría actualizar la información de tu perfil?",
     profile_update_yes: "Sí, Actualizar Perfil",
     profile_update_no: "No, Mantener Actual",
     profile_update_cancelled: "✅ Actualización de perfil cancelada. Se mantendrá la información actual de tu perfil."
   }
 };

export default {
  SUPPORTED_LANGUAGES,
  detectLanguage,
  getUserPreferredLanguage,
  setUserPreferredLanguage,
  getTranslation
};
