// Unit tests for tarot reader module
import { TarotReader } from '../../src/tarot/reader.js';

describe('Tarot Reader Module', () => {
  let tarotReader;

  beforeEach(() => {
    tarotReader = new TarotReader();
  });

  describe('Reading Performance', () => {
    test('should perform daily reading successfully', async () => {
      const reading = await tarotReader.performDailyReading();
      
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Single Card');
      expect(reading.context).toBe('daily');
      expect(reading.cards).toBeDefined();
      expect(Array.isArray(reading.cards)).toBe(true);
      expect(reading.cards.length).toBe(1);
      expect(reading.narrative).toBeDefined();
      expect(reading.summary).toBeDefined();
      expect(reading.advice).toBeDefined();
      expect(reading.timestamp).toBeDefined();
    });

    test('should perform love reading successfully', async () => {
      const reading = await tarotReader.performLoveReading();
      
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Love Spread');
      expect(reading.context).toBe('love');
      expect(reading.cards).toBeDefined();
      expect(Array.isArray(reading.cards)).toBe(true);
      expect(reading.cards.length).toBe(5);
    });

    test('should perform career reading successfully', async () => {
      const reading = await tarotReader.performCareerReading();
      
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Career Spread');
      expect(reading.context).toBe('career');
      expect(reading.cards).toBeDefined();
      expect(Array.isArray(reading.cards)).toBe(true);
      expect(reading.cards.length).toBe(5);
    });

    test('should perform general reading successfully', async () => {
      const reading = await tarotReader.performGeneralReading('What does my future hold?');
      
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Three Card Spread');
      expect(reading.context).toBe('general');
      expect(reading.userQuestion).toBe('What does my future hold?');
      expect(reading.cards).toBeDefined();
      expect(Array.isArray(reading.cards)).toBe(true);
      expect(reading.cards.length).toBe(3);
    });

    test('should perform quick reading successfully', async () => {
      const reading = await tarotReader.performQuickReading('general', 'Quick question');
      
      expect(reading).toBeDefined();
      expect(reading.type).toBe('quick');
      expect(reading.readingType).toBe('general');
      expect(reading.userQuestion).toBe('Quick question');
      expect(reading.card).toBeDefined();
      expect(reading.interpretation).toBeDefined();
      expect(reading.timestamp).toBeDefined();
    });
  });

  describe('Reading History', () => {
    test('should store readings in history', async () => {
      const initialHistoryLength = tarotReader.getReadingHistory().length;
      
      await tarotReader.performDailyReading();
      await tarotReader.performLoveReading();
      
      const history = tarotReader.getReadingHistory();
      expect(history.length).toBe(initialHistoryLength + 2);
    });

    test('should get reading from history', async () => {
      await tarotReader.performDailyReading();
      
      const history = tarotReader.getReadingHistory();
      const firstReading = tarotReader.getReadingFromHistory(0);
      
      expect(firstReading).toBeDefined();
      expect(firstReading).toEqual(history[0]);
    });

    test('should return null for invalid history index', () => {
      const invalidReading = tarotReader.getReadingFromHistory(999);
      expect(invalidReading).toBeNull();
    });

    test('should clear reading history', async () => {
      await tarotReader.performDailyReading();
      expect(tarotReader.getReadingHistory().length).toBeGreaterThan(0);
      
      tarotReader.clearReadingHistory();
      expect(tarotReader.getReadingHistory().length).toBe(0);
    });
  });

  describe('Reading Statistics', () => {
    test('should calculate reading statistics correctly', async () => {
      await tarotReader.performDailyReading();
      await tarotReader.performLoveReading();
      await tarotReader.performCareerReading();
      
      const stats = tarotReader.getReadingStats();
      
      expect(stats.totalReadings).toBe(3);
      expect(stats.readingTypes).toBeDefined();
      expect(stats.spreadTypes).toBeDefined();
      expect(stats.averageCardsPerReading).toBeGreaterThan(0);
    });

    test('should handle empty history statistics', () => {
      const stats = tarotReader.getReadingStats();
      
      expect(stats.totalReadings).toBe(0);
      expect(stats.averageCardsPerReading).toBe(0);
    });
  });

  describe('Card Selection', () => {
    test('should select correct number of cards', () => {
      const cards = tarotReader.selectCards(3, 'general', true);
      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(3);
    });

    test('should determine reversed cards', () => {
      const reversedCards = tarotReader.determineReversedCards(5);
      expect(Array.isArray(reversedCards)).toBe(true);
      expect(reversedCards.length).toBeLessThanOrEqual(5);
      
      reversedCards.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(5);
      });
    });
  });

  describe('Spread Determination', () => {
    test('should determine correct spreads for reading types', () => {
      const dailySpread = tarotReader.determineSpread('daily');
      const loveSpread = tarotReader.determineSpread('love');
      const careerSpread = tarotReader.determineSpread('career');
      
      expect(dailySpread.name).toBe('Single Card');
      expect(loveSpread.name).toBe('Love Spread');
      expect(careerSpread.name).toBe('Career Spread');
    });

    test('should use specified spread when provided', () => {
      const spread = tarotReader.determineSpread('general', 'single');
      expect(spread.name).toBe('Single Card');
    });

    test('should throw error for invalid reading type', () => {
      expect(() => tarotReader.determineSpread('invalid')).toThrow();
    });
  });

  describe('Reading Formatting', () => {
    test('should format quick reading correctly', async () => {
      const reading = await tarotReader.performQuickReading();
      const formatted = tarotReader.formatReadingForDisplay(reading);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('should format full reading correctly', async () => {
      const reading = await tarotReader.performDailyReading();
      const formatted = tarotReader.formatReadingForDisplay(reading);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid spread names gracefully', () => {
      expect(() => tarotReader.determineSpread('general', 'invalid')).toThrow();
    });

    test('should handle invalid card counts gracefully', () => {
      expect(() => tarotReader.selectCards(-1, 'general')).toThrow();
      expect(() => tarotReader.selectCards(0, 'general')).toThrow();
    });
  });
});

