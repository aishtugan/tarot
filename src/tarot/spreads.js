// Tarot Reading Spreads Module
// This module defines different tarot spreads and their position meanings

/**
 * Tarot Spread Definitions
 * Each spread defines the number of cards and the meaning of each position
 */
export const SPREADS = {
  // Single card spread - simple daily reading
  single: {
    name: "Single Card",
    description: "A simple one-card reading for daily guidance",
    cardCount: 1,
    positions: [
      {
        position: 1,
        name: "Daily Guidance",
        description: "The main message or theme for today",
        meaning: "This card represents the primary energy or message you should focus on today."
      }
    ]
  },

  // Three card spread - past, present, future
  threeCard: {
    name: "Three Card Spread",
    description: "Past, present, and future reading",
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: "Past",
        description: "Influences from the past affecting your situation",
        meaning: "This card shows what has led you to your current situation and what you can learn from past experiences."
      },
      {
        position: 2,
        name: "Present",
        description: "Your current situation and circumstances",
        meaning: "This card reflects where you are right now and the energies currently surrounding you."
      },
      {
        position: 3,
        name: "Future",
        description: "Potential outcomes and future possibilities",
        meaning: "This card indicates what may come to pass and the direction you're heading."
      }
    ]
  },

  // Celtic Cross spread - comprehensive reading
  celticCross: {
    name: "Celtic Cross",
    description: "A comprehensive ten-card spread for detailed readings",
    cardCount: 10,
    positions: [
      {
        position: 1,
        name: "Present",
        description: "Your current situation",
        meaning: "The central issue or question you're facing right now."
      },
      {
        position: 2,
        name: "Challenge",
        description: "Immediate challenge or obstacle",
        meaning: "What's crossing or challenging you in this situation."
      },
      {
        position: 3,
        name: "Past Foundation",
        description: "Root cause or foundation",
        meaning: "The underlying cause or foundation of your current situation."
      },
      {
        position: 4,
        name: "Recent Past",
        description: "Recent events or influences",
        meaning: "What has recently happened that led to your current situation."
      },
      {
        position: 5,
        name: "Possible Future",
        description: "What may come to pass",
        meaning: "The likely outcome if you continue on your current path."
      },
      {
        position: 6,
        name: "Near Future",
        description: "Immediate future",
        meaning: "What's coming up very soon in your life."
      },
      {
        position: 7,
        name: "Self",
        description: "Your attitude and approach",
        meaning: "How you see yourself and your approach to this situation."
      },
      {
        position: 8,
        name: "Environment",
        description: "External influences and people",
        meaning: "The people and circumstances around you affecting this situation."
      },
      {
        position: 9,
        name: "Hopes & Fears",
        description: "Your hopes and fears",
        meaning: "What you hope for and what you fear about this situation."
      },
      {
        position: 10,
        name: "Outcome",
        description: "Final outcome or resolution",
        meaning: "The ultimate outcome or resolution of this situation."
      }
    ]
  },

  // Love spread - focused on relationships
  love: {
    name: "Love Spread",
    description: "A five-card spread focused on love and relationships",
    cardCount: 5,
    positions: [
      {
        position: 1,
        name: "Your Feelings",
        description: "How you feel about love and relationships",
        meaning: "Your current emotional state and feelings about love."
      },
      {
        position: 2,
        name: "Partner's Feelings",
        description: "How your partner or potential partner feels",
        meaning: "The emotional state and feelings of your partner or potential partner."
      },
      {
        position: 3,
        name: "Relationship Dynamics",
        description: "The energy between you",
        meaning: "The current dynamics and energy flow in your relationship."
      },
      {
        position: 4,
        name: "Challenges",
        description: "Obstacles or challenges in the relationship",
        meaning: "What challenges or obstacles you may face in your love life."
      },
      {
        position: 5,
        name: "Future of Love",
        description: "Where the relationship is heading",
        meaning: "The potential future and direction of your love life."
      }
    ]
  },

  // Career spread - focused on work and professional life
  career: {
    name: "Career Spread",
    description: "A five-card spread focused on career and professional development",
    cardCount: 5,
    positions: [
      {
        position: 1,
        name: "Current Work",
        description: "Your current professional situation",
        meaning: "Where you are right now in your career and work life."
      },
      {
        position: 2,
        name: "Skills & Talents",
        description: "Your professional strengths",
        meaning: "Your key skills, talents, and professional strengths."
      },
      {
        position: 3,
        name: "Opportunities",
        description: "Professional opportunities available",
        meaning: "What opportunities are available to you in your career."
      },
      {
        position: 4,
        name: "Challenges",
        description: "Professional obstacles or challenges",
        meaning: "What challenges or obstacles you may face in your career."
      },
      {
        position: 5,
        name: "Career Path",
        description: "Your professional future",
        meaning: "Where your career path is leading and potential outcomes."
      }
    ]
  },

  // Decision spread - for making choices
  decision: {
    name: "Decision Spread",
    description: "A three-card spread to help with decision making",
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: "Option A",
        description: "First choice or option",
        meaning: "What the first option or choice represents and its implications."
      },
      {
        position: 2,
        name: "Option B",
        description: "Second choice or option",
        meaning: "What the second option or choice represents and its implications."
      },
      {
        position: 3,
        name: "Guidance",
        description: "Advice for making the decision",
        meaning: "Guidance and advice to help you make the best decision."
      }
    ]
  }
};

