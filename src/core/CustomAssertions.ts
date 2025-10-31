import { WebDriver, WebElement, By } from 'selenium-webdriver';
import { Logger } from '@utils/Logger';
import { AssertionOptions } from '../types/index';

/**
 * Custom Assertion Layer with Retry Mechanism
 * Provides robust assertions for web automation
 */
export class CustomAssertions {
  private driver: WebDriver;
  private logger: Logger;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.logger = Logger.getInstance();
  }

  /**
   * Assert element is visible with retry
   */
  public async assertElementVisible(
    locator: By, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const isDisplayed = await element.isDisplayed();
        
        if (isDisplayed) {
          this.logger.info(`✓ Element is visible: ${locator.toString()}`);
          return;
        }
      } catch (error) {
        // Element not found, continue retrying
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element is not visible: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element is not visible with retry
   */
  public async assertElementNotVisible(
    locator: By, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const isDisplayed = await element.isDisplayed();
        
        if (!isDisplayed) {
          this.logger.info(`✓ Element is not visible: ${locator.toString()}`);
          return;
        }
      } catch (error) {
        // Element not found, which means it's not visible
        this.logger.info(`✓ Element is not visible (not found): ${locator.toString()}`);
        return;
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element is still visible: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element text with retry
   */
  public async assertElementText(
    locator: By, 
    expectedText: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const actualText = await element.getText();
        
        if (actualText === expectedText) {
          this.logger.info(`✓ Element text matches: expected="${expectedText}", actual="${actualText}"`);
          return;
        }
        
        this.logger.debug(`Text mismatch: expected="${expectedText}", actual="${actualText}"`);
      } catch (error) {
        this.logger.debug(`Failed to get element text: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element text does not match: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element text contains with retry
   */
  public async assertElementTextContains(
    locator: By, 
    expectedText: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const actualText = await element.getText();
        
        if (actualText.includes(expectedText)) {
          this.logger.info(`✓ Element text contains: expected="${expectedText}", actual="${actualText}"`);
          return;
        }
        
        this.logger.debug(`Text does not contain: expected="${expectedText}", actual="${actualText}"`);
      } catch (error) {
        this.logger.debug(`Failed to get element text: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element text does not contain expected text: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element attribute with retry
   */
  public async assertElementAttribute(
    locator: By, 
    attributeName: string, 
    expectedValue: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const actualValue = await element.getAttribute(attributeName);
        
        if (actualValue === expectedValue) {
          this.logger.info(`✓ Element attribute matches: ${attributeName}="${expectedValue}"`);
          return;
        }
        
        this.logger.debug(`Attribute mismatch: expected="${expectedValue}", actual="${actualValue}"`);
      } catch (error) {
        this.logger.debug(`Failed to get element attribute: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element attribute does not match: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element is enabled with retry
   */
  public async assertElementEnabled(
    locator: By, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const isEnabled = await element.isEnabled();
        
        if (isEnabled) {
          this.logger.info(`✓ Element is enabled: ${locator.toString()}`);
          return;
        }
      } catch (error) {
        this.logger.debug(`Failed to check if element is enabled: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element is not enabled: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element is disabled with retry
   */
  public async assertElementDisabled(
    locator: By, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const element = await this.driver.findElement(locator);
        const isEnabled = await element.isEnabled();
        
        if (!isEnabled) {
          this.logger.info(`✓ Element is disabled: ${locator.toString()}`);
          return;
        }
      } catch (error) {
        this.logger.debug(`Failed to check if element is disabled: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element is not disabled: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert page title with retry
   */
  public async assertPageTitle(
    expectedTitle: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const actualTitle = await this.driver.getTitle();
        
        if (actualTitle === expectedTitle) {
          this.logger.info(`✓ Page title matches: "${expectedTitle}"`);
          return;
        }
        
        this.logger.debug(`Title mismatch: expected="${expectedTitle}", actual="${actualTitle}"`);
      } catch (error) {
        this.logger.debug(`Failed to get page title: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Page title does not match expected title`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert page title contains with retry
   */
  public async assertPageTitleContains(
    expectedText: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const actualTitle = await this.driver.getTitle();
        
        if (actualTitle.includes(expectedText)) {
          this.logger.info(`✓ Page title contains: "${expectedText}"`);
          return;
        }
        
        this.logger.debug(`Title does not contain: expected="${expectedText}", actual="${actualTitle}"`);
      } catch (error) {
        this.logger.debug(`Failed to get page title: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Page title does not contain expected text`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert current URL with retry
   */
  public async assertCurrentUrl(
    expectedUrl: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const actualUrl = await this.driver.getCurrentUrl();
        
        if (actualUrl === expectedUrl) {
          this.logger.info(`✓ Current URL matches: "${expectedUrl}"`);
          return;
        }
        
        this.logger.debug(`URL mismatch: expected="${expectedUrl}", actual="${actualUrl}"`);
      } catch (error) {
        this.logger.debug(`Failed to get current URL: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Current URL does not match expected URL`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert current URL contains with retry
   */
  public async assertCurrentUrlContains(
    expectedText: string, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const actualUrl = await this.driver.getCurrentUrl();
        
        if (actualUrl.includes(expectedText)) {
          this.logger.info(`✓ Current URL contains: "${expectedText}"`);
          return;
        }
        
        this.logger.debug(`URL does not contain: expected="${expectedText}", actual="${actualUrl}"`);
      } catch (error) {
        this.logger.debug(`Failed to get current URL: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Current URL does not contain expected text`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Assert element count with retry
   */
  public async assertElementCount(
    locator: By, 
    expectedCount: number, 
    options: AssertionOptions = {}
  ): Promise<void> {
    const { timeout = 10000, retryInterval = 500, message } = options;
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      try {
        const elements = await this.driver.findElements(locator);
        const actualCount = elements.length;
        
        if (actualCount === expectedCount) {
          this.logger.info(`✓ Element count matches: expected=${expectedCount}, actual=${actualCount}`);
          return;
        }
        
        this.logger.debug(`Count mismatch: expected=${expectedCount}, actual=${actualCount}`);
      } catch (error) {
        this.logger.debug(`Failed to count elements: ${error}`);
      }
      
      await this.sleep(retryInterval);
    }
    
    const errorMessage = message || `Element count does not match: ${locator.toString()}`;
    this.logger.error(`✗ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  /**
   * Sleep utility function
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}