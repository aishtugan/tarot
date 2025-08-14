// Simple test using CommonJS syntax
const { describe, test, expect } = require('@jest/globals');

describe('Simple Tarot Bot Tests', () => {
  test('should have environment variables set', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.TELEGRAM_BOT_TOKEN).toBeDefined();
    expect(process.env.OPENAI_MODEL).toBeDefined();
  });

  test('should be able to require modules', () => {
    // Test that we can require our modules
    const fs = require('fs');
    const path = require('path');
    
    // Check if our source files exist
    const cardsPath = path.join(__dirname, '../../src/tarot/cards.js');
    const spreadsPath = path.join(__dirname, '../../src/tarot/spreads.js');
    const readerPath = path.join(__dirname, '../../src/tarot/reader.js');
    
    expect(fs.existsSync(cardsPath)).toBe(true);
    expect(fs.existsSync(spreadsPath)).toBe(true);
    expect(fs.existsSync(readerPath)).toBe(true);
  });

  test('should have proper project structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const srcPath = path.join(__dirname, '../../src');
    const tarotPath = path.join(srcPath, 'tarot');
    const databasePath = path.join(srcPath, 'database');
    const utilsPath = path.join(srcPath, 'utils');
    
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.existsSync(tarotPath)).toBe(true);
    expect(fs.existsSync(databasePath)).toBe(true);
    expect(fs.existsSync(utilsPath)).toBe(true);
  });

  test('should have required dependencies', () => {
    const packageJson = require('../../package.json');
    
    expect(packageJson.dependencies).toBeDefined();
    expect(packageJson.dependencies['node-telegram-bot-api']).toBeDefined();
    expect(packageJson.dependencies.openai).toBeDefined();
    expect(packageJson.dependencies['better-sqlite3']).toBeDefined();
  });
});
