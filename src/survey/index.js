// Survey Module for User Profile Collection
// Handles the personal survey to improve tarot reading accuracy

import { getTranslation } from '../languages/index.js';
import { updateUserProfile, isProfileCompleted } from '../database/users.js';

// Survey questions and options - Only 3 essential fields
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

    // Store the answer
    session.answers[questionKey] = selectedValue;
    
    // Move to next question
    session.currentQuestion++;
    
    // Check if survey is complete
    if (session.currentQuestion >= session.questionKeys.length) {
      // Survey completed, save to database
      this.completeSurvey(telegramId);
      
      return {
        status: 'completed',
        message: getTranslation('survey_completed', session.language)
      };
    }
    
    // Return next question
    return {
      status: 'next_question',
      question: this.getCurrentQuestion(telegramId)
    };
  }

  /**
   * Complete survey and save to database
   * @param {number} telegramId - User's Telegram ID
   */
  completeSurvey(telegramId) {
    const session = this.userSessions.get(telegramId);
    if (!session) {
      throw new Error('No active survey session');
    }

    // Map survey answers to database fields
    const profileData = {
      gender: session.answers.gender,
      ageGroup: session.answers.age_group,
      spiritualBeliefs: session.answers.spiritual_beliefs
    };

    // Save to database
    updateUserProfile(telegramId, profileData);
    
    // Clear session
    this.userSessions.delete(telegramId);
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
   * Cancel survey for user
   * @param {number} telegramId - User's Telegram ID
   */
  cancelSurvey(telegramId) {
    this.userSessions.delete(telegramId);
  }
}

// Create singleton instance
export const surveyManager = new SurveyManager();

/**
 * Check if user should complete survey
 * @param {number} telegramId - User's Telegram ID
 * @returns {boolean} True if survey should be completed
 */
export function shouldCompleteSurvey(telegramId) {
  return !isProfileCompleted(telegramId);
}

/**
 * Get survey introduction text
 * @param {string} language - User language
 * @returns {string} Introduction text
 */
export function getSurveyIntroduction(language = 'en') {
  return getTranslation('survey_introduction', language);
}

/**
 * Get survey benefits text
 * @param {string} language - User language
 * @returns {string} Benefits text
 */
export function getSurveyBenefits(language = 'en') {
  return getTranslation('survey_benefits', language);
}
