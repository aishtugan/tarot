import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Ask GPT for a response to userText.
 * Uses Chat Completions for simplicity. You can switch to the Responses API if you prefer.
 */
export async function askGpt(userText) {
  const systemPrompt = process.env.SYSTEM_PROMPT || "You are a helpful assistant.";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ],
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content?.trim() ?? "(no response)";
}

/**
 * Generate tarot reading interpretation using GPT
 * @param {Array} cards - Array of card objects with interpretations
 * @param {string} spreadName - Name of the spread used
 * @param {string} context - Reading context (love, career, general, etc.)
 * @param {string} userQuestion - User's specific question
 * @param {string} language - Language for response (en, ru, es)
 * @param {Object} userProfile - User profile information (optional)
 * @returns {string} Enhanced interpretation from GPT
 */
export async function generateTarotInterpretation(cards, spreadName, context = 'general', userQuestion = '', language = 'en', userProfile = null) {
  const languageInstructions = {
    en: 'Respond in English.',
    ru: 'Отвечай на русском языке.',
    es: 'Responde en español.'
  };
  
  const systemPrompt = `You are a wise and intuitive tarot reader. Provide concise, meaningful interpretations that fit within 1500 characters.

Guidelines:
- Be concise but insightful (max 1500 characters)
- Focus on the most important messages
- Use clear, simple language
- Provide practical guidance
- Be encouraging and supportive
- Remember: readings are for entertainment and self-reflection
- ${languageInstructions[language] || languageInstructions.en}

Format: Brief introduction, key insights, practical guidance.`;

  // Build the user prompt with card information
  let userPrompt = `I've drawn the following cards for a ${context} reading using the ${spreadName} spread:\n\n`;
  
  cards.forEach((card, index) => {
    userPrompt += `${index + 1}. ${card.name} (${card.orientation})\n`;
    userPrompt += `   Position: ${card.positionName || `Card ${index + 1}`}\n`;
    userPrompt += `   Meaning: ${card.meaning}\n`;
    if (card.keywords && card.keywords.length > 0) {
      userPrompt += `   Keywords: ${card.keywords.join(', ')}\n`;
    }
    userPrompt += '\n';
  });

  if (userQuestion) {
    userPrompt += `Question: "${userQuestion}"\n\n`;
  }

  // Add user profile information if available
  if (userProfile) {
    userPrompt += `User Profile Information:\n`;
    if (userProfile.age_group) userPrompt += `- Age Group: ${userProfile.age_group}\n`;
    if (userProfile.emotional_state) userPrompt += `- Current Emotional State: ${userProfile.emotional_state}\n`;
    if (userProfile.life_focus) userPrompt += `- Life Focus: ${userProfile.life_focus}\n`;
    if (userProfile.relationship_status) userPrompt += `- Relationship Status: ${userProfile.relationship_status}\n`;
    if (userProfile.career_stage) userPrompt += `- Career Stage: ${userProfile.career_stage}\n`;
    if (userProfile.spiritual_beliefs) userPrompt += `- Spiritual Beliefs: ${userProfile.spiritual_beliefs}\n`;
    userPrompt += '\n';
  }

  userPrompt += `Provide a concise interpretation (max 1500 characters) that connects these cards meaningfully for this ${context} reading. Focus on the most important insights and practical guidance.`;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8, // Slightly higher for more creative interpretations
      max_tokens: 500, // Shorter responses for Telegram
    });

    return completion.choices?.[0]?.message?.content?.trim() ?? "Unable to generate interpretation at this time.";
  } catch (error) {
    console.error('Error generating tarot interpretation:', error);
    return "I'm having trouble connecting to my intuitive guidance right now. Please try again in a moment.";
  }
}

/**
 * Generate personalized advice based on a reading
 * @param {Array} cards - Array of card interpretations
 * @param {string} context - Reading context
 * @param {string} userQuestion - User's question
 * @param {string} language - Language for response (en, ru, es)
 * @param {Object} userProfile - User profile information (optional)
 * @returns {string} Personalized advice
 */
export async function generatePersonalizedAdvice(cards, context = 'general', userQuestion = '', language = 'en', userProfile = null) {
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
  
  cards.forEach((card, index) => {
    userPrompt += `• ${card.name} (${card.orientation}): ${card.meaning}\n`;
  });

  if (userQuestion) {
    userPrompt += `\nThe person asked: "${userQuestion}"\n\n`;
  }

  // Add user profile information if available
  if (userProfile) {
    userPrompt += `User Profile Information:\n`;
    if (userProfile.age_group) userPrompt += `- Age Group: ${userProfile.age_group}\n`;
    if (userProfile.emotional_state) userPrompt += `- Current Emotional State: ${userProfile.emotional_state}\n`;
    if (userProfile.life_focus) userPrompt += `- Life Focus: ${userProfile.life_focus}\n`;
    if (userProfile.relationship_status) userPrompt += `- Relationship Status: ${userProfile.relationship_status}\n`;
    if (userProfile.career_stage) userPrompt += `- Career Stage: ${userProfile.career_stage}\n`;
    if (userProfile.spiritual_beliefs) userPrompt += `- Spiritual Beliefs: ${userProfile.spiritual_beliefs}\n`;
    userPrompt += '\n';
  }

  userPrompt += `Provide 2-3 specific, actionable tips (max 800 characters) to help this person move forward positively.`;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300, // Shorter advice for Telegram
    });

    return completion.choices?.[0]?.message?.content?.trim() ?? "Unable to generate advice at this time.";
  } catch (error) {
    console.error('Error generating advice:', error);
    return "I'm unable to provide specific advice right now. Trust your intuition and take small steps forward.";
  }
}

/**
 * Answer follow-up questions about a reading
 * @param {Array} cards - Array of card interpretations from the original reading
 * @param {string} followUpQuestion - User's follow-up question
 * @param {string} context - Original reading context
 * @param {string} language - Language for response (en, ru, es)
 * @returns {string} Answer to follow-up question
 */
export async function answerFollowUpQuestion(cards, followUpQuestion, context = 'general', language = 'en') {
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
  
  cards.forEach((card, index) => {
    userPrompt += `${index + 1}. ${card.name} (${card.orientation}): ${card.meaning}\n`;
  });

  userPrompt += `\nTheir follow-up question is: "${followUpQuestion}"\n\n`;
  userPrompt += `Provide a concise answer (max 1000 characters) that addresses their question using the wisdom of their original reading.`;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 400, // Shorter follow-up answers for Telegram
    });

    return completion.choices?.[0]?.message?.content?.trim() ?? "I'm having trouble connecting to the cards' wisdom right now. Please try again.";
  } catch (error) {
    console.error('Error answering follow-up question:', error);
    return "I'm unable to provide additional insight right now. Trust the guidance you've already received.";
  }
}