/**
 * Get a specific spread by name
 * @param {string} spreadName - The name of the spread to get
 * @returns {Object|null} The spread object or null if not found
 */
export function getSpread(spreadName) {
  const spread = SPREADS[spreadName];
  return spread || null;
}

/**
 * Get all available spreads
 * @returns {Object} Object containing all available spreads
 */
export function getAllSpreads() {
  return SPREADS;
}

/**
 * Get spread names as an array
 * @returns {Array} Array of spread names
 */
export function getSpreadNames() {
  return Object.keys(SPREADS);
}

/**
 * Validate if a spread name is valid
 * @param {string} spreadName - The spread name to validate
 * @returns {boolean} True if the spread name is valid
 */
export function isValidSpread(spreadName) {
  return Object.keys(SPREADS).includes(spreadName);
}

/**
 * Get the number of cards required for a spread
 * @param {string} spreadName - The name of the spread
 * @returns {number} Number of cards required
 */
export function getSpreadCardCount(spreadName) {
  const spread = getSpread(spreadName);
  return spread ? spread.cardCount : 0;
}

/**
 * Get position information for a specific card in a spread
 * @param {string} spreadName - The name of the spread
 * @param {number} position - The position number (1-based)
 * @returns {Object|null} Position information or null if not found
 */
export function getPositionInfo(spreadName, position) {
  const spread = getSpread(spreadName);
  if (!spread) {
    return null;
  }
  
  return spread.positions.find(pos => pos.position === position) || null;
}

/**
 * Get all positions for a spread
 * @param {string} spreadName - The name of the spread
 * @returns {Array} Array of position objects
 */
export function getSpreadPositions(spreadName) {
  const spread = getSpread(spreadName);
  return spread ? spread.positions : [];
}

/**
 * Get recommended spreads for different reading types
 * @param {string} readingType - The type of reading (daily, love, career, general, decision)
 * @returns {Array} Array of recommended spreads
 */
export function getRecommendedSpreads(readingType) {
  const recommendations = {
    daily: ['single', 'threeCard'],
    love: ['love', 'threeCard', 'celticCross'],
    career: ['career', 'threeCard', 'celticCross'],
    general: ['threeCard', 'celticCross'],
    decision: ['decision', 'threeCard'],
    comprehensive: ['celticCross'],
    quick: ['single', 'threeCard']
  };
  
  return recommendations[readingType] || ['threeCard'];
}

/**
 * Get the default spread for a reading type
 * @param {string} readingType - The type of reading
 * @returns {string} The default spread name
 */
export function getDefaultSpread(readingType) {
  const defaults = {
    daily: 'single',
    love: 'love',
    career: 'career',
    general: 'threeCard',
    decision: 'decision',
    comprehensive: 'celticCross',
    quick: 'single'
  };
  
  return defaults[readingType] || 'threeCard';
}

/**
 * Format a spread description for display
 * @param {string} spreadName - The name of the spread
 * @returns {string} Formatted description
 */
export function formatSpreadDescription(spreadName) {
  const spread = getSpread(spreadName);
  if (!spread) {
    return 'Unknown spread';
  }
  
  return `${spread.name} (${spread.cardCount} cards): ${spread.description}`;
}

/**
 * Get a summary of all available spreads
 * @returns {Array} Array of spread summaries
 */
export function getSpreadSummary() {
  return Object.entries(SPREADS).map(([key, spread]) => ({
    key,
    name: spread.name,
    cardCount: spread.cardCount,
    description: spread.description
  }));
}
