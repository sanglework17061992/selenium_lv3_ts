import { WebDriver, WebElement, By, until, Key } from 'selenium-webdriver';
import { WebDriverManager } from '@core/WebDriverManager';
import { ConfigManager } from '@config/ConfigManager';
import { Logger } from '@utils/Logger';
import { AssertionOptions } from '../types/index';

/**
 * Base Page Object Model Class
 * Provides common functionality for all page objects
 */
export abstract class BasePage {
  protected driver: WebDriver;
  protected config: ConfigManager;
  protected logger: Logger;
  protected timeout: number;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.config = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    this.timeout = this.config.getTestConfig().explicitWait;
  }

  /**
   * Static factory method to create page instance with driver
   */
  public static async create<T extends BasePage>(
    this: new (driver: WebDriver) => T,
    driver?: WebDriver
  ): Promise<T> {
    const webDriver = driver || await WebDriverManager.getInstance().getDriver();
    return new this(webDriver);
  }

  /**
   * Navigate to a URL
   */
  public async navigateTo(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    await this.driver.get(url);
  }

  /**
   * Get current page URL
   */
  public async getCurrentUrl(): Promise<string> {
    return await this.driver.getCurrentUrl();
  }

  /**
   * Get page title
   */
  public async getTitle(): Promise<string> {
    return await this.driver.getTitle();
  }

  /**
   * Wait for element to be located and visible
   */
  public async waitForElement(locator: By, timeout?: number): Promise<WebElement> {
    const waitTime = timeout || this.timeout;
    this.logger.debug(`Waiting for element: ${locator.toString()}`);
    
    await this.driver.wait(until.elementLocated(locator), waitTime);
    const element = await this.driver.wait(until.elementIsVisible(
      await this.driver.findElement(locator)
    ), waitTime);
    
    return element;
  }

  /**
   * Find element with smart wait
   */
  public async findElement(locator: By, timeout?: number): Promise<WebElement> {
    return await this.waitForElement(locator, timeout);
  }

  /**
   * Find multiple elements
   */
  public async findElements(locator: By): Promise<WebElement[]> {
    this.logger.debug(`Finding elements: ${locator.toString()}`);
    return await this.driver.findElements(locator);
  }

  /**
   * Click element with retry mechanism
   */
  public async click(locator: By, timeout?: number): Promise<void> {
    const element = await this.waitForElement(locator, timeout);
    
    try {
      await this.driver.wait(until.elementIsEnabled(element), timeout || this.timeout);
      await element.click();
      this.logger.debug(`Clicked element: ${locator.toString()}`);
    } catch (error) {
      this.logger.error(`Failed to click element: ${locator.toString()}`, error);
      throw error;
    }
  }

  /**
   * Type text with clear first
   */
  public async type(locator: By, text: string, timeout?: number): Promise<void> {
    const element = await this.waitForElement(locator, timeout);
    
    try {
      await element.clear();
      await element.sendKeys(text);
      this.logger.debug(`Typed text '${text}' into element: ${locator.toString()}`);
    } catch (error) {
      this.logger.error(`Failed to type into element: ${locator.toString()}`, error);
      throw error;
    }
  }

  /**
   * Get text from element
   */
  public async getText(locator: By, timeout?: number): Promise<string> {
    const element = await this.waitForElement(locator, timeout);
    const text = await element.getText();
    this.logger.debug(`Got text '${text}' from element: ${locator.toString()}`);
    return text;
  }

  /**
   * Get attribute value
   */
  public async getAttribute(locator: By, attribute: string, timeout?: number): Promise<string | null> {
    const element = await this.waitForElement(locator, timeout);
    return await element.getAttribute(attribute);
  }

  /**
   * Check if element is displayed
   */
  public async isDisplayed(locator: By, timeout?: number): Promise<boolean> {
    try {
      const element = await this.waitForElement(locator, timeout);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  public async isEnabled(locator: By, timeout?: number): Promise<boolean> {
    try {
      const element = await this.waitForElement(locator, timeout);
      return await element.isEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to disappear
   */
  public async waitForElementToDisappear(locator: By, timeout?: number): Promise<void> {
    const waitTime = timeout || this.timeout;
    this.logger.debug(`Waiting for element to disappear: ${locator.toString()}`);
    
    try {
      await this.driver.wait(until.stalenessOf(
        await this.driver.findElement(locator)
      ), waitTime);
    } catch (error) {
      // Element might not exist, which is fine
      this.logger.debug(`Element not found or already disappeared: ${locator.toString()}`);
    }
  }

  /**
   * Select from dropdown by visible text
   */
  public async selectByVisibleText(locator: By, text: string, timeout?: number): Promise<void> {
    const element = await this.waitForElement(locator, timeout);
    const options = await element.findElements(By.tagName('option'));
    
    for (const option of options) {
      const optionText = await option.getText();
      if (optionText === text) {
        await option.click();
        this.logger.debug(`Selected option '${text}' from dropdown: ${locator.toString()}`);
        return;
      }
    }
    
    throw new Error(`Option '${text}' not found in dropdown: ${locator.toString()}`);
  }

  /**
   * Take screenshot
   */
  public async takeScreenshot(filename?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = filename || `screenshot-${timestamp}.png`;
    const screenshot = await this.driver.takeScreenshot();
    
    // You can save this to file system if needed
    this.logger.info(`Screenshot taken: ${screenshotName}`);
    return screenshot;
  }

  /**
   * Execute JavaScript
   */
  public async executeScript(script: string, ...args: any[]): Promise<any> {
    return await this.driver.executeScript(script, ...args);
  }

  /**
   * Scroll to element
   */
  public async scrollToElement(locator: By, timeout?: number): Promise<void> {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
    this.logger.debug(`Scrolled to element: ${locator.toString()}`);
  }

  /**
   * Switch to frame
   */
  public async switchToFrame(frameLocator: By): Promise<void> {
    const frame = await this.waitForElement(frameLocator);
    await this.driver.switchTo().frame(frame);
    this.logger.debug(`Switched to frame: ${frameLocator.toString()}`);
  }

  /**
   * Switch to default content
   */
  public async switchToDefaultContent(): Promise<void> {
    await this.driver.switchTo().defaultContent();
    this.logger.debug('Switched to default content');
  }

  /**
   * Handle alert
   */
  public async acceptAlert(): Promise<void> {
    await this.driver.wait(until.alertIsPresent(), this.timeout);
    const alert = await this.driver.switchTo().alert();
    await alert.accept();
    this.logger.debug('Alert accepted');
  }

  /**
   * Dismiss alert
   */
  public async dismissAlert(): Promise<void> {
    await this.driver.wait(until.alertIsPresent(), this.timeout);
    const alert = await this.driver.switchTo().alert();
    await alert.dismiss();
    this.logger.debug('Alert dismissed');
  }

  /**
   * Get alert text
   */
  public async getAlertText(): Promise<string> {
    await this.driver.wait(until.alertIsPresent(), this.timeout);
    const alert = await this.driver.switchTo().alert();
    return await alert.getText();
  }

  /**
   * Refresh page
   */
  public async refresh(): Promise<void> {
    await this.driver.navigate().refresh();
    this.logger.debug('Page refreshed');
  }

  /**
   * Go back
   */
  public async goBack(): Promise<void> {
    await this.driver.navigate().back();
    this.logger.debug('Navigated back');
  }

  /**
   * Go forward
   */
  public async goForward(): Promise<void> {
    await this.driver.navigate().forward();
    this.logger.debug('Navigated forward');
  }
}