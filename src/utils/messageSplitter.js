// Message Splitter Utility
// Handles splitting long messages to stay within Telegram's limits

const TELEGRAM_MAX_LENGTH = 4096;

/**
 * Split a long message into multiple parts
 * @param {string} message - The message to split
 * @param {number} maxLength - Maximum length per message (default: 4096)
 * @returns {Array} Array of message parts
 */
export function splitMessage(message, maxLength = TELEGRAM_MAX_LENGTH) {
  if (message.length <= maxLength) {
    return [message];
  }

  const parts = [];
  let currentPart = '';
  const lines = message.split('\n');

  for (const line of lines) {
    // If adding this line would exceed the limit
    if ((currentPart + line + '\n').length > maxLength) {
      // If current part is not empty, save it and start a new part
      if (currentPart.trim()) {
        parts.push(currentPart.trim());
        currentPart = '';
      }

      // If a single line is too long, split it
      if (line.length > maxLength) {
        const words = line.split(' ');
        let tempLine = '';
        
        for (const word of words) {
          if ((tempLine + ' ' + word).length > maxLength) {
            if (tempLine.trim()) {
              parts.push(tempLine.trim());
              tempLine = word;
            } else {
              // Single word is too long, truncate it
              parts.push(word.substring(0, maxLength - 3) + '...');
            }
          } else {
            tempLine += (tempLine ? ' ' : '') + word;
          }
        }
        
        if (tempLine.trim()) {
          currentPart = tempLine.trim() + '\n';
        }
      } else {
        currentPart = line + '\n';
      }
    } else {
      currentPart += line + '\n';
    }
  }

  // Add the last part if it has content
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  return parts;
}

/**
 * Truncate a message to fit within the limit
 * @param {string} message - The message to truncate
 * @param {number} maxLength - Maximum length (default: 4096)
 * @returns {string} Truncated message
 */
export function truncateMessage(message, maxLength = TELEGRAM_MAX_LENGTH) {
  if (message.length <= maxLength) {
    return message;
  }

  // Try to truncate at a sentence boundary
  const truncated = message.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastNewline = truncated.lastIndexOf('\n');

  const cutPoint = Math.max(lastPeriod, lastExclamation, lastQuestion, lastNewline);

  if (cutPoint > maxLength * 0.8) { // Only use boundary if it's not too far back
    return truncated.substring(0, cutPoint + 1) + '...';
  }

  return truncated + '...';
}

/**
 * Check if a message is too long
 * @param {string} message - The message to check
 * @param {number} maxLength - Maximum length (default: 4096)
 * @returns {boolean} True if message is too long
 */
export function isMessageTooLong(message, maxLength = TELEGRAM_MAX_LENGTH) {
  return message.length > maxLength;
}



