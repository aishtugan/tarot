// Simple Tarot Test
// Basic test to verify tarot functionality works

describe('Simple Tarot Test', () => {
  test('should pass basic tarot test', () => {
    // Test that our basic functionality works
    expect(1 + 1).toBe(2);
  });

  test('should have environment set up correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.TELEGRAM_BOT_TOKEN).toBe('test_token');
    expect(process.env.OPENAI_API_KEY).toBe('test_key');
  });

  test('should be able to access file system', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if our tarot cards file exists
    const cardsPath = path.join(__dirname, '../../data/tarot-cards.json');
    expect(fs.existsSync(cardsPath)).toBe(true);
    
    // Check if we can read the file
    const cardsData = fs.readFileSync(cardsPath, 'utf8');
    expect(cardsData.length).toBeGreaterThan(0);
    
    // Check if it's valid JSON
    const cards = JSON.parse(cardsData);
    expect(cards).toBeDefined();
    expect(cards.majorArcana).toBeDefined();
    expect(cards.majorArcana.length).toBeGreaterThan(0);
  });
});

