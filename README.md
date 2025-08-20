# 🔮 Tarot Telegram Bot

A sophisticated Telegram bot that provides personalized tarot readings using AI-powered interpretations and multi-language support.

## ✨ Features

### 🎴 **Tarot Readings**
- **Daily Reading** (`/daily`) - Daily guidance and insights
- **Love Reading** (`/love`) - Relationship and emotional guidance
- **Career Reading** (`/career`) - Professional and work-related advice
- **Quick Reading** (`/quick`) - 3-card reading for immediate guidance
- **General Reading** - Ask any question for personalized guidance
- **Full Deck Reading** - Comprehensive readings with multiple options

### 🔄 **Card Reversals**
- **Toggle Reversals** (`/reversals`) - Enable/disable reversed card interpretations
- **Smart Reversal Logic** - 30% chance of reversal when enabled
- **Enhanced Meanings** - Different interpretations for upright vs reversed cards
- **User Preferences** - Individual reversal settings saved per user

### 🤖 **AI-Powered Interpretations**
- **Question Validation** - AI determines if your input is a tarot question
- **Smart Filtering** - Polite responses for non-tarot questions
- **Personalized readings** based on your question and context
- **Advanced AI analysis** using OpenAI GPT
- **Contextual advice** and guidance
- **Multiple interpretation styles**

### 🌍 **Multi-Language Support**
- **English** (default)
- **Russian** (Русский)
- **Spanish** (Español)
- Complete translation of all bot features
- Automatic language detection

### 👤 **Personal Profile Survey**
- **Enhanced Personalization** - Get more accurate readings based on your profile
- **Multi-language Support** - Survey available in all supported languages
- **Optional Feature** - Complete at your own pace or skip entirely
- **Access via** `/profile` command

### 🎨 **Visual Enhancements**
- **Real Tarot Card Images** - Authentic Rider-Waite-Smith deck images
- **Enhanced Formatting** - Beautiful HTML-formatted messages
- **Card Galleries** - Multiple cards displayed elegantly
- **Interactive Elements** - Inline keyboards for better user experience

### 📊 **User Statistics**
- Track your reading history
- View personal statistics
- Monitor your tarot journey progress

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tarot-telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your credentials:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-3.5-turbo
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the bot**
   ```bash
   # Development mode
   npm start
   
   # Production mode with logging
   npm run start:prod
   ```

6. **Complete Your Profile** (Optional)
   - Use `/profile` command to set up your personal profile
   - This enhances reading accuracy and personalization
   - Available in all supported languages

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and bot introduction |
| `/daily` | Get your daily tarot reading |
| `/love` | Love and relationship guidance |
| `/career` | Career and professional advice |
| `/quick` | Quick 3-card reading |
| `/fulldeck` | Full deck reading (Majors + Minors) |
| `/reversals` | Toggle card reversals on/off |
| `/language` | Change bot language |
| `/stats` | View your reading statistics |
| `/status` | Check bot connection health |
| `/profile` | Complete personal profile survey |
| `/help` | Show available commands |

## 🎯 Reading Types

### **Daily Reading**
- Perfect for daily guidance and reflection
- Provides insights for the day ahead
- Includes practical advice and affirmations

### **Love Reading**
- Focuses on relationships and emotional matters
- Helps with love, romance, and interpersonal connections
- Provides guidance for relationship decisions

### **Career Reading**
- Professional development and work-related guidance
- Career transitions and opportunities
- Workplace relationships and challenges

### **Quick Reading**
- 3-card spread for immediate guidance
- Perfect for quick questions or daily insights
- Fast and focused interpretations

### **General Reading**
- **Smart Question Validation** - AI determines if your input is a tarot question
- **Intelligent Filtering** - Polite responses guide you to ask tarot-related questions
- **Ask any personal question** for guidance on life, relationships, career, decisions
- **AI-powered contextual interpretations**
- **Comprehensive advice and insights**
- **Multilingual validation** - Works in English, Russian, and Spanish

### **Full Deck Reading**
- Complete deck reading (Major + Minor Arcana)
- 3-card spread with comprehensive interpretation
- No selection menu - automatically uses full deck


## 🔄 Card Reversals

The bot supports card reversals for enhanced readings:

### **How It Works**
- **Toggle Command**: Use `/reversals` to enable/disable
- **Reversal Logic**: 30% chance of reversal when enabled
- **Enhanced Meanings**: Different interpretations for upright vs reversed
- **User Preferences**: Settings saved individually per user

