import * as dotenv from 'dotenv';
import { FrameworkConfig, BrowserType, PlatformType, EnvironmentType } from '../types/index';

// Load environment variables
dotenv.config();

/**
 * Configuration Manager - Singleton Pattern
 * Centralized configuration management for the framework
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: FrameworkConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): FrameworkConfig {
    return {
      browser: {
        browserName: (process.env.BROWSER as BrowserType) || 'chrome',
        headless: process.env.HEADLESS === 'true',
        windowSize: process.env.WINDOW_SIZE || '1920,1080',
        platform: (process.env.PLATFORM as PlatformType) || 'linux',
      },
      test: {
        baseUrl: process.env.BASE_URL || 'https://the-internet.herokuapp.com',
        environment: (process.env.ENVIRONMENT as EnvironmentType) || 'dev',
        retryCount: parseInt(process.env.RETRY_COUNT || '3'),
        timeout: parseInt(process.env.TIMEOUT || '30000'),
        implicitWait: parseInt(process.env.IMPLICIT_WAIT || '10000'),
        explicitWait: parseInt(process.env.EXPLICIT_WAIT || '30000'),
        parallelMode: process.env.PARALLEL_MODE === 'true',
        maxWorkers: parseInt(process.env.MAX_WORKERS || '4'),
      },
      reporting: {
        enableScreenshots: process.env.ENABLE_SCREENSHOTS === 'true',
        enableVideo: process.env.ENABLE_VIDEO === 'true',
        enableLogging: process.env.ENABLE_LOGGING === 'true',
        logLevel: process.env.LOG_LEVEL || 'info',
      },
    };
  }

  public getConfig(): FrameworkConfig {
    return this.config;
  }

  public getBrowserConfig() {
    return this.config.browser;
  }

  public getTestConfig() {
    return this.config.test;
  }

  public getReportingConfig() {
    return this.config.reporting;
  }

  public updateConfig(updates: Partial<FrameworkConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getBaseUrl(): string {
    return this.config.test.baseUrl;
  }

  public getRetryCount(): number {
    return this.config.test.retryCount;
  }

  public getTimeout(): number {
    return this.config.test.timeout;
  }

  public isHeadless(): boolean {
    return this.config.browser.headless;
  }

  public getBrowserName(): BrowserType {
    return this.config.browser.browserName as BrowserType;
  }
}