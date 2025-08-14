// Image Server for Tarot Cards
// Provides local endpoints for serving card images

import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.IMAGE_SERVER_PORT || 3001;

// Serve static files from the images directory
const imagesPath = join(__dirname, '../../images');
app.use('/images', express.static(imagesPath));

// Card image mapping - maps card names to image files
const CARD_IMAGE_MAP = {
  // Major Arcana
  'The Fool': 'major/fool.jpg',
  'The Magician': 'major/magician.jpg',
  'The High Priestess': 'major/high-priestess.jpg',
  'The Empress': 'major/empress.jpg',
  'The Emperor': 'major/emperor.jpg',
  'The Hierophant': 'major/hierophant.jpg',
  'The Lovers': 'major/lovers.jpg',
  'The Chariot': 'major/chariot.jpg',
  'Strength': 'major/strength.jpg',
  'The Hermit': 'major/hermit.jpg',
  'Wheel of Fortune': 'major/wheel-of-fortune.jpg',
  'Justice': 'major/justice.jpg',
  'The Hanged Man': 'major/hanged-man.jpg',
  'Death': 'major/death.jpg',
  'Temperance': 'major/temperance.jpg',
  'The Devil': 'major/devil.jpg',
  'The Tower': 'major/tower.jpg',
  'The Star': 'major/star.jpg',
  'The Moon': 'major/moon.jpg',
  'The Sun': 'major/sun.jpg',
  'Judgement': 'major/judgement.jpg',
  'The World': 'major/world.jpg',
  
  // Minor Arcana - Wands
  'Ace of Wands': 'minor/wands/ace.jpg',
  'Two of Wands': 'minor/wands/two.jpg',
  'Three of Wands': 'minor/wands/three.jpg',
  'Four of Wands': 'minor/wands/four.jpg',
  'Five of Wands': 'minor/wands/five.jpg',
  'Six of Wands': 'minor/wands/six.jpg',
  'Seven of Wands': 'minor/wands/seven.jpg',
  'Eight of Wands': 'minor/wands/eight.jpg',
  'Nine of Wands': 'minor/wands/nine.jpg',
  'Ten of Wands': 'minor/wands/ten.jpg',
  'Page of Wands': 'minor/wands/page.jpg',
  'Knight of Wands': 'minor/wands/knight.jpg',
  'Queen of Wands': 'minor/wands/queen.jpg',
  'King of Wands': 'minor/wands/king.jpg',
  
  // Minor Arcana - Cups
  'Ace of Cups': 'minor/cups/ace.jpg',
  'Two of Cups': 'minor/cups/two.jpg',
  'Three of Cups': 'minor/cups/three.jpg',
  'Four of Cups': 'minor/cups/four.jpg',
  'Five of Cups': 'minor/cups/five.jpg',
  'Six of Cups': 'minor/cups/six.jpg',
  'Seven of Cups': 'minor/cups/seven.jpg',
  'Eight of Cups': 'minor/cups/eight.jpg',
  'Nine of Cups': 'minor/cups/nine.jpg',
  'Ten of Cups': 'minor/cups/ten.jpg',
  'Page of Cups': 'minor/cups/page.jpg',
  'Knight of Cups': 'minor/cups/knight.jpg',
  'Queen of Cups': 'minor/cups/queen.jpg',
  'King of Cups': 'minor/cups/king.jpg',
  
  // Minor Arcana - Swords
  'Ace of Swords': 'minor/swords/ace.jpg',
  'Two of Swords': 'minor/swords/two.jpg',
  'Three of Swords': 'minor/swords/three.jpg',
  'Four of Swords': 'minor/swords/four.jpg',
  'Five of Swords': 'minor/swords/five.jpg',
  'Six of Swords': 'minor/swords/six.jpg',
  'Seven of Swords': 'minor/swords/seven.jpg',
  'Eight of Swords': 'minor/swords/eight.jpg',
  'Nine of Swords': 'minor/swords/nine.jpg',
  'Ten of Swords': 'minor/swords/ten.jpg',
  'Page of Swords': 'minor/swords/page.jpg',
  'Knight of Swords': 'minor/swords/knight.jpg',
  'Queen of Swords': 'minor/swords/queen.jpg',
  'King of Swords': 'minor/swords/king.jpg',
  
  // Minor Arcana - Pentacles
  'Ace of Pentacles': 'minor/pentacles/ace.jpg',
  'Two of Pentacles': 'minor/pentacles/two.jpg',
  'Three of Pentacles': 'minor/pentacles/three.jpg',
  'Four of Pentacles': 'minor/pentacles/four.jpg',
  'Five of Pentacles': 'minor/pentacles/five.jpg',
  'Six of Pentacles': 'minor/pentacles/six.jpg',
  'Seven of Pentacles': 'minor/pentacles/seven.jpg',
  'Eight of Pentacles': 'minor/pentacles/eight.jpg',
  'Nine of Pentacles': 'minor/pentacles/nine.jpg',
  'Ten of Pentacles': 'minor/pentacles/ten.jpg',
  'Page of Pentacles': 'minor/pentacles/page.jpg',
  'Knight of Pentacles': 'minor/pentacles/knight.jpg',
  'Queen of Pentacles': 'minor/pentacles/queen.jpg',
  'King of Pentacles': 'minor/pentacles/king.jpg'
};

/**
 * Get card image URL
 * @param {string} cardName - Name of the card
 * @returns {string} Image URL or null if not found
 */
export function getCardImageUrl(cardName) {
  const imagePath = CARD_IMAGE_MAP[cardName];
  if (!imagePath) {
    return null;
  }
  
  // Check if the image file exists
  const fullPath = join(imagesPath, imagePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  // Return the local URL
  return `http://localhost:${PORT}/images/${imagePath}`;
}

/**
 * Start the image server
 */
export function startImageServer() {
  app.listen(PORT, () => {
    console.log(`🖼️  Image server running on port ${PORT}`);
    console.log(`📁 Serving images from: ${imagesPath}`);
  });
}

/**
 * Check if image server is available
 * @returns {boolean} True if server is running
 */
export function isImageServerAvailable() {
  // For now, return false since we don't have actual images
  // This can be enhanced to actually check the server status
  return false;
}

export default {
  getCardImageUrl,
  startImageServer,
  isImageServerAvailable
};
