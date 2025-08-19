import OpenAI from "openai";
import logger from './utils/logger.js';

let client = null;

function getOpenAIClient() {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

/**
 * Ask GPT for a response to userText.
 * Uses Chat Completions for simplicity. You can switch to the Responses API if you prefer.
 */
export async function askGpt(userText) {
  const systemPrompt = process.env.SYSTEM_PROMPT || "You are a helpful assistant.";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // Log the prompts for debugging
  logger.debug('OpenAI General Request', {
    userText: userText.substring(0, 100) + (userText.length > 100 ? '...' : ''),
    systemPrompt
  });

  const openAIClient = getOpenAIClient();
  if (!openAIClient) {
    return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
  }

  const completion = await openAIClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ],
    temperature: 0.7,
  });

  const response = completion.choices?.[0]?.message?.content?.trim() ?? "(no response)";
  
  // Log the response
  logger.debug('OpenAI General Response', {
    responseLength: response.length,
    response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
  });

  return response;
}

/**
 * Generate tarot reading interpretation using GPT
 * @param {Array} interpretations - Array of card interpretation objects
 * @param {string} spreadName - Name of the spread used
 * @param {string} context - Reading context (love, career, general, etc.)
 * @param {string} userQuestion - User's specific question
 * @param {string} language - Language for response (en, ru, es)
 * @param {Object} userProfile - User profile information (optional)
 * @returns {string} Enhanced interpretation from GPT
 */
export async function generateTarotInterpretation(interpretations, spreadName, context = 'general', userQuestion = '', language = 'en', userProfile = null) {
  const languageInstructions = {
    en: 'Respond in English.',
    ru: 'Отвечай на русском языке.',
    es: 'Responde en español.'
  };
  
  const systemPrompt = `You are a wise and intuitive tarot reader. Provide concise, meaningful interpretations that fit within 1000 characters.

Guidelines:
- Be concise but insightful (max 1000 characters)
- Focus on the most important messages
- Use clear, simple language
- Provide practical guidance
- Be encouraging and supportive
- Remember: readings are for entertainment and self-reflection
- ${languageInstructions[language] || languageInstructions.en}

Format: Brief introduction, key insights, practical guidance.`;

  // Build the user prompt with card information
  let userPrompt = `I've drawn the following cards for a ${context} reading using the ${spreadName} spread:\n\n`;
  
  interpretations.forEach((interpretation, index) => {
    userPrompt += `${index + 1}. ${interpretation.name} (${interpretation.orientation})\n`;
    userPrompt += `   Meaning: ${interpretation.meaning}\n`;
    if (interpretation.keywords && interpretation.keywords.length > 0) {
      userPrompt += `   Keywords: ${interpretation.keywords.join(', ')}\n`;
    }
    userPrompt += '\n';
  });

  if (userQuestion) {
    userPrompt += `Question: "${userQuestion}"\n\n`;
  }

  // Add user profile information if available
  if (userProfile) {
    userPrompt += `User Profile Information:\n`;
    if (userProfile.gender) userPrompt += `- Gender: ${userProfile.gender}\n`;
    if (userProfile.age_group) userPrompt += `- Age Group: ${userProfile.age_group}\n`;
    if (userProfile.spiritual_beliefs) userPrompt += `- Spiritual Beliefs: ${userProfile.spiritual_beliefs}\n`;
    userPrompt += '\n';
  }

  userPrompt += `Provide a concise interpretation (max 1000 characters) that connects these cards meaningfully for this ${context} reading. Focus on the most important insights and practical guidance.`;

  // Log the prompts for debugging
  logger.debug('OpenAI Tarot Interpretation Request', {
    context,
    spreadName,
    language,
    cardCount: interpretations.length,
    userQuestion: userQuestion || 'None',
    hasUserProfile: !!userProfile
  });
  
  logger.debug('OpenAI System Prompt', { systemPrompt });
  logger.debug('OpenAI User Prompt', { userPrompt });

  try {
    const openAIClient = getOpenAIClient();
    if (!openAIClient) {
      return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
    }
    
    const completion = await openAIClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8, // Slightly higher for more creative interpretations
      max_tokens: 500, // Shorter responses for Telegram
    });

    const response = completion.choices?.[0]?.message?.content?.trim() ?? "Unable to generate interpretation at this time.";
    
    // Log the response
    logger.debug('OpenAI Tarot Interpretation Response', {
      responseLength: response.length,
      response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
    });

    return response;
  } catch (error) {
    logger.errorWithStack('Error generating tarot interpretation', error);
    return "I'm having trouble connecting to my intuitive guidance right now. Please try again in a moment.";
  }
}

/**
 * Generate personalized advice based on a reading
 * @param {Array} interpretations - Array of card interpretation objects
 * @param {string} context - Reading context
 * @param {string} userQuestion - User's question
 * @param {string} language - Language for response (en, ru, es)
 * @param {Object} userProfile - User profile information (optional)
 * @returns {string} Personalized advice
 */
