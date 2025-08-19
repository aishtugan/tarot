// Unit tests for tarot cards module
import { 
  loadTarotCards, 
  getAllCards, 
  getRandomCard, 
  getRandomCards, 
  getCardMeaning,
  getCardKeywords,
  isMajorArcana,
  getCardElement
} from '../../src/tarot/cards.js';

describe('Tarot Cards Module', () => {
  beforeAll(() => {
    // Load cards before running tests
    loadTarotCards();
  });

  describe('Card Loading', () => {
    test('should load all tarot cards successfully', () => {
      const cards = getAllCards();
      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('should have correct number of Major Arcana cards', () => {
      const cards = getAllCards();
      const majorArcana = cards.filter(card => isMajorArcana(card));
      expect(majorArcana.length).toBe(22);
    });

    test('should have cards from all four suits', () => {
      const cards = getAllCards();
      const suits = [...new Set(cards.map(card => card.suit))];
      expect(suits).toContain('Wands');
      expect(suits).toContain('Cups');
      expect(suits).toContain('Swords');
      expect(suits).toContain('Pentacles');
    });
  });

  describe('Card Selection', () => {
    test('should return a random card', () => {
      const card = getRandomCard();
      expect(card).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.suit).toBeDefined();
    });

    test('should return multiple random cards', () => {
      const cards = getRandomCards(3);
      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(3);
      cards.forEach(card => {
        expect(card.name).toBeDefined();
        expect(card.suit).toBeDefined();
      });
    });

    test('should return cards without duplicates when specified', () => {
      const cards = getRandomCards(5, 'all', false);
      const cardNames = cards.map(card => card.name);
      const uniqueNames = [...new Set(cardNames)];
      expect(uniqueNames.length).toBe(5);
    });
  });

  describe('Card Information', () => {
    test('should get card meaning for different contexts', () => {
      const card = getRandomCard();
      const generalMeaning = getCardMeaning(card, 'general', false);
      const loveMeaning = getCardMeaning(card, 'love', false);
      const careerMeaning = getCardMeaning(card, 'career', false);

      expect(generalMeaning).toBeDefined();
      expect(loveMeaning).toBeDefined();
      expect(careerMeaning).toBeDefined();
      expect(typeof generalMeaning).toBe('string');
    });

    test('should get card keywords', () => {
      const card = getRandomCard();
      const keywords = getCardKeywords(card);
      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
    });

    test('should correctly identify Major Arcana', () => {
      const cards = getAllCards();
      const majorArcana = cards.filter(card => isMajorArcana(card));
      const minorArcana = cards.filter(card => !isMajorArcana(card));

      majorArcana.forEach(card => {
        expect(isMajorArcana(card)).toBe(true);
      });

      minorArcana.forEach(card => {
        expect(isMajorArcana(card)).toBe(false);
      });
    });

    test('should get correct card elements', () => {
      const cards = getAllCards();
      cards.forEach(card => {
        const element = getCardElement(card);
        expect(element).toBeDefined();
        expect(['Fire', 'Water', 'Air', 'Earth']).toContain(element);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid card count gracefully', () => {
      expect(() => getRandomCards(-1)).toThrow();
      expect(() => getRandomCards(0)).toThrow();
    });

    test('should handle invalid card type gracefully', () => {
      expect(() => getRandomCards(1, 'invalid')).toThrow();
    });
  });
});



