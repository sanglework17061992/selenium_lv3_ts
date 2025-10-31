import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@utils/Logger';
import { ConfigManager } from '@config/ConfigManager';

/**
 * Allure Reporter Utilities
 * Helper functions for Allure test reporting
 */
export class AllureReporter {
  private logger: Logger;
  private config: ConfigManager;

  constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  /**
   * Setup Allure environment properties
   */
  public setupEnvironment(): void {
    const envProps = {
      'Browser': this.config.getBrowserName(),
      'Platform': this.config.getBrowserConfig().platform,
      'Base URL': this.config.getBaseUrl(),
      'Environment': this.config.getTestConfig().environment,
      'Headless': this.config.isHeadless().toString(),
      'Retry Count': this.config.getRetryCount().toString(),
      'Parallel Mode': this.config.getTestConfig().parallelMode.toString(),
      'Max Workers': this.config.getTestConfig().maxWorkers.toString()
    };

    const reportsDir = 'reports/allure-results';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const envContent = Object.entries(envProps)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(path.join(reportsDir, 'environment.properties'), envContent);
    this.logger.info('Allure environment properties created');
  }

  /**
   * Setup Allure categories for test classification
   */
  public setupCategories(): void {
    const categories = [
      {
        name: 'Ignored tests',
        matchedStatuses: ['skipped']
      },
      {
        name: 'Infrastructure problems',
        matchedStatuses: ['broken', 'failed'],
        messageRegex: '.*timeout.*|.*connection.*|.*network.*'
      },
      {
        name: 'Outdated tests',
        matchedStatuses: ['broken'],
        traceRegex: '.*NoSuchElementException.*'
      },
      {
        name: 'Product defects',
        matchedStatuses: ['failed']
      },
      {
        name: 'Test defects',
        matchedStatuses: ['broken']
      }
    ];

    const reportsDir = 'reports/allure-results';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    this.logger.info('Allure categories created');
  }

  /**
   * Clean previous Allure results
   */
  public cleanResults(): void {
    const resultsDir = 'reports/allure-results';
    const reportDir = 'reports/allure-report';

    try {
      if (fs.existsSync(resultsDir)) {
        fs.rmSync(resultsDir, { recursive: true, force: true });
      }
      if (fs.existsSync(reportDir)) {
        fs.rmSync(reportDir, { recursive: true, force: true });
      }
      this.logger.info('Previous Allure results cleaned');
    } catch (error) {
      this.logger.warn('Failed to clean previous results', error);
    }
  }

  /**
   * Generate Allure report
   */
  public async generateReport(): Promise<void> {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);

      await execPromise('allure generate reports/allure-results --clean -o reports/allure-report');
      this.logger.info('Allure report generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate Allure report. Make sure Allure CLI is installed.', error);
      throw error;
    }
  }

  /**
   * Open Allure report in browser
   */
  public async openReport(): Promise<void> {
    try {
      const { exec } = require('child_process');
      exec('allure open reports/allure-report');
      this.logger.info('Opening Allure report in browser');
    } catch (error) {
      this.logger.error('Failed to open Allure report', error);
    }
  }

  /**
   * Attach screenshot to Allure report
   */
  public attachScreenshot(screenshot: string, name: string = 'Screenshot'): void {
    try {
      const allure = require('allure-jest');
      if (allure && allure.attachment) {
        allure.attachment(name, Buffer.from(screenshot, 'base64'), 'image/png');
      }
    } catch (error) {
      this.logger.warn('Failed to attach screenshot to Allure', error);
    }
  }

  /**
   * Add step to Allure report
   */
  public step(name: string, status: 'passed' | 'failed' | 'broken' = 'passed'): void {
    try {
      const allure = require('allure-jest');
      if (allure && allure.step) {
        allure.step(name, () => {
          // Step implementation would go here
        });
      }
    } catch (error) {
      this.logger.warn('Failed to add step to Allure', error);
    }
  }

  /**
   * Add test description
   */
  public description(text: string): void {
    try {
      const allure = require('allure-jest');
      if (allure && allure.description) {
        allure.description(text);
      }
    } catch (error) {
      this.logger.warn('Failed to add description to Allure', error);
    }
  }

  /**
   * Add severity level
   */
  public severity(level: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    try {
      const allure = require('allure-jest');
      if (allure && allure.severity) {
        allure.severity(level);
      }
    } catch (error) {
      this.logger.warn('Failed to set severity in Allure', error);
    }
  }

  /**
   * Add feature label
   */
  public feature(name: string): void {
    try {
      const allure = require('allure-jest');
      if (allure && allure.feature) {
        allure.feature(name);
      }
    } catch (error) {
      this.logger.warn('Failed to set feature in Allure', error);
    }
  }

  /**
   * Add story label
   */
  public story(name: string): void {
    try {
      const allure = require('allure-jest');
      if (allure && allure.story) {
        allure.story(name);
      }
    } catch (error) {
      this.logger.warn('Failed to set story in Allure', error);
    }
  }
}