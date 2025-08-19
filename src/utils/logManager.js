import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogManager {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
  }

  // Get all log files
  getLogFiles() {
    try {
      if (!fs.existsSync(this.logDir)) {
        return [];
      }

      const files = fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          size: fs.statSync(path.join(this.logDir, file)).size,
          modified: fs.statSync(path.join(this.logDir, file)).mtime
        }))
        .sort((a, b) => b.modified - a.modified);

      return files;
    } catch (error) {
      logger.error('Failed to get log files', error);
      return [];
    }
  }

  // Analyze log file
  analyzeLogFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const analysis = {
        totalLines: lines.length,
        errors: 0,
        warnings: 0,
        info: 0,
        debug: 0,
        userActions: 0,
        readings: 0,
        aiRequests: 0,
        databaseOps: 0,
        botCommands: 0,
        performanceIssues: 0,
        timeRange: { start: null, end: null }
      };

      lines.forEach(line => {
        // Count log levels
        if (line.includes('ERROR')) analysis.errors++;
        else if (line.includes('WARN')) analysis.warnings++;
        else if (line.includes('INFO')) analysis.info++;
        else if (line.includes('DEBUG')) analysis.debug++;

        // Count specific events
        if (line.includes('User Action:')) analysis.userActions++;
        if (line.includes('Reading Completed')) analysis.readings++;
        if (line.includes('AI Request:')) analysis.aiRequests++;
        if (line.includes('Database Operation:')) analysis.databaseOps++;
        if (line.includes('Bot Command:')) analysis.botCommands++;
        if (line.includes('Performance:') && line.includes('WARN')) analysis.performanceIssues++;

        // Extract timestamps
        const timestampMatch = line.match(/\[([^\]]+)\]/);
        if (timestampMatch) {
          const timestamp = new Date(timestampMatch[1]);
          if (!analysis.timeRange.start || timestamp < analysis.timeRange.start) {
            analysis.timeRange.start = timestamp;
          }
          if (!analysis.timeRange.end || timestamp > analysis.timeRange.end) {
            analysis.timeRange.end = timestamp;
          }
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze log file', { filePath, error: error.message });
      return null;
    }
  }

  // Get log summary
  getLogSummary() {
    const files = this.getLogFiles();
    const summary = {
      totalFiles: files.length,
      totalSize: 0,
      totalLines: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0,
      userActions: 0,
      readings: 0,
      aiRequests: 0,
      databaseOps: 0,
      botCommands: 0,
      performanceIssues: 0,
      timeRange: { start: null, end: null }
    };

    files.forEach(file => {
      summary.totalSize += file.size;
      const analysis = this.analyzeLogFile(file.path);
      
      if (analysis) {
        summary.totalLines += analysis.totalLines;
        summary.errors += analysis.errors;
        summary.warnings += analysis.warnings;
        summary.info += analysis.info;
        summary.debug += analysis.debug;
        summary.userActions += analysis.userActions;
        summary.readings += analysis.readings;
        summary.aiRequests += analysis.aiRequests;
        summary.databaseOps += analysis.databaseOps;
        summary.botCommands += analysis.botCommands;
        summary.performanceIssues += analysis.performanceIssues;

        // Update time range
        if (analysis.timeRange.start) {
          if (!summary.timeRange.start || analysis.timeRange.start < summary.timeRange.start) {
            summary.timeRange.start = analysis.timeRange.start;
          }
        }
        if (analysis.timeRange.end) {
          if (!summary.timeRange.end || analysis.timeRange.end > summary.timeRange.end) {
            summary.timeRange.end = analysis.timeRange.end;
          }
        }
      }
    });

    return summary;
  }

  // Search logs
  searchLogs(query, options = {}) {
    const { caseSensitive = false, maxResults = 100, filePattern = null } = options;
    const results = [];
    const files = this.getLogFiles();

    files.forEach(file => {
      if (filePattern && !file.name.includes(filePattern)) {
        return;
      }

      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const searchText = caseSensitive ? line : line.toLowerCase();
          const searchQuery = caseSensitive ? query : query.toLowerCase();
          
          if (searchText.includes(searchQuery)) {
            results.push({
              file: file.name,
              line: index + 1,
              content: line.trim(),
              timestamp: this.extractTimestamp(line)
            });

            if (results.length >= maxResults) {
              return;
            }
          }
        });
      } catch (error) {
        logger.error('Failed to search log file', { file: file.name, error: error.message });
      }
    });

    return results;
  }

  // Extract timestamp from log line
  extractTimestamp(line) {
    const timestampMatch = line.match(/\[([^\]]+)\]/);
    if (!timestampMatch) return null;
    
    // Handle both ISO format and readable format
    const timestampStr = timestampMatch[1];
    if (timestampStr.includes('T')) {
      // ISO format: 2025-08-19T19:47:10.982Z
      return new Date(timestampStr);
    } else {
      // Readable format: 08/19/2025, 19:47:10
      const [datePart, timePart] = timestampStr.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute, second] = timePart.split(':');
      return new Date(year, month - 1, day, hour, minute, second);
    }
  }

  // Get recent errors
  getRecentErrors(hours = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const results = [];

    const files = this.getLogFiles();
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('ERROR')) {
            const timestamp = this.extractTimestamp(line);
            if (timestamp && timestamp > cutoffTime) {
              results.push({
                file: file.name,
                line: index + 1,
                content: line.trim(),
                timestamp
              });
            }
          }
        });
      } catch (error) {
        logger.error('Failed to read log file for error analysis', { file: file.name, error: error.message });
      }
    });

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get performance issues
  getPerformanceIssues(threshold = 5000) {
    const results = [];

    const files = this.getLogFiles();
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('Performance:') && line.includes('WARN')) {
            const durationMatch = line.match(/duration":\s*(\d+)/);
            if (durationMatch) {
              const duration = parseInt(durationMatch[1]);
              if (duration > threshold) {
                results.push({
                  file: file.name,
                  line: index + 1,
                  content: line.trim(),
                  duration,
                  timestamp: this.extractTimestamp(line)
                });
              }
            }
          }
        });
      } catch (error) {
        logger.error('Failed to read log file for performance analysis', { file: file.name, error: error.message });
      }
    });

    return results.sort((a, b) => b.duration - a.duration);
  }

  // Clean old logs
  cleanOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const files = this.getLogFiles();
    let cleanedCount = 0;

    files.forEach(file => {
      if (file.modified < cutoffDate) {
        try {
          fs.unlinkSync(file.path);
          cleanedCount++;
          logger.info(`Cleaned old log file: ${file.name}`);
        } catch (error) {
          logger.error('Failed to clean log file', { file: file.name, error: error.message });
        }
      }
    });

    return cleanedCount;
  }

  // Export logs
  exportLogs(format = 'json', options = {}) {
    const { startDate, endDate, includeDebug = false } = options;
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        format,
        filters: { startDate, endDate, includeDebug }
      },
      logs: []
    };

    const files = this.getLogFiles();
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          const timestamp = this.extractTimestamp(line);
          
          // Apply filters
          if (startDate && timestamp < new Date(startDate)) return;
          if (endDate && timestamp > new Date(endDate)) return;
          if (!includeDebug && line.includes('DEBUG')) return;

          exportData.logs.push({
            timestamp: timestamp ? timestamp.toISOString() : null,
            level: this.extractLogLevel(line),
            message: this.extractMessage(line),
            raw: line
          });
        });
      } catch (error) {
        logger.error('Failed to read log file for export', { file: file.name, error: error.message });
      }
    });

    // Sort by timestamp
    exportData.logs.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    return exportData;
  }

  // Extract log level from line
  extractLogLevel(line) {
    if (line.includes('ERROR')) return 'ERROR';
    if (line.includes('WARN')) return 'WARN';
    if (line.includes('INFO')) return 'INFO';
    if (line.includes('DEBUG')) return 'DEBUG';
    return 'UNKNOWN';
  }

  // Extract message from line
  extractMessage(line) {
    const parts = line.split('] ');
    if (parts.length > 1) {
      return parts.slice(1).join('] ');
    }
    return line;
  }
}

export default new LogManager();
