# 📊 Logging System Documentation

## 🎯 Overview

The Tarot Telegram Bot includes a comprehensive logging system that provides structured logging, file rotation, and analysis capabilities. This system helps monitor bot performance, debug issues, and track user activity.

## 🏗️ Architecture

### **Components**
- **Logger** (`src/utils/logger.js`) - Core logging functionality
- **LogManager** (`src/utils/logManager.js`) - Log analysis and management
- **Log Analysis Script** (`scripts/analyze-logs.js`) - Command-line log analysis

### **Features**
- ✅ **Structured Logging** - JSON-formatted log entries with timestamps
- ✅ **File Rotation** - Automatic log file rotation based on size
- ✅ **Log Levels** - ERROR, WARN, INFO, DEBUG levels
- ✅ **Performance Monitoring** - Track operation durations
- ✅ **Log Analysis** - Search, analyze, and export logs
- ✅ **Automatic Cleanup** - Remove old log files

## ⚙️ Configuration

### **Environment Variables**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Minimum log level to record | `INFO` | `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `LOG_TO_FILE` | Enable file logging | `true` | `true`, `false` |
| `LOG_TO_CONSOLE` | Enable console logging | `true` | `true`, `false` |
| `LOG_MAX_FILE_SIZE` | Maximum log file size (bytes) | `10485760` (10MB) | `5242880` (5MB) |
| `LOG_MAX_FILES` | Number of rotated log files to keep | `5` | `10` |
| `LOG_CLEANUP_DAYS` | Days to keep old log files | `30` | `7`, `60` |

### **Example Configuration**
```bash
# Development
LOG_LEVEL=DEBUG
LOG_TO_FILE=true
LOG_TO_CONSOLE=true

# Production
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_TO_CONSOLE=false
LOG_MAX_FILE_SIZE=20971520
LOG_MAX_FILES=10
LOG_CLEANUP_DAYS=60
```

## 📝 Usage

### **Basic Logging**

```javascript
import logger from './src/utils/logger.js';

// Different log levels
logger.error('Critical error occurred', { userId: 123, error: 'Database connection failed' });
logger.warn('Warning message', { userId: 123, action: 'rate_limit_exceeded' });
logger.info('Information message', { userId: 123, action: 'reading_completed' });
logger.debug('Debug information', { userId: 123, details: 'card_selection' });
```

### **Specialized Logging Methods**

```javascript
// User actions
logger.userAction(userId, 'reading_requested', { readingType: 'daily' });

// Reading completion
logger.readingCompleted(userId, 'daily', 1, 2500); // duration in ms

// AI requests
logger.aiRequest(userId, 'interpretation', true, 1500); // success, duration

// Database operations
logger.databaseOperation('SELECT', 'users', true, 50); // success, duration

// Bot commands
logger.botCommand(userId, '/daily', true);

// Performance monitoring
logger.performance('reading_generation', 3000, { cardCount: 5 });

// Error with stack trace
logger.errorWithStack('Database error', error);
```

### **Startup and Shutdown**

```javascript
// At bot startup
logger.startup('1.0.0', process.env.NODE_ENV);

// At bot shutdown
logger.shutdown('SIGTERM received');
```

## 📊 Log Analysis

### **Command Line Tools**

#### **Analyze Logs**
```bash
npm run logs:analyze
```

**Output Example:**
```
🔍 Tarot Bot Log Analysis

📊 Log Summary:
   Total Files: 3
   Total Size: 2.45 MB
   Total Lines: 15,234
   Time Range: 2024-01-15T10:00:00.000Z to 2024-01-16T15:30:00.000Z

📈 Log Levels:
   Errors: 12
   Warnings: 45
   Info: 8,234
   Debug: 6,943

🎯 Bot Activity:
   User Actions: 1,234
   Readings: 567
   AI Requests: 890
   Database Operations: 2,345
   Bot Commands: 1,123
   Performance Issues: 3

📊 Health Metrics:
   Error Rate: 0.15%
   Success Rate: 99.85%
   Performance Issues: 0.04%
```

#### **Clean Old Logs**
```bash
npm run logs:clean
```

#### **Export Logs**
```bash
npm run logs:export > logs-export.json
```

#### **Search Logs**
```bash
npm run logs:search "error"
npm run logs:search "user 123"
```

### **Programmatic Analysis**

```javascript
import logManager from './src/utils/logManager.js';

// Get log summary
const summary = logManager.getLogSummary();
console.log('Total errors:', summary.errors);

// Search for specific terms
const results = logManager.searchLogs('database error', {
  caseSensitive: false,
  maxResults: 50
});

// Get recent errors
const recentErrors = logManager.getRecentErrors(24); // Last 24 hours

// Get performance issues
const performanceIssues = logManager.getPerformanceIssues(5000); // >5 seconds

// Export logs
const exportData = logManager.exportLogs('json', {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  includeDebug: false
});
```

## 📁 Log File Structure

### **File Naming**
- Format: `tarot-bot-YYYY-MM-DD.log`
- Example: `tarot-bot-2024-01-16.log`

### **Log Entry Format**
```
[2024-01-16T15:30:45.123Z] INFO ℹ️ User Action: reading_requested | {"userId":123,"action":"reading_requested","details":{"readingType":"daily"}}
```

### **Log Entry Components**
1. **Timestamp** - ISO 8601 format
2. **Level** - ERROR, WARN, INFO, DEBUG
3. **Emoji** - Visual indicator
4. **Message** - Human-readable message
5. **Data** - JSON-formatted additional data

## 🔍 Log Levels

### **ERROR (0)**
- Critical system failures
- Database connection errors
- API failures
- Unhandled exceptions

### **WARN (1)**
- Non-critical issues
- Performance warnings
- Fallback scenarios
- Rate limiting

### **INFO (2)**
- User actions
- Reading completions
- Bot commands
- System events

### **DEBUG (3)**
- Detailed debugging information
- Card selections
- Database queries
- Performance metrics

## 📈 Performance Monitoring

### **Automatic Performance Tracking**
The logger automatically tracks performance for:
- Reading generation time
- AI API response time
- Database operation duration
- Bot command processing time

### **Performance Thresholds**
- **< 1 second**: DEBUG level
- **1-5 seconds**: INFO level
- **> 5 seconds**: WARN level

### **Performance Data**
```javascript
logger.performance('ai_interpretation', 2500, {
  model: 'gpt-4',
  tokens: 150,
  userId: 123
});
```

## 🧹 Log Maintenance

### **Automatic Rotation**
- **Trigger**: File size exceeds `LOG_MAX_FILE_SIZE`
- **Action**: Rename current file to `.1`, create new file
- **Retention**: Keep `LOG_MAX_FILES` rotated files

### **Automatic Cleanup**
- **Trigger**: Log files older than `LOG_CLEANUP_DAYS`
- **Action**: Delete old log files
- **Manual**: `npm run logs:clean`

### **Manual Cleanup**
```javascript
import logManager from './src/utils/logManager.js';

// Clean logs older than 7 days
const cleanedCount = logManager.cleanOldLogs(7);
console.log(`Cleaned ${cleanedCount} log files`);
```

## 🔧 Integration

### **Replacing Console Logs**
```javascript
// Before
console.log('User registered:', userId);
console.error('Database error:', error);

// After
logger.info('User registered', { userId });
logger.errorWithStack('Database error', error);
```

### **Error Handling**
```javascript
try {
  // Database operation
} catch (error) {
  logger.errorWithStack('Database operation failed', error);
  // Handle error
}
```

### **Performance Monitoring**
```javascript
const startTime = Date.now();
try {
  // Operation
  const result = await performOperation();
  const duration = Date.now() - startTime;
  logger.performance('operation_name', duration, { result });
} catch (error) {
  const duration = Date.now() - startTime;
  logger.performance('operation_name', duration, { error: error.message });
  throw error;
}
```

## 📊 Monitoring and Alerts

### **Health Metrics**
- **Error Rate**: Percentage of errors vs total operations
- **Success Rate**: Percentage of successful operations
- **Performance Issues**: Operations taking longer than threshold
- **Log Volume**: Daily log file sizes and line counts

### **Recommended Alerts**
- Error rate > 5%
- Performance issues > 10 per hour
- Log file size > 100MB
- No logs generated in 24 hours

### **Dashboard Integration**
```javascript
// Get metrics for dashboard
const summary = logManager.getLogSummary();
const metrics = {
  errorRate: (summary.errors / summary.totalLines * 100).toFixed(2),
  successRate: (100 - (summary.errors / summary.totalLines * 100)).toFixed(2),
  totalReadings: summary.readings,
  activeUsers: summary.userActions,
  performanceIssues: summary.performanceIssues
};
```

## 🚀 Best Practices

### **Log Level Selection**
- **Development**: Use DEBUG level for detailed information
- **Production**: Use INFO level, enable DEBUG only when needed
- **Staging**: Use WARN level to catch issues early

### **Data Privacy**
- Never log sensitive user data (passwords, tokens)
- Anonymize user IDs in logs when possible
- Use structured data for easy filtering

### **Performance**
- Use appropriate log levels to reduce I/O
- Monitor log file sizes and rotation
- Clean up old logs regularly

### **Troubleshooting**
- Use search functionality to find specific issues
- Monitor error rates and performance metrics
- Set up alerts for critical issues

## 🔗 Related Files

- `src/utils/logger.js` - Core logging functionality
- `src/utils/logManager.js` - Log analysis and management
- `scripts/analyze-logs.js` - Log analysis script
- `env.example` - Logging configuration examples
- `package.json` - Logging-related npm scripts

---

**📊 The logging system provides comprehensive monitoring and debugging capabilities for the Tarot Telegram Bot, ensuring reliable operation and easy troubleshooting.**
