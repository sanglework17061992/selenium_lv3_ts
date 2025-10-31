import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from '@core/BasePage';

/**
 * Form Authentication Page Object
 */
export class FormAuthPage extends BasePage {
  // Locators
  private readonly pageTitle = By.css('h2');
  private readonly usernameField = By.id('username');
  private readonly passwordField = By.id('password');
  private readonly loginButton = By.css('button[type="submit"]');
  private readonly flashMessage = By.id('flash');
  private readonly logoutButton = By.css('a[href="/logout"]');

  // Success page elements
  private readonly secureAreaTitle = By.css('h2');
  private readonly secureAreaText = By.css('.subheader');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Navigate directly to form auth page
   */
  public async open(): Promise<void> {
    const baseUrl = this.config.getBaseUrl();
    await this.navigateTo(`${baseUrl}/login`);
  }

  /**
   * Get page title
   */
  public async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  /**
   * Enter username
   */
  public async enterUsername(username: string): Promise<void> {
    await this.type(this.usernameField, username);
  }

  /**
   * Enter password
   */
  public async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordField, password);
  }

  /**
   * Click login button
   */
  public async clickLogin(): Promise<void> {
    await this.click(this.loginButton);
  }

  /**
   * Perform complete login
   */
  public async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Get flash message text
   */
  public async getFlashMessage(): Promise<string> {
    return await this.getText(this.flashMessage);
  }

  /**
   * Check if flash message is displayed
   */
  public async isFlashMessageDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.flashMessage);
  }

  /**
   * Check if login was successful
   */
  public async isLoginSuccessful(): Promise<boolean> {
    try {
      return await this.isDisplayed(this.logoutButton);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get secure area title (after successful login)
   */
  public async getSecureAreaTitle(): Promise<string> {
    return await this.getText(this.secureAreaTitle);
  }

  /**
   * Get secure area text (after successful login)
   */
  public async getSecureAreaText(): Promise<string> {
    return await this.getText(this.secureAreaText);
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }

  /**
   * Check if logout button is visible
   */
  public async isLogoutButtonVisible(): Promise<boolean> {
    return await this.isDisplayed(this.logoutButton);
  }

  /**
   * Wait for login process to complete
   */
  public async waitForLoginResult(): Promise<void> {
    // Wait for either flash message or logout button to appear
    const timeout = 5000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const flashVisible = await this.isDisplayed(this.flashMessage);
      const logoutVisible = await this.isDisplayed(this.logoutButton);
      
      if (flashVisible || logoutVisible) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Login result not determined within timeout');
  }
}