import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as firefox from 'selenium-webdriver/firefox';
import * as edge from 'selenium-webdriver/edge';
import * as safari from 'selenium-webdriver/safari';
import { ConfigManager } from '@config/ConfigManager';
import { BrowserType } from '../types/index';
import { Logger } from '@utils/Logger';

/**
 * Browser Factory - Factory Pattern
 * Creates and configures WebDriver instances for different browsers
 */
export class BrowserFactory {
  private static logger = Logger.getInstance();

  public static async createDriver(browserType?: BrowserType): Promise<WebDriver> {
    const config = ConfigManager.getInstance();
    const browser = browserType || config.getBrowserName();
    const isHeadless = config.isHeadless();
    const windowSize = config.getBrowserConfig().windowSize;

    this.logger.info(`Creating ${browser} driver (headless: ${isHeadless})`);

    let driver: WebDriver;

    switch (browser) {
      case 'chrome':
        driver = await this.createChromeDriver(isHeadless, windowSize);
        break;
      case 'firefox':
        driver = await this.createFirefoxDriver(isHeadless, windowSize);
        break;
      case 'edge':
        driver = await this.createEdgeDriver(isHeadless, windowSize);
        break;
      case 'safari':
        driver = await this.createSafariDriver();
        break;
      default:
        throw new Error(`Unsupported browser: ${browser}`);
    }

    // Set implicit wait
    await driver.manage().setTimeouts({
      implicit: config.getTestConfig().implicitWait,
    });

    return driver;
  }

  private static async createChromeDriver(headless: boolean, windowSize: string): Promise<WebDriver> {
    const options = new chrome.Options();
    
    if (headless) {
      options.addArguments('--headless=new');
    }
    
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=VizDisplayCompositor',
      `--window-size=${windowSize}`
    );

    return new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }

  private static async createFirefoxDriver(headless: boolean, windowSize: string): Promise<WebDriver> {
    const options = new firefox.Options();
    
    if (headless) {
      options.addArguments('--headless');
    }
    
    options.addArguments(`--width=${windowSize.split(',')[0]}`);
    options.addArguments(`--height=${windowSize.split(',')[1]}`);

    return new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
  }

  private static async createEdgeDriver(headless: boolean, windowSize: string): Promise<WebDriver> {
    const options = new edge.Options();
    
    if (headless) {
      options.addArguments('--headless=new');
    }
    
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--window-size=${windowSize}`
    );

    return new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(options)
      .build();
  }

  private static async createSafariDriver(): Promise<WebDriver> {
    // Safari doesn't support headless mode
    return new Builder()
      .forBrowser('safari')
      .build();
  }
}

/**
 * WebDriver Manager - Singleton Pattern
 * Manages WebDriver lifecycle and provides centralized access
 */
export class WebDriverManager {
  private static instance: WebDriverManager;
  private driver: WebDriver | null = null;
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): WebDriverManager {
    if (!WebDriverManager.instance) {
      WebDriverManager.instance = new WebDriverManager();
    }
    return WebDriverManager.instance;
  }

  public async getDriver(browserType?: BrowserType): Promise<WebDriver> {
    if (!this.driver) {
      this.driver = await BrowserFactory.createDriver(browserType);
      this.logger.info('WebDriver instance created');
    }
    return this.driver;
  }

  public async quitDriver(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
      this.logger.info('WebDriver instance quit');
    }
  }

  public async restartDriver(browserType?: BrowserType): Promise<WebDriver> {
    await this.quitDriver();
    return this.getDriver(browserType);
  }

  public isDriverActive(): boolean {
    return this.driver !== null;
  }
}