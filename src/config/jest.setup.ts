import { WebDriverManager } from '@core/WebDriverManager';
import { ConfigManager } from '@config/ConfigManager';
import { Logger } from '@utils/Logger';

// Global setup for Jest tests
const logger = Logger.getInstance();

// Global timeout for all tests
jest.setTimeout(60000);

// Setup before all tests
beforeAll(async () => {
  logger.info('🚀 Starting test suite...');
  const config = ConfigManager.getInstance();
  logger.info(`Configuration loaded: Browser=${config.getBrowserName()}, Environment=${config.getTestConfig().environment}`);
});

// Setup before each test
beforeEach(async () => {
  logger.info('Starting new test...');
});

// Cleanup after each test
afterEach(async () => {
  const config = ConfigManager.getInstance();
  
  // Take screenshot on failure if enabled
  if (config.getReportingConfig().enableScreenshots) {
    const driverManager = WebDriverManager.getInstance();
    if (driverManager.isDriverActive()) {
      try {
        const driver = await driverManager.getDriver();
        const screenshot = await driver.takeScreenshot();
        // You can implement screenshot saving logic here
        logger.info('Screenshot captured for test');
      } catch (error) {
        logger.warn('Failed to capture screenshot', error);
      }
    }
  }
  
  logger.info('Test completed');
});

// Cleanup after all tests
afterAll(async () => {
  logger.info('🏁 Test suite completed, cleaning up...');
  const driverManager = WebDriverManager.getInstance();
  await driverManager.quitDriver();
  logger.info('WebDriver cleanup completed');
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});