#!/usr/bin/env node

// Debug configuration
process.env.NODE_ENV = 'development';
process.env.LOG_LEVEL = 'DEBUG';
process.env.LOG_TO_CONSOLE = 'true';
process.env.LOG_TO_FILE = 'true';

// Enable more verbose logging
process.env.DEBUG = '*';

console.log('🐛 Starting Tarot Bot in DEBUG mode...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔍 Log Level:', process.env.LOG_LEVEL);
console.log('📝 Logging to console and file');

// Import and start the bot
import('./src/index.js').catch(error => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});