export async function generatePersonalizedAdvice(interpretations, context = 'general', userQuestion = '', language = 'en', userProfile = null) {
  const languageInstructions = {
    en: 'Respond in English.',
    ru: 'Отвечай на русском языке.',
    es: 'Responde en español.'
  };
  
  const systemPrompt = `You are a compassionate spiritual advisor. Provide concise, actionable advice (max 800 characters).

Guidelines:
- Give 2-3 specific, actionable tips
- Be encouraging and practical
- Focus on immediate next steps
- Use simple, clear language
- Keep it brief but meaningful
- ${languageInstructions[language] || languageInstructions.en}

Format: "💡 Advice: [2-3 numbered points]"`;

  let userPrompt = `Based on this ${context} reading:\n\n`;
  
  interpretations.forEach((interpretation, index) => {
    userPrompt += `• ${interpretation.name} (${interpretation.orientation}): ${interpretation.meaning}\n`;
  });

    if (userQuestion) {
    userPrompt += `\nThe person asked: "${userQuestion}"\n\n`;
  }

  // Add user profile information if available
  if (userProfile) {
    userPrompt += `User Profile Information:\n`;
    if (userProfile.gender) userPrompt += `- Gender: ${userProfile.gender}\n`;
    if (userProfile.age_group) userPrompt += `- Age Group: ${userProfile.age_group}\n`;
    if (userProfile.spiritual_beliefs) userPrompt += `- Spiritual Beliefs: ${userProfile.spiritual_beliefs}\n`;
    userPrompt += '\n';
  }

  userPrompt += `Provide 2-3 specific, actionable tips (max 800 characters) to help this person move forward positively.`;

  // Log the prompts for debugging
  logger.debug('OpenAI Personalized Advice Request', {
    context,
    language,
    cardCount: interpretations.length,
    userQuestion: userQuestion || 'None',
    hasUserProfile: !!userProfile
  });
  
  logger.debug('OpenAI Advice System Prompt', { systemPrompt });
  logger.debug('OpenAI Advice User Prompt', { userPrompt });

  try {
    const openAIClient = getOpenAIClient();
    if (!openAIClient) {
      return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
    }
    
    const completion = await openAIClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300, // Shorter advice for Telegram
    });

    const response = completion.choices?.[0]?.message?.content?.trim() ?? "Unable to generate advice at this time.";
    
    // Log the response
    logger.debug('OpenAI Personalized Advice Response', {
      responseLength: response.length,
      response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
    });

    return response;
  } catch (error) {
    logger.errorWithStack('Error generating advice', error);
    return "I'm unable to provide specific advice right now. Trust your intuition and take small steps forward.";
  }
}

/**
 * Answer follow-up questions about a reading
 * @param {Array} interpretations - Array of card interpretation objects from the original reading
 * @param {string} followUpQuestion - User's follow-up question
 * @param {string} context - Original reading context
 * @param {string} language - Language for response (en, ru, es)
 * @returns {string} Answer to follow-up question
 */
export async function answerFollowUpQuestion(interpretations, followUpQuestion, context = 'general', language = 'en') {
  const languageInstructions = {
    en: 'Respond in English.',
    ru: 'Отвечай на русском языке.',
    es: 'Responde en español.'
  };
  
  const systemPrompt = `You are a knowledgeable tarot reader. Answer follow-up questions concisely (max 1000 characters).

Guidelines:
- Reference the original cards meaningfully
- Be encouraging and practical
- Keep responses brief but insightful
- Focus on the most relevant guidance
- Use clear, simple language
- ${languageInstructions[language] || languageInstructions.en}`;

  let userPrompt = `The person received this ${context} reading:\n\n`;
  
  interpretations.forEach((interpretation, index) => {
    userPrompt += `${index + 1}. ${interpretation.name} (${interpretation.orientation}): ${interpretation.meaning}\n`;
  });

  userPrompt += `\nTheir follow-up question is: "${followUpQuestion}"\n\n`;
  userPrompt += `Provide a concise answer (max 1000 characters) that addresses their question using the wisdom of their original reading.`;

  // Log the prompts for debugging
  logger.debug('OpenAI Follow-up Question Request', {
    context,
    language,
    cardCount: interpretations.length,
    followUpQuestion
  });
  
  logger.debug('OpenAI Follow-up System Prompt', { systemPrompt });
  logger.debug('OpenAI Follow-up User Prompt', { userPrompt });

  try {
    const openAIClient = getOpenAIClient();
    if (!openAIClient) {
      return "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.";
    }
    
    const completion = await openAIClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 400, // Shorter follow-up answers for Telegram
    });

    const response = completion.choices?.[0]?.message?.content?.trim() ?? "I'm having trouble connecting to the cards' wisdom right now. Please try again.";
    
    // Log the response
    logger.debug('OpenAI Follow-up Question Response', {
      responseLength: response.length,
      response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
    });

    return response;
  } catch (error) {
    logger.errorWithStack('Error answering follow-up question', error);
    return "I'm unable to provide additional insight right now. Trust the guidance you've already received.";
  }
}
