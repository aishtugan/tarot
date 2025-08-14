// Integration tests for bot functionality
import { TarotReader } from '../../src/tarot/reader.js';
import { registerUser, getUser, incrementReadingCount } from '../../src/database/users.js';
import { initDatabase, closeDatabase } from '../../src/database/init.js';

describe('Bot Integration Tests', () => {
  let tarotReader;

  beforeAll(async () => {
    // Initialize database for testing
    initDatabase();
    tarotReader = new TarotReader();
  });

  afterAll(async () => {
    // Clean up database
    closeDatabase();
  });

  describe('Complete Reading Flow', () => {
    test('should perform complete daily reading flow', async () => {
      // Simulate user interaction
      const userData = {
        id: 12345,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      };

      // Register user
      const user = registerUser(userData);
      expect(user).toBeDefined();
      expect(user.telegram_id).toBe(12345);

      // Perform reading
      const reading = await tarotReader.performDailyReading();
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Single Card');
      expect(reading.context).toBe('daily');

      // Format reading for display
      const formattedReading = tarotReader.formatReadingForDisplay(reading);
      expect(formattedReading).toBeDefined();
      expect(typeof formattedReading).toBe('string');
      expect(formattedReading.length).toBeGreaterThan(0);

      // Check message length (should fit in Telegram)
      expect(formattedReading.length).toBeLessThan(4096);

      // Increment reading count
      incrementReadingCount(12345);

      // Verify user stats updated
      const updatedUser = getUser(12345);
      expect(updatedUser.total_readings).toBeGreaterThan(0);
    });

    test('should perform complete love reading flow', async () => {
      const reading = await tarotReader.performLoveReading('Will I find love?');
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Love Spread');
      expect(reading.context).toBe('love');
      expect(reading.userQuestion).toBe('Will I find love?');

      const formattedReading = tarotReader.formatReadingForDisplay(reading);
      expect(formattedReading).toBeDefined();
      expect(formattedReading.length).toBeLessThan(4096);
    });

    test('should perform complete career reading flow', async () => {
      const reading = await tarotReader.performCareerReading('Should I change jobs?');
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Career Spread');
      expect(reading.context).toBe('career');
      expect(reading.userQuestion).toBe('Should I change jobs?');

      const formattedReading = tarotReader.formatReadingForDisplay(reading);
      expect(formattedReading).toBeDefined();
      expect(formattedReading.length).toBeLessThan(4096);
    });

    test('should perform complete general reading flow', async () => {
      const question = 'What does my future hold?';
      const reading = await tarotReader.performGeneralReading(question);
      expect(reading).toBeDefined();
      expect(reading.spreadName).toBe('Three Card Spread');
      expect(reading.context).toBe('general');
      expect(reading.userQuestion).toBe(question);

      const formattedReading = tarotReader.formatReadingForDisplay(reading);
      expect(formattedReading).toBeDefined();
      expect(formattedReading.length).toBeLessThan(4096);
    });
  });

  describe('Reading History Integration', () => {
    test('should maintain reading history across multiple readings', async () => {
      const initialHistoryLength = tarotReader.getReadingHistory().length;

      // Perform multiple readings
      await tarotReader.performDailyReading();
      await tarotReader.performLoveReading();
      await tarotReader.performCareerReading();
      await tarotReader.performQuickReading();

      const history = tarotReader.getReadingHistory();
      expect(history.length).toBe(initialHistoryLength + 4);

      // Verify different reading types are stored
      const readingTypes = history.map(reading => reading.context || reading.readingType);
      expect(readingTypes).toContain('daily');
      expect(readingTypes).toContain('love');
      expect(readingTypes).toContain('career');
    });

    test('should calculate statistics correctly from history', async () => {
      // Clear history first
      tarotReader.clearReadingHistory();

      // Perform readings
      await tarotReader.performDailyReading();
      await tarotReader.performLoveReading();
      await tarotReader.performCareerReading();

      const stats = tarotReader.getReadingStats();
      expect(stats.totalReadings).toBe(3);
      expect(stats.readingTypes.daily).toBe(1);
      expect(stats.readingTypes.love).toBe(1);
      expect(stats.readingTypes.career).toBe(1);
      expect(stats.averageCardsPerReading).toBeGreaterThan(0);
    });
  });

  describe('Message Formatting Integration', () => {
    test('should format all reading types correctly', async () => {
      const readingTypes = [
        { method: () => tarotReader.performDailyReading(), name: 'Daily' },
        { method: () => tarotReader.performLoveReading(), name: 'Love' },
        { method: () => tarotReader.performCareerReading(), name: 'Career' },
        { method: () => tarotReader.performQuickReading(), name: 'Quick' }
      ];

      for (const readingType of readingTypes) {
        const reading = await readingType.method();
        const formatted = tarotReader.formatReadingForDisplay(reading);
        
        expect(formatted).toBeDefined();
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted.length).toBeLessThan(4096);
        
        // Check for basic formatting elements
        expect(formatted).toContain('🔮');
        expect(formatted).toContain(readingType.name);
      }
    });

    test('should handle AI-enhanced readings gracefully', async () => {
      const reading = await tarotReader.performDailyReading();
      
      // Simulate AI enhancement
      reading.aiEnhanced = true;
      reading.personalized = true;
      
      const formatted = tarotReader.formatReadingForDisplay(reading);
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeLessThan(4096);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle invalid reading types gracefully', async () => {
      try {
        await tarotReader.performReading('invalid', '', null, true);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('No valid spread found');
      }
    });

    test('should handle empty user questions gracefully', async () => {
      const reading = await tarotReader.performGeneralReading('');
      expect(reading).toBeDefined();
      expect(reading.userQuestion).toBe('');
    });

    test('should handle very long user questions gracefully', async () => {
      const longQuestion = 'A'.repeat(1000);
      const reading = await tarotReader.performGeneralReading(longQuestion);
      expect(reading).toBeDefined();
      expect(reading.userQuestion).toBe(longQuestion);
    });
  });

  describe('Performance Integration', () => {
    test('should perform multiple readings quickly', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(tarotReader.performQuickReading());
      }
      
      const readings = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(readings.length).toBe(5);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should handle concurrent user requests', async () => {
      const userRequests = [
        { userId: 1, question: 'Daily guidance' },
        { userId: 2, question: 'Love advice' },
        { userId: 3, question: 'Career path' }
      ];

      const promises = userRequests.map(async (request) => {
        // Simulate user registration
        registerUser({
          id: request.userId,
          username: `user${request.userId}`,
          first_name: `User${request.userId}`
        });

        // Perform reading
        const reading = await tarotReader.performGeneralReading(request.question);
        return { userId: request.userId, reading };
      });

      const results = await Promise.all(promises);
      expect(results.length).toBe(3);
      
      results.forEach(result => {
        expect(result.reading).toBeDefined();
        expect(result.reading.userQuestion).toBeDefined();
      });
    });
  });
});