### **Benefits**
- **Deeper Insights** - Reversed cards add nuance and complexity
- **More Accurate Readings** - Reflects real tarot practice
- **Personal Choice** - Users can choose their preference
- **Educational Value** - Learn about reversed card meanings

## 🌟 Personal Profile Survey

The bot includes an optional personal profile survey that enhances reading accuracy:

### **Survey Questions Include:**
- **Gender** - For personalized interpretations
- **Age Group** - Age-appropriate guidance
- **Emotional State** - Current emotional context
- **Life Focus** - Primary areas of concern
- **Relationship Status** - For relationship readings
- **Career Stage** - Professional context
- **Spiritual Beliefs** - Belief system considerations

### **Benefits:**
- **More Accurate Readings** - Contextual interpretations
- **Personalized Advice** - Tailored to your situation
- **Better AI Responses** - Enhanced AI understanding
- **Multi-language Support** - Available in all languages

### **How to Access:**
- Use `/profile` command
- Complete at your own pace
- Skip questions or entire survey if desired
- Update profile anytime

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | GPT model to use | `gpt-3.5-turbo` |
| `DATABASE_PATH` | SQLite database path | `./data/tarot_bot.db` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MAX_READINGS_PER_DAY` | Daily reading limit | `10` |
| `MAX_READINGS_PER_HOUR` | Hourly reading limit | `5` |

### Database

The bot uses SQLite for data storage:
- User profiles and preferences
- Reading history and statistics
- Survey responses
- Language preferences
- Reversal preferences

## 🛠️ Development

### Project Structure
```
src/
├── index.js              # Main bot entry point
├── gpt.js                # OpenAI GPT integration
├── database/             # Database operations
│   ├── init.js           # Database initialization
│   └── users.js          # User management
├── tarot/                # Tarot logic
│   ├── cards.js          # Card definitions
│   ├── spreads.js        # Reading spreads
│   ├── interpreter.js    # Reading interpretation
│   └── reader.js         # Main reading engine
├── languages/            # Multi-language support
│   └── index.js          # Translation system
├── survey/               # Personal profile survey
│   └── index.js          # Survey management
├── visual/               # Visual enhancements
│   ├── index.js          # Visual functions
│   ├── cardImages.js     # Card image handling
│   └── messageHandler.js # Message formatting
└── utils/                # Utilities
    └── messageSplitter.js # Message handling
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the bot |
| `npm run start:prod` | Start in production mode with logging |
| `npm run dev` | Start with nodemon (development) |
| `npm run debug` | Start in debug mode |
| `npm run init-db` | Initialize database |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test-file.test.js
```

## 🚀 Deployment

### Production Logging

The bot includes comprehensive logging for production environments:

- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Files**: Daily rotating log files in `./logs/`
- **Console Output**: Optional console logging
- **Performance Tracking**: Reading duration and performance metrics
- **Error Tracking**: Stack traces and detailed error information
- **User Activity**: User actions and command usage
- **AI Requests**: OpenAI API request tracking

**Production Start Command:**
```bash
npm run start:prod
```

This automatically sets:
- `NODE_ENV=production`
- `LOG_LEVEL=INFO`
- `LOG_TO_FILE=true`
- `LOG_TO_CONSOLE=true`

### Using PM2
```bash
npm install -g pm2
pm2 start src/index.js --name tarot-bot --env production
pm2 save
pm2 startup
```

### Using Docker
```bash
docker build -t tarot-bot .
docker run -d --name tarot-bot --env-file .env tarot-bot
```

## 📈 Recent Updates

### Latest Features
- **AI Question Validation** - Smart filtering to ensure users ask tarot-related questions
- **Connection Health Monitoring** - Automatic detection and recovery from network issues
- **Bot Status Command** - `/status` command to check bot health and connection
- **Multilingual Validation** - Question validation in English, Russian, and Spanish
- **Intelligent User Guidance** - Polite responses for non-tarot questions
- **Production Logging** - Comprehensive logging system for monitoring and debugging
- **Minor Arcana Translations** - Complete card name translations for Russian and Spanish

### Previous Updates
- **Card Reversals System** - Toggle between upright and reversed card interpretations
- **Full Deck Reading** - Simplified `/fulldeck` command for comprehensive readings
- **User Profile System** - Streamlined 3-field profile (gender, age group, spiritual beliefs)
- **Multi-language Support** - Full interface in English, Russian, and Spanish
- **AI-Enhanced Interpretations** - Personalized readings using OpenAI GPT
- **Visual Card Display** - Beautiful card images and Unicode art representations
- **Reading Statistics** - Track your reading history and preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Review the documentation
3. Contact the development team

---

**🔮 May the cards guide you on your journey! ✨**

