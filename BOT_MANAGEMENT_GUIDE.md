# 🤖 Tarot Telegram Bot - Management Guide

## 🚀 Quick Start

### **1. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your credentials
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_key_here
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start the Bot**

#### **Development Mode (with auto-restart)**
```bash
npm run dev
```

#### **Production Mode (with comprehensive logging)**
```bash
npm run start:prod
```

#### **Debug Mode (verbose logging)**
```bash
npm run debug
```

## 🔧 Bot Management Commands

### **Start/Stop Commands**
```bash
# Start in development
npm start

# Start with PM2 (production)
pm2 start ecosystem.config.js

# Stop PM2 process
pm2 stop tarot-bot

# Restart PM2 process
pm2 restart tarot-bot

# View PM2 logs
pm2 logs tarot-bot
```

### **Logging Commands**
```bash
# Analyze logs
npm run logs:analyze

# Clean old logs
npm run logs:clean

# Search logs
npm run logs:search

# Export logs
npm run logs:export
```

## 📊 Monitoring & Health Checks

### **1. Bot Status Command**
Users can check bot health with:
```
/status
```

**Shows:**
- 🔌 Connection status (Connected/Disconnected)
- 🕐 Last ping time
- 🔄 Reconnection attempts
- ✅ Health indicator

### **2. Log Analysis**
```bash
# Get summary of recent activity
npm run logs:analyze

# Check for errors
npm run logs:search -- --level=ERROR

# Monitor performance
npm run logs:search -- --type=performance
```

### **3. Database Health**
```bash
# Check database integrity
node -e "const { initDatabase } = require('./src/database/init.js'); initDatabase();"
```

## 🛡️ Connection Resilience Features

### **Automatic Recovery**
The bot now automatically handles:
- ✅ **ECONNRESET errors** - Automatic reconnection
- ✅ **Network timeouts** - Retry with exponential backoff
- ✅ **Server overload** - Graceful degradation
- ✅ **Connection drops** - Seamless recovery

### **Health Monitoring**
- **30-second health checks** using `bot.getMe()`
- **Automatic reconnection** with 5-second delays
- **Max 5 reconnection attempts** before manual intervention
- **Real-time status tracking** via `/status` command

### **Error Handling**
```javascript
// Polling error recovery
bot.on('polling_error', (error) => {
  if (error.code === 'EFATAL' || error.message.includes('ECONNRESET')) {
    bot.stopPolling();
    setTimeout(() => bot.startPolling(), 5000);
  }
});
```

## 📈 Performance Monitoring

### **Key Metrics to Watch**
1. **Connection Status**: Use `/status` command
2. **Response Times**: Check logs for reading durations
3. **Error Rates**: Monitor ERROR level logs
4. **User Activity**: Track user interactions

### **Log Levels**
- **ERROR**: Critical issues requiring attention
- **WARN**: Connection issues, reconnection attempts
- **INFO**: Normal operations, user actions
- **DEBUG**: Detailed debugging information

## 🔄 Troubleshooting

### **Common Issues & Solutions**

#### **1. ECONNRESET Error**
```
error: [polling_error] {"code":"EFATAL","message":"EFATAL: Error: read ECONNRESET"}
```
**Solution**: Bot automatically recovers. Check `/status` for connection health.

#### **2. Bot Not Responding**
```bash
# Check if bot is running
pm2 status

# Restart if needed
pm2 restart tarot-bot

# Check logs for errors
pm2 logs tarot-bot --lines 50
```

#### **3. Database Issues**
```bash
# Reinitialize database
rm data/tarot_bot.db
npm start
```

#### **4. OpenAI API Issues**
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API connection
node -e "const { askGpt } = require('./src/gpt.js'); askGpt('test').then(console.log).catch(console.error)"
```

## 🚀 Production Deployment

### **Using PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### **Using Docker**
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Environment Variables for Production**
```bash
# Required
TELEGRAM_BOT_TOKEN=your_bot_token
OPENAI_API_KEY=your_openai_key

