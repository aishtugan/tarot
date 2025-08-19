#!/usr/bin/env node

import logManager from '../src/utils/logManager.js';
import logger from '../src/utils/logger.js';

async function analyzeLogs() {
  console.log('🔍 Tarot Bot Log Analysis\n');

  try {
    // Get log summary
    const summary = logManager.getLogSummary();
    
    if (summary.totalFiles === 0) {
      console.log('📭 No log files found');
      return;
    }

    console.log('📊 Log Summary:');
    console.log(`   Total Files: ${summary.totalFiles}`);
    console.log(`   Total Size: ${(summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total Lines: ${summary.totalLines.toLocaleString()}`);
    
    if (summary.timeRange.start && summary.timeRange.end) {
      console.log(`   Time Range: ${summary.timeRange.start.toISOString()} to ${summary.timeRange.end.toISOString()}`);
    }

    console.log('\n📈 Log Levels:');
    console.log(`   Errors: ${summary.errors}`);
    console.log(`   Warnings: ${summary.warnings}`);
    console.log(`   Info: ${summary.info}`);
    console.log(`   Debug: ${summary.debug}`);

    console.log('\n🎯 Bot Activity:');
    console.log(`   User Actions: ${summary.userActions}`);
    console.log(`   Readings: ${summary.readings}`);
    console.log(`   AI Requests: ${summary.aiRequests}`);
    console.log(`   Database Operations: ${summary.databaseOps}`);
    console.log(`   Bot Commands: ${summary.botCommands}`);
    console.log(`   Performance Issues: ${summary.performanceIssues}`);

    // Get recent errors
    const recentErrors = logManager.getRecentErrors(24);
    if (recentErrors.length > 0) {
      console.log('\n❌ Recent Errors (Last 24h):');
      recentErrors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.timestamp.toISOString()}] ${error.content.substring(0, 100)}...`);
      });
      if (recentErrors.length > 5) {
        console.log(`   ... and ${recentErrors.length - 5} more errors`);
      }
    }

    // Get performance issues
    const performanceIssues = logManager.getPerformanceIssues(5000);
    if (performanceIssues.length > 0) {
      console.log('\n⏱️ Performance Issues (>5s):');
      performanceIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.timestamp.toISOString()}] ${issue.duration}ms - ${issue.content.substring(0, 80)}...`);
      });
      if (performanceIssues.length > 5) {
        console.log(`   ... and ${performanceIssues.length - 5} more performance issues`);
      }
    }

    // Calculate error rate
    const totalEvents = summary.userActions + summary.readings + summary.aiRequests + summary.databaseOps + summary.botCommands;
    const errorRate = totalEvents > 0 ? (summary.errors / totalEvents * 100).toFixed(2) : 0;
    
    console.log('\n📊 Health Metrics:');
    console.log(`   Error Rate: ${errorRate}%`);
    console.log(`   Success Rate: ${(100 - parseFloat(errorRate)).toFixed(2)}%`);
    
    if (summary.performanceIssues > 0) {
      const performanceRate = (summary.performanceIssues / totalEvents * 100).toFixed(2);
      console.log(`   Performance Issues: ${performanceRate}%`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (summary.errors > 0) {
      console.log('   ⚠️  Check recent errors for system issues');
    }
    if (summary.performanceIssues > 0) {
      console.log('   ⏱️  Investigate performance bottlenecks');
    }
    if (summary.totalSize > 100 * 1024 * 1024) { // 100MB
      console.log('   📁 Consider log rotation or cleanup');
    }
    if (summary.totalFiles > 10) {
      console.log('   🧹 Clean up old log files');
    }

  } catch (error) {
    console.error('❌ Error analyzing logs:', error.message);
    logger.error('Failed to analyze logs', error);
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeLogs();
} else {
  // Also run if this is the main module
  analyzeLogs();
}

export default analyzeLogs;
