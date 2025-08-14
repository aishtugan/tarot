// Basic test to verify testing setup
describe('Basic Test Suite', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have environment variables set', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.TELEGRAM_BOT_TOKEN).toBe('test_token');
    expect(process.env.OPENAI_API_KEY).toBe('test_key');
  });
});

