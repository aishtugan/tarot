// Survey Module for User Profile Collection
// Handles the personal survey to improve tarot reading accuracy

import { getTranslation } from '../languages/index.js';
import { updateUserProfile, isProfileCompleted } from '../database/users.js';

// Survey questions and options
export const SURVEY_QUESTIONS = {
  gender: {
    key: 'gender',
    options: {
      en: [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'non_binary', label: 'Non-binary' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      ru: [
        { value: 'female', label: 'Женский' },
        { value: 'male', label: 'Мужской' },
        { value: 'non_binary', label: 'Небинарный' },
        { value: 'prefer_not_to_say', label: 'Предпочитаю не указывать' }
      ],
      es: [
        { value: 'female', label: 'Femenino' },
        { value: 'male', label: 'Masculino' },
        { value: 'non_binary', label: 'No binario' },
        { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
      ]
    }
  },
  age_group: {
    key: 'age_group',
    options: {
      en: [
        { value: 'under_18', label: 'Under 18' },
        { value: '18_25', label: '18-25' },
        { value: '26_35', label: '26-35' },
        { value: '36_45', label: '36-45' },
        { value: '46_55', label: '46-55' },
        { value: 'over_55', label: 'Over 55' }
      ],
      ru: [
        { value: 'under_18', label: 'До 18 лет' },
        { value: '18_25', label: '18-25 лет' },
        { value: '26_35', label: '26-35 лет' },
        { value: '36_45', label: '36-45 лет' },
        { value: '46_55', label: '46-55 лет' },
        { value: 'over_55', label: 'Старше 55 лет' }
      ],
      es: [
        { value: 'under_18', label: 'Menos de 18' },
        { value: '18_25', label: '18-25' },
        { value: '26_35', label: '26-35' },
        { value: '36_45', label: '36-45' },
        { value: '46_55', label: '46-55' },
        { value: 'over_55', label: 'Más de 55' }
      ]
    }
  },
  emotional_state: {
    key: 'emotional_state',
    options: {
      en: [
        { value: 'happy_optimistic', label: 'Happy & Optimistic' },
        { value: 'calm_peaceful', label: 'Calm & Peaceful' },
        { value: 'anxious_stressed', label: 'Anxious & Stressed' },
        { value: 'sad_depressed', label: 'Sad & Depressed' },
        { value: 'confused_uncertain', label: 'Confused & Uncertain' },
        { value: 'excited_motivated', label: 'Excited & Motivated' }
      ],
      ru: [
        { value: 'happy_optimistic', label: 'Счастливый и оптимистичный' },
        { value: 'calm_peaceful', label: 'Спокойный и умиротворенный' },
        { value: 'anxious_stressed', label: 'Тревожный и напряженный' },
        { value: 'sad_depressed', label: 'Грустный и подавленный' },
        { value: 'confused_uncertain', label: 'Растерянный и неуверенный' },
        { value: 'excited_motivated', label: 'Взволнованный и мотивированный' }
      ],
      es: [
        { value: 'happy_optimistic', label: 'Feliz y optimista' },
        { value: 'calm_peaceful', label: 'Tranquilo y en paz' },
        { value: 'anxious_stressed', label: 'Ansioso y estresado' },
        { value: 'sad_depressed', label: 'Triste y deprimido' },
        { value: 'confused_uncertain', label: 'Confundido e incierto' },
        { value: 'excited_motivated', label: 'Emocionado y motivado' }
      ]
    }
  },
  life_focus: {
    key: 'life_focus',
    options: {
      en: [
        { value: 'love_relationships', label: 'Love & Relationships' },
        { value: 'career_work', label: 'Career & Work' },
        { value: 'personal_growth', label: 'Personal Growth' },
        { value: 'health_wellness', label: 'Health & Wellness' },
        { value: 'family_home', label: 'Family & Home' },
        { value: 'spirituality', label: 'Spirituality' },
        { value: 'financial', label: 'Financial Matters' },
        { value: 'social_friends', label: 'Social Life & Friends' }
      ],
      ru: [
        { value: 'love_relationships', label: 'Любовь и отношения' },
        { value: 'career_work', label: 'Карьера и работа' },
        { value: 'personal_growth', label: 'Личностный рост' },
        { value: 'health_wellness', label: 'Здоровье и благополучие' },
        { value: 'family_home', label: 'Семья и дом' },
        { value: 'spirituality', label: 'Духовность' },
        { value: 'financial', label: 'Финансовые вопросы' },
        { value: 'social_friends', label: 'Социальная жизнь и друзья' }
      ],
      es: [
        { value: 'love_relationships', label: 'Amor y relaciones' },
        { value: 'career_work', label: 'Carrera y trabajo' },
        { value: 'personal_growth', label: 'Crecimiento personal' },
        { value: 'health_wellness', label: 'Salud y bienestar' },
        { value: 'family_home', label: 'Familia y hogar' },
        { value: 'spirituality', label: 'Espiritualidad' },
        { value: 'financial', label: 'Asuntos financieros' },
        { value: 'social_friends', label: 'Vida social y amigos' }
      ]
    }
  },
  spiritual_beliefs: {
    key: 'spiritual_beliefs',
    options: {
      en: [
        { value: 'spiritual_believer', label: 'Spiritual believer' },
        { value: 'religious', label: 'Religious' },
        { value: 'agnostic', label: 'Agnostic' },
        { value: 'atheist', label: 'Atheist' },
        { value: 'open_minded', label: 'Open-minded skeptic' },
        { value: 'not_sure', label: 'Not sure' }
      ],
      ru: [
        { value: 'spiritual_believer', label: 'Духовно верующий' },
        { value: 'religious', label: 'Религиозный' },
        { value: 'agnostic', label: 'Агностик' },
        { value: 'atheist', label: 'Атеист' },
        { value: 'open_minded', label: 'Открытый скептик' },
        { value: 'not_sure', label: 'Не уверен' }
      ],
      es: [
        { value: 'spiritual_believer', label: 'Creyente espiritual' },
        { value: 'religious', label: 'Religioso' },
        { value: 'agnostic', label: 'Agnóstico' },
        { value: 'atheist', label: 'Ateo' },
        { value: 'open_minded', label: 'Escéptico de mente abierta' },
        { value: 'not_sure', label: 'No estoy seguro' }
      ]
    }
  },
  relationship_status: {
    key: 'relationship_status',
    options: {
      en: [
        { value: 'single', label: 'Single' },
        { value: 'in_relationship', label: 'In a relationship' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'complicated', label: 'It\'s complicated' },
        { value: 'not_looking', label: 'Not looking for love' }
      ],
      ru: [
        { value: 'single', label: 'Холост/не замужем' },
        { value: 'in_relationship', label: 'В отношениях' },
        { value: 'married', label: 'Женат/замужем' },
        { value: 'divorced', label: 'Разведен/а' },
        { value: 'complicated', label: 'Сложно' },
        { value: 'not_looking', label: 'Не ищу любовь' }
      ],
      es: [
        { value: 'single', label: 'Soltero/a' },
        { value: 'in_relationship', label: 'En una relación' },
        { value: 'married', label: 'Casado/a' },
        { value: 'divorced', label: 'Divorciado/a' },
        { value: 'complicated', label: 'Es complicado' },
        { value: 'not_looking', label: 'No busco amor' }
      ]
    }
  },
  career_stage: {
    key: 'career_stage',
    options: {
      en: [
        { value: 'student', label: 'Student' },
        { value: 'entry_level', label: 'Entry level' },
        { value: 'mid_career', label: 'Mid-career' },
        { value: 'senior_level', label: 'Senior level' },
        { value: 'entrepreneur', label: 'Entrepreneur' },
        { value: 'career_change', label: 'Career change' },
        { value: 'retired', label: 'Retired' },
        { value: 'unemployed', label: 'Unemployed' }
      ],
      ru: [
        { value: 'student', label: 'Студент' },
        { value: 'entry_level', label: 'Начинающий специалист' },
        { value: 'mid_career', label: 'Средний уровень карьеры' },
        { value: 'senior_level', label: 'Высший уровень' },
        { value: 'entrepreneur', label: 'Предприниматель' },
        { value: 'career_change', label: 'Смена карьеры' },
        { value: 'retired', label: 'На пенсии' },
        { value: 'unemployed', label: 'Безработный' }
      ],
      es: [
        { value: 'student', label: 'Estudiante' },
        { value: 'entry_level', label: 'Nivel inicial' },
        { value: 'mid_career', label: 'Medio de carrera' },
        { value: 'senior_level', label: 'Nivel senior' },
        { value: 'entrepreneur', label: 'Emprendedor' },
        { value: 'career_change', label: 'Cambio de carrera' },
        { value: 'retired', label: 'Jubilado' },
        { value: 'unemployed', label: 'Desempleado' }
      ]
    }
  }
};

// Survey flow management
export class SurveyManager {
  constructor() {
    this.userSessions = new Map(); // Store user survey sessions
  }

  /**
   * Start survey for a user
   * @param {number} telegramId - User's Telegram ID
   * @param {string} language - User's language
   * @returns {Object} First question data
   */
  startSurvey(telegramId, language = 'en') {
    const questionKeys = Object.keys(SURVEY_QUESTIONS);
    const session = {
      telegramId,
      language,
      currentQuestion: 0,
      answers: {},
      questionKeys
    };
    
    this.userSessions.set(telegramId, session);
    
    return this.getCurrentQuestion(telegramId);
  }

  /**
   * Get current question for user
   * @param {number} telegramId - User's Telegram ID
   * @returns {Object} Question data
   */
  getCurrentQuestion(telegramId) {
    const session = this.userSessions.get(telegramId);
    if (!session) {
      throw new Error('No active survey session');
    }

    const questionKey = session.questionKeys[session.currentQuestion];
    const question = SURVEY_QUESTIONS[questionKey];
    
    return {
      questionKey,
      question: getTranslation(`survey_question_${questionKey}`, session.language),
      options: question.options[session.language],
      progress: `${session.currentQuestion + 1}/${session.questionKeys.length}`,
      isLast: session.currentQuestion === session.questionKeys.length - 1
    };
  }

  /**
   * Process user answer
   * @param {number} telegramId - User's Telegram ID
   * @param {string} answer - User's answer
   * @returns {Object} Next question or completion status
   */
  processAnswer(telegramId, answer) {
    const session = this.userSessions.get(telegramId);
    if (!session) {
      throw new Error('No active survey session');
    }

    const questionKey = session.questionKeys[session.currentQuestion];
    const question = SURVEY_QUESTIONS[questionKey];
    const options = question.options[session.language];
    
    // Try to parse numeric answer (1, 2, 3, etc.)
    const choice = parseInt(answer.trim());
    let selectedValue = answer; // Default to original answer
    
    if (!isNaN(choice) && choice >= 1 && choice <= options.length) {
      // User selected by number, get the corresponding value
      selectedValue = options[choice - 1].value;
    } else {
      // User might have typed the option text, try to match
      const lowerAnswer = answer.toLowerCase().trim();
      const matchedOption = options.find(option => 
        option.label.toLowerCase().includes(lowerAnswer) ||
        lowerAnswer.includes(option.label.toLowerCase())
      );
      if (matchedOption) {
        selectedValue = matchedOption.value;
      }
    }
    
    session.answers[questionKey] = selectedValue;
    session.currentQuestion++;

    // Check if survey is complete
    if (session.currentQuestion >= session.questionKeys.length) {
      return this.completeSurvey(telegramId);
    }

    return {
      status: 'next_question',
      question: this.getCurrentQuestion(telegramId)
    };
  }

  /**
   * Complete survey and save profile
   * @param {number} telegramId - User's Telegram ID
   * @returns {Object} Completion data
   */
  async completeSurvey(telegramId) {
    const session = this.userSessions.get(telegramId);
    if (!session) {
      throw new Error('No active survey session');
    }

    // Save profile to database
    await updateUserProfile(telegramId, session.answers);

    // Clean up session
    this.userSessions.delete(telegramId);

    return {
      status: 'completed',
      message: getTranslation('survey_completed', session.language),
      profile: session.answers
    };
  }

  /**
   * Check if user has active survey session
   * @param {number} telegramId - User's Telegram ID
   * @returns {boolean} True if user has active session
   */
  hasActiveSession(telegramId) {
    return this.userSessions.has(telegramId);
  }

  /**
   * Cancel user's survey session
   * @param {number} telegramId - User's Telegram ID
   */
  cancelSurvey(telegramId) {
    this.userSessions.delete(telegramId);
  }

  /**
   * Get survey progress for user
   * @param {number} telegramId - User's Telegram ID
   * @returns {Object|null} Survey progress or null
   */
  getProgress(telegramId) {
    const session = this.userSessions.get(telegramId);
    if (!session) return null;

    return {
      currentQuestion: session.currentQuestion + 1,
      totalQuestions: session.questionKeys.length,
      progress: `${session.currentQuestion + 1}/${session.questionKeys.length}`,
      completed: session.currentQuestion / session.questionKeys.length
    };
  }
}

// Global survey manager instance
export const surveyManager = new SurveyManager();

/**
 * Check if user should complete survey
 * @param {number} telegramId - User's Telegram ID
 * @returns {boolean} True if user should complete survey
 */
export async function shouldCompleteSurvey(telegramId) {
  return !(await isProfileCompleted(telegramId));
}

/**
 * Get survey introduction message
 * @param {string} language - User's language
 * @returns {string} Introduction message
 */
export function getSurveyIntroduction(language = 'en') {
  return getTranslation('survey_introduction', language);
}

/**
 * Get survey benefits message
 * @param {string} language - User's language
 * @returns {string} Benefits message
 */
export function getSurveyBenefits(language = 'en') {
  return getTranslation('survey_benefits', language);
}

export default {
  SURVEY_QUESTIONS,
  SurveyManager,
  surveyManager,
  shouldCompleteSurvey,
  getSurveyIntroduction,
  getSurveyBenefits
};
