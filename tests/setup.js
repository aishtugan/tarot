// Test setup file

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.TELEGRAM_BOT_TOKEN = 'test-telegram-token';
process.env.OPENAI_MODEL = 'gpt-4o-mini';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);

// Mock OpenAI client for testing
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mocked AI response for testing purposes.'
            }
          }]
        })
      }
    }
  }))
}));

// Mock Telegram bot for testing
jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    sendMessage: jest.fn().mockResolvedValue({}),
    sendChatAction: jest.fn().mockResolvedValue({}),
    stopPolling: jest.fn(),
    isPolling: jest.fn().mockReturnValue(false)
  }));
});

// Mock better-sqlite3 for testing
jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockReturnValue({
      run: jest.fn().mockReturnValue({}),
      get: jest.fn().mockReturnValue({}),
      all: jest.fn().mockReturnValue([])
    }),
    exec: jest.fn(),
    close: jest.fn()
  }));
});