# Optional (with defaults)
NODE_ENV=production
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_TO_CONSOLE=true
PORT=3000
```

## 🤖 AI Question Validation

The bot now includes intelligent question validation to ensure users ask tarot-related questions.

### **How It Works**
- **AI Analysis**: Uses OpenAI API to determine if input is a tarot question
- **Smart Filtering**: Only tarot-related questions proceed to readings
- **Polite Guidance**: Non-tarot input receives helpful responses
- **Multilingual**: Works in English, Russian, and Spanish

### **Valid Tarot Questions**
✅ "Should I take this job offer?"
✅ "What does my future hold?"
✅ "Will I find love this year?"
✅ "How can I improve my relationship?"

### **Invalid Input Examples**
❌ "Hello" or "Hi" (greetings)
❌ "Thanks" or "Thank you" (gratitude)
❌ "How are you?" (general conversation)
❌ "What's the weather?" (non-personal topics)

### **Example Response**
For invalid input, users receive:
```
🔮 I'm a tarot reading bot! Please ask me a personal question about your life, relationships, career, or any situation you'd like guidance on. For example: 'Should I take this job?' or 'What does my future hold?'
```

### **Fallback Behavior**
- If OpenAI API is unavailable, the bot allows all questions
- Graceful error handling ensures the bot always responds
- Logging tracks all validation attempts for monitoring

## 📱 Bot Commands Reference

### **User Commands**
- `/start` - Welcome message and setup
- `/help` - Show available commands
- `/language` - Change bot language
- `/daily` - Daily tarot reading
- `/love` - Love relationship reading
- `/career` - Career guidance reading
- `/quick` - Quick 3-card reading
- `/fulldeck` - Full deck reading
- `/profile` - Manage user profile
- `/reversals` - Toggle card reversals
- `/stats` - View reading statistics
- `/status` - Check bot connection health

### **Admin Commands**
- `/logs` - View recent logs (if implemented)
- `/restart` - Restart bot (if implemented)

## 🔍 Debugging Tips

### **1. Enable Debug Logging**
```bash
LOG_LEVEL=DEBUG npm start
```

### **2. Monitor Real-time Logs**
```bash
# Follow logs in real-time
tail -f logs/bot.log

# Filter for specific user
grep "userId:123456789" logs/bot.log
```

### **3. Test Individual Components**
```bash
# Test tarot functionality
node -e "const { tarotReader } = require('./src/tarot/reader.js'); tarotReader.performQuickReading().then(console.log)"

# Test database
node -e "const { getUserStats } = require('./src/database/users.js'); console.log(getUserStats(123456789))"
```

## 📊 Analytics & Insights

### **Reading Statistics**
- Total readings per user
- Favorite reading types
- AI enhancement usage
- Average response times

### **User Engagement**
- Active users per day/week
- Command usage patterns
- Language preferences
- Profile completion rates

## 🔐 Security Considerations

### **Environment Variables**
- Never commit `.env` files
- Use strong, unique tokens
- Rotate API keys regularly
- Monitor for unauthorized access

### **Rate Limiting**
- Respect Telegram API limits
- Implement user rate limiting
- Monitor for abuse patterns

## 📞 Support & Maintenance

### **Regular Maintenance Tasks**
1. **Daily**: Check `/status` command
2. **Weekly**: Review error logs
3. **Monthly**: Update dependencies
4. **Quarterly**: Review performance metrics

### **Emergency Procedures**
1. **Bot Down**: Restart with `pm2 restart tarot-bot`
2. **Database Issues**: Reinitialize database
3. **API Issues**: Check API keys and quotas
4. **Network Issues**: Monitor connection health

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Start Bot | `npm start` |
| Start Production | `npm run start:prod` |
| View Status | `/status` (in bot) |
| Check Logs | `npm run logs:analyze` |
| Restart Bot | `pm2 restart tarot-bot` |
| Monitor Health | `pm2 logs tarot-bot` |

**Remember**: The bot now automatically recovers from most connection issues. Use `/status` to check health and logs for detailed monitoring! 🚀

## Recent Updates

### Latest Features
- **AI Question Validation** - Intelligent filtering ensures tarot-related questions
- **Connection Health Monitoring** - Automatic detection and recovery from network issues
- **Bot Status Command** - `/status` command provides real-time connection health
- **Multilingual Validation** - Question validation in English, Russian, and Spanish
- **Intelligent User Guidance** - Polite responses guide users to proper tarot questions
- **Production Logging** - Comprehensive logging system with rotation and analysis
- **Minor Arcana Translations** - Complete 56-card translations for Russian and Spanish

### Previous Milestones
- **Card Reversals System** - Toggle between upright and reversed interpretations
- **Full Deck Reading** - Simplified `/fulldeck` command for comprehensive readings
- **User Profile System** - Streamlined 3-field profile for better personalization
- **Multi-language Support** - Complete interface translations
- **AI-Enhanced Interpretations** - Personalized readings using OpenAI GPT
- **Visual Card Display** - Beautiful card images and Unicode representations
- **Reading Statistics** - Comprehensive tracking and analytics
