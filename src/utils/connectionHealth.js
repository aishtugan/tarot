import logger from './logger.js';

/**
 * Connection health monitor for Telegram Bot API
 */
class ConnectionHealthMonitor {
  constructor(bot) {
    this.bot = bot;
    this.isConnected = false;
    this.lastPing = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
  }

  /**
   * Start monitoring connection health
   */
  start() {
    logger.info('Starting connection health monitor');
    
    // Set up periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.checkConnection();
    }, 30000); // Check every 30 seconds
    
    // Initial connection check
    this.checkConnection();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    logger.info('Connection health monitor stopped');
  }

  /**
   * Check if bot is connected and responsive
   */
  async checkConnection() {
    try {
      // Try to get bot info as a health check
      const botInfo = await this.bot.getMe();
      this.isConnected = true;
      this.lastPing = Date.now();
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      
      logger.debug('Connection health check passed', { 
        botName: botInfo.first_name,
        username: botInfo.username 
      });
      
    } catch (error) {
      this.isConnected = false;
      logger.warn('Connection health check failed', { 
        error: error.message,
        reconnectAttempts: this.reconnectAttempts 
      });
      
      // Attempt reconnection if not at max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnection();
      } else {
        logger.error('Max reconnection attempts reached, manual intervention required');
      }
    }
  }

  /**
   * Attempt to reconnect the bot
   */
  async attemptReconnection() {
    this.reconnectAttempts++;
    logger.warn(`Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    try {
      // Stop current polling
      this.bot.stopPolling();
      
      // Wait before restarting
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
      
      // Restart polling
      this.bot.startPolling();
      
      logger.info('Reconnection attempt completed');
      
    } catch (error) {
      logger.errorWithStack('Reconnection attempt failed', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      lastPing: this.lastPing,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

export default ConnectionHealthMonitor;
