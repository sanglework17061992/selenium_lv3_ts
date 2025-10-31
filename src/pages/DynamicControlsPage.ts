import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from '@core/BasePage';

/**
 * Dynamic Controls Page Object
 */
export class DynamicControlsPage extends BasePage {
  // Locators
  private readonly pageTitle = By.css('h4');
  
  // Checkbox section
  private readonly checkbox = By.css('#checkbox input[type="checkbox"]');
  private readonly removeAddButton = By.css('#checkbox-example button');
  private readonly checkboxMessage = By.css('#checkbox-example #message');
  private readonly checkboxLoading = By.css('#checkbox-example #loading');
  
  // Input section
  private readonly inputField = By.css('#input-example input[type="text"]');
  private readonly enableDisableButton = By.css('#input-example button');
  private readonly inputMessage = By.css('#input-example #message');
  private readonly inputLoading = By.css('#input-example #loading');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate directly to dynamic controls page
   */
  public async open(): Promise<void> {
    const baseUrl = this.config.getBaseUrl();
    await this.navigateTo(`${baseUrl}/dynamic_controls`);
  }

  /**
   * Get page title
   */
  public async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  // Checkbox operations
  /**
   * Check if checkbox is present
   */
  public async isCheckboxPresent(): Promise<boolean> {
    try {
      return await this.isDisplayed(this.checkbox);
    } catch (error) {
      return false;
    }
  }

  /**
   * Click checkbox if present
   */
  public async clickCheckbox(): Promise<void> {
    if (await this.isCheckboxPresent()) {
      await this.click(this.checkbox);
    } else {
      throw new Error('Checkbox is not present');
    }
  }

  /**
   * Check if checkbox is checked
   */
  public async isCheckboxChecked(): Promise<boolean> {
    if (await this.isCheckboxPresent()) {
      const element = await this.findElement(this.checkbox);
      return await element.isSelected();
    }
    return false;
  }

  /**
   * Click Remove/Add button
   */
  public async clickRemoveAddButton(): Promise<void> {
    await this.click(this.removeAddButton);
  }

  /**
   * Get Remove/Add button text
   */
  public async getRemoveAddButtonText(): Promise<string> {
    return await this.getText(this.removeAddButton);
  }

  /**
   * Wait for checkbox loading to disappear
   */
  public async waitForCheckboxLoading(): Promise<void> {
    await this.waitForElementToDisappear(this.checkboxLoading);
  }

  /**
   * Get checkbox message
   */
  public async getCheckboxMessage(): Promise<string> {
    return await this.getText(this.checkboxMessage);
  }

  // Input operations
  /**
   * Check if input field is enabled
   */
  public async isInputEnabled(): Promise<boolean> {
    return await this.isEnabled(this.inputField);
  }

  /**
   * Type in input field
   */
  public async typeInInput(text: string): Promise<void> {
    if (await this.isInputEnabled()) {
      await this.type(this.inputField, text);
    } else {
      throw new Error('Input field is disabled');
    }
  }

  /**
   * Get input field value
   */
  public async getInputValue(): Promise<string> {
    const value = await this.getAttribute(this.inputField, 'value');
    return value || '';
  }

  /**
   * Click Enable/Disable button
   */
  public async clickEnableDisableButton(): Promise<void> {
    await this.click(this.enableDisableButton);
  }

  /**
   * Get Enable/Disable button text
   */
  public async getEnableDisableButtonText(): Promise<string> {
    return await this.getText(this.enableDisableButton);
  }

  /**
   * Wait for input loading to disappear
   */
  public async waitForInputLoading(): Promise<void> {
    await this.waitForElementToDisappear(this.inputLoading);
  }

  /**
   * Get input message
   */
  public async getInputMessage(): Promise<string> {
    return await this.getText(this.inputMessage);
  }

  /**
   * Complete checkbox removal/addition cycle
   */
  public async performCheckboxOperation(): Promise<string> {
    const initialButtonText = await this.getRemoveAddButtonText();
    await this.clickRemoveAddButton();
    await this.waitForCheckboxLoading();
    const message = await this.getCheckboxMessage();
    return message;
  }

  /**
   * Complete input enable/disable cycle
   */
  public async performInputOperation(): Promise<string> {
    const initialButtonText = await this.getEnableDisableButtonText();
    await this.clickEnableDisableButton();
    await this.waitForInputLoading();
    const message = await this.getInputMessage();
    return message;
  }
}