import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Log level names
const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.DEBUG]: 'DEBUG'
};

// Emojis for different log types
const LOG_EMOJIS = {
  [LOG_LEVELS.ERROR]: '❌',
  [LOG_LEVELS.WARN]: '⚠️',
  [LOG_LEVELS.INFO]: 'ℹ️',
  [LOG_LEVELS.DEBUG]: '🔍'
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || LOG_LEVELS.INFO;
    this.logToFile = options.logToFile !== false;
    this.logToConsole = options.logToConsole !== false;
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    
    // Ensure log directory exists
    if (this.logToFile) {
      this.ensureLogDirectory();
    }
    
    this.currentLogFile = this.getLogFileName();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `tarot-bot-${date}.log`);
  }

  rotateLogFile() {
    if (!this.logToFile) return;

    try {
      const stats = fs.statSync(this.currentLogFile);
      if (stats.size > this.maxFileSize) {
        // Rotate log files
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = `${this.currentLogFile}.${i}`;
          const newFile = `${this.currentLogFile}.${i + 1}`;
          if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
          }
        }
        
        // Move current log to .1
        if (fs.existsSync(this.currentLogFile)) {
          fs.renameSync(this.currentLogFile, `${this.currentLogFile}.1`);
        }
        
        // Create new log file
        this.currentLogFile = this.getLogFileName();
      }
    } catch (error) {
      // If file doesn't exist, that's fine
    }
  }

  formatMessage(level, message, data = null) {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const levelName = LOG_LEVEL_NAMES[level];
    const emoji = LOG_EMOJIS[level];
    
    let formattedMessage = `[${timestamp}] ${levelName} ${emoji} ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += ` | ${JSON.stringify(data)}`;
      } else {
        formattedMessage += ` | ${data}`;
      }
    }
    
    return formattedMessage;
  }

  writeToFile(message) {
    if (!this.logToFile) return;

    try {
      this.rotateLogFile();
      fs.appendFileSync(this.currentLogFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  writeToConsole(message) {
    if (!this.logToConsole) return;
    console.log(message);
  }

  log(level, message, data = null) {
    if (level > this.level) return;

    const formattedMessage = this.formatMessage(level, message, data);
    
    this.writeToConsole(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  // Specialized logging methods for different components
  userAction(userId, action, details = null) {
    this.info(`User Action: ${action}`, { userId, action, details });
  }

  readingCompleted(userId, readingType, cardCount, duration = null) {
    this.info(`Reading Completed`, { 
      userId, 
      readingType, 
      cardCount, 
      duration 
    });
  }

  aiRequest(userId, requestType, success, duration = null) {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
    this.log(level, `AI Request: ${requestType}`, { 
      userId, 
      requestType, 
      success, 
      duration 
    });
  }

  databaseOperation(operation, table, success, duration = null) {
    const level = success ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
    this.log(level, `Database Operation: ${operation}`, { 
      operation, 
      table, 
      success, 
      duration 
    });
  }

  botCommand(userId, command, success = true) {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
    this.log(level, `Bot Command: ${command}`, { userId, command, success });
  }

  // Performance logging
  performance(operation, duration, details = null) {
    const level = duration > 5000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
    this.log(level, `Performance: ${operation}`, { 
      operation, 
      duration, 
      details 
    });
  }

  // Error logging with stack trace
  errorWithStack(message, error) {
    this.error(message, {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  // Startup and shutdown logging
  startup(version, environment) {
    this.info('Bot Starting', { version, environment });
  }

  shutdown(reason = 'Normal shutdown') {
    this.info('Bot Shutting Down', { reason });
  }

  // Get log statistics
  getLogStats() {
    if (!this.logToFile || !fs.existsSync(this.currentLogFile)) {
      return { exists: false };
    }

    try {
      const stats = fs.statSync(this.currentLogFile);
      const content = fs.readFileSync(this.currentLogFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const errorCount = lines.filter(line => line.includes('ERROR')).length;
      const warnCount = lines.filter(line => line.includes('WARN')).length;
      const infoCount = lines.filter(line => line.includes('INFO')).length;
      const debugCount = lines.filter(line => line.includes('DEBUG')).length;

      return {
        exists: true,
        size: stats.size,
        lines: lines.length,
        errors: errorCount,
        warnings: warnCount,
        info: infoCount,
        debug: debugCount,
        lastModified: stats.mtime
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  // Clean old log files
  cleanOldLogs(daysToKeep = 30) {
    if (!this.logToFile) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to clean old logs', error);
    }
  }
}

// Create default logger instance with dynamic configuration
function getLoggerConfig() {
  return {
    level: process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : LOG_LEVELS.INFO,
    logToFile: process.env.LOG_TO_FILE !== 'false',
    logToConsole: process.env.LOG_TO_CONSOLE !== 'false'
  };
}

const logger = new Logger(getLoggerConfig());

// Update logger configuration when environment changes
function updateLoggerConfig() {
  const config = getLoggerConfig();
  logger.level = config.level;
  logger.logToFile = config.logToFile;
  logger.logToConsole = config.logToConsole;
}

// Export the update function
export { updateLoggerConfig };

export default logger;
export { Logger };
