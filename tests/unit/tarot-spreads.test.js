// Unit tests for tarot spreads module
import { 
  getSpread, 
  getAllSpreads, 
  getSpreadNames, 
  isValidSpread,
  getSpreadCardCount,
  getPositionInfo,
  getDefaultSpread,
  getRecommendedSpreads
} from '../../src/tarot/spreads.js';

describe('Tarot Spreads Module', () => {
  describe('Spread Management', () => {
    test('should get all available spreads', () => {
      const spreads = getAllSpreads();
      expect(spreads).toBeDefined();
      expect(typeof spreads).toBe('object');
      expect(Object.keys(spreads).length).toBeGreaterThan(0);
    });

    test('should get spread names as array', () => {
      const spreadNames = getSpreadNames();
      expect(spreadNames).toBeDefined();
      expect(Array.isArray(spreadNames)).toBe(true);
      expect(spreadNames.length).toBeGreaterThan(0);
    });

    test('should validate spread names correctly', () => {
      expect(isValidSpread('single')).toBe(true);
      expect(isValidSpread('threeCard')).toBe(true);
      expect(isValidSpread('love')).toBe(true);
      expect(isValidSpread('invalid')).toBe(false);
      expect(isValidSpread('')).toBe(false);
    });
  });

  describe('Spread Information', () => {
    test('should get specific spread by name', () => {
      const singleSpread = getSpread('single');
      const threeCardSpread = getSpread('threeCard');
      const loveSpread = getSpread('love');

      expect(singleSpread).toBeDefined();
      expect(threeCardSpread).toBeDefined();
      expect(loveSpread).toBeDefined();

      expect(singleSpread.name).toBe('Single Card');
      expect(threeCardSpread.name).toBe('Three Card Spread');
      expect(loveSpread.name).toBe('Love Spread');
    });

    test('should get correct card counts for spreads', () => {
      expect(getSpreadCardCount('single')).toBe(1);
      expect(getSpreadCardCount('threeCard')).toBe(3);
      expect(getSpreadCardCount('love')).toBe(5);
      expect(getSpreadCardCount('celticCross')).toBe(10);
    });

    test('should get position information', () => {
      const position1 = getPositionInfo('threeCard', 1);
      const position2 = getPositionInfo('threeCard', 2);
      const position3 = getPositionInfo('threeCard', 3);

      expect(position1).toBeDefined();
      expect(position2).toBeDefined();
      expect(position3).toBeDefined();

      expect(position1.name).toBe('Past');
      expect(position2.name).toBe('Present');
      expect(position3.name).toBe('Future');
    });

    test('should return null for invalid position', () => {
      const invalidPosition = getPositionInfo('threeCard', 99);
      expect(invalidPosition).toBeNull();
    });
  });

  describe('Default Spreads', () => {
    test('should get correct default spreads for reading types', () => {
      expect(getDefaultSpread('daily')).toBe('single');
      expect(getDefaultSpread('love')).toBe('love');
      expect(getDefaultSpread('career')).toBe('career');
      expect(getDefaultSpread('general')).toBe('threeCard');
      expect(getDefaultSpread('decision')).toBe('decision');
    });

    test('should fallback to threeCard for unknown reading types', () => {
      expect(getDefaultSpread('unknown')).toBe('threeCard');
    });
  });

  describe('Recommended Spreads', () => {
    test('should get recommended spreads for reading types', () => {
      const dailyRecommendations = getRecommendedSpreads('daily');
      const loveRecommendations = getRecommendedSpreads('love');
      const careerRecommendations = getRecommendedSpreads('career');

      expect(Array.isArray(dailyRecommendations)).toBe(true);
      expect(Array.isArray(loveRecommendations)).toBe(true);
      expect(Array.isArray(careerRecommendations)).toBe(true);

      expect(dailyRecommendations).toContain('single');
      expect(loveRecommendations).toContain('love');
      expect(careerRecommendations).toContain('career');
    });

    test('should fallback to threeCard for unknown reading types', () => {
      const unknownRecommendations = getRecommendedSpreads('unknown');
      expect(unknownRecommendations).toEqual(['threeCard']);
    });
  });

  describe('Spread Structure', () => {
    test('should have correct structure for all spreads', () => {
      const spreads = getAllSpreads();
      
      Object.values(spreads).forEach(spread => {
        expect(spread).toHaveProperty('name');
        expect(spread).toHaveProperty('description');
        expect(spread).toHaveProperty('cardCount');
        expect(spread).toHaveProperty('positions');
        
        expect(typeof spread.name).toBe('string');
        expect(typeof spread.description).toBe('string');
        expect(typeof spread.cardCount).toBe('number');
        expect(Array.isArray(spread.positions)).toBe(true);
        
        expect(spread.cardCount).toBeGreaterThan(0);
        expect(spread.positions.length).toBe(spread.cardCount);
      });
    });

    test('should have valid position structure', () => {
      const spreads = getAllSpreads();
      
      Object.values(spreads).forEach(spread => {
        spread.positions.forEach((position, index) => {
          expect(position).toHaveProperty('position');
          expect(position).toHaveProperty('name');
          expect(position).toHaveProperty('description');
          expect(position).toHaveProperty('meaning');
          
          expect(position.position).toBe(index + 1);
          expect(typeof position.name).toBe('string');
          expect(typeof position.description).toBe('string');
          expect(typeof position.meaning).toBe('string');
        });
      });
    });
  });
});




