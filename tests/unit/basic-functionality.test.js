// Basic functionality tests
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Basic Tarot Bot Functionality', () => {
  test('should have basic environment setup', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.TELEGRAM_BOT_TOKEN).toBeDefined();
    expect(process.env.OPENAI_MODEL).toBeDefined();
  });

  test('should be able to import modules', async () => {
    // Test that we can import our modules
    const { TarotReader } = await import('../../src/tarot/reader.js');
    expect(TarotReader).toBeDefined();
    
    const { getRandomCard } = await import('../../src/tarot/cards.js');
    expect(getRandomCard).toBeDefined();
    
    const { getSpread } = await import('../../src/tarot/spreads.js');
    expect(getSpread).toBeDefined();
  });

  test('should be able to create tarot reader instance', async () => {
    const { TarotReader } = await import('../../src/tarot/reader.js');
    const reader = new TarotReader();
    expect(reader).toBeDefined();
    expect(typeof reader.performDailyReading).toBe('function');
  });

  test('should be able to get random card', async () => {
    const { getRandomCard } = await import('../../src/tarot/cards.js');
    const card = getRandomCard();
    expect(card).toBeDefined();
    expect(card.name).toBeDefined();
    expect(card.suit).toBeDefined();
  });

  test('should be able to get spread information', async () => {
    const { getSpread } = await import('../../src/tarot/spreads.js');
    const spread = getSpread('single');
    expect(spread).toBeDefined();
    expect(spread.name).toBe('Single Card');
    expect(spread.cardCount).toBe(1);
  });

  test('should be able to initialize database', async () => {
    const { initDatabase, closeDatabase } = await import('../../src/database/init.js');
    expect(initDatabase).toBeDefined();
    expect(closeDatabase).toBeDefined();
  });
});



