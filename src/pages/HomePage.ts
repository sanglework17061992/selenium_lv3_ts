import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from '@core/BasePage';

/**
 * Home Page Object for The Internet Herokuapp
 */
export class HomePage extends BasePage {
  // Locators
  private readonly pageTitle = By.css('h1');
  private readonly subtitle = By.css('h2');
  private readonly availableExamples = By.css('ul li a');

  // Navigation links
  private readonly basicAuthLink = By.linkText('Basic Auth');
  private readonly checkboxesLink = By.linkText('Checkboxes');
  private readonly dropdownLink = By.linkText('Dropdown');
  private readonly dynamicContentLink = By.linkText('Dynamic Content');
  private readonly dynamicControlsLink = By.linkText('Dynamic Controls');
  private readonly formAuthLink = By.linkText('Form Authentication');
  private readonly hoversLink = By.linkText('Hovers');
  private readonly javascriptAlertsLink = By.linkText('JavaScript Alerts');
  private readonly keyPressesLink = By.linkText('Key Presses');
  private readonly tablesLink = By.linkText('Sortable Data Tables');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate to home page
   */
  public async open(): Promise<void> {
    const baseUrl = this.config.getBaseUrl();
    await this.navigateTo(baseUrl);
  }

  /**
   * Get page title text
   */
  public async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  /**
   * Get subtitle text
   */
  public async getSubtitle(): Promise<string> {
    return await this.getText(this.subtitle);
  }

  /**
   * Get all available example links
   */
  public async getAvailableExamples(): Promise<string[]> {
    const elements = await this.findElements(this.availableExamples);
    const examples: string[] = [];
    
    for (const element of elements) {
      const text = await element.getText();
      examples.push(text);
    }
    
    return examples;
  }

  /**
   * Navigate to Form Authentication page
   */
  public async goToFormAuth(): Promise<void> {
    await this.click(this.formAuthLink);
  }

  /**
   * Navigate to Checkboxes page
   */
  public async goToCheckboxes(): Promise<void> {
    await this.click(this.checkboxesLink);
  }

  /**
   * Navigate to Dropdown page
   */
  public async goToDropdown(): Promise<void> {
    await this.click(this.dropdownLink);
  }

  /**
   * Navigate to Dynamic Content page
   */
  public async goToDynamicContent(): Promise<void> {
    await this.click(this.dynamicContentLink);
  }

  /**
   * Navigate to Dynamic Controls page
   */
  public async goToDynamicControls(): Promise<void> {
    await this.click(this.dynamicControlsLink);
  }

  /**
   * Navigate to JavaScript Alerts page
   */
  public async goToJavaScriptAlerts(): Promise<void> {
    await this.click(this.javascriptAlertsLink);
  }

  /**
   * Navigate to Hovers page
   */
  public async goToHovers(): Promise<void> {
    await this.click(this.hoversLink);
  }

  /**
   * Navigate to Tables page
   */
  public async goToTables(): Promise<void> {
    await this.click(this.tablesLink);
  }

  /**
   * Navigate to Key Presses page
   */
  public async goToKeyPresses(): Promise<void> {
    await this.click(this.keyPressesLink);
  }
}