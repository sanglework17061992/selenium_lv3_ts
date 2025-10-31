import { WebDriver } from 'selenium-webdriver';
import { WebDriverManager } from '@core/WebDriverManager';
import { FormAuthPage } from '@pages/FormAuthPage';
import { CustomAssertions } from '@core/CustomAssertions';

describe('Form Authentication Tests', () => {
  let driver: WebDriver;
  let formAuthPage: FormAuthPage;
  let assertions: CustomAssertions;

  // Valid credentials for The Internet
  const validCredentials = {
    username: 'tomsmith',
    password: 'SuperSecretPassword!'
  };

  const invalidCredentials = {
    username: 'invalid',
    password: 'invalid'
  };

  beforeAll(async () => {
    driver = await WebDriverManager.getInstance().getDriver();
    formAuthPage = new FormAuthPage(driver);
    assertions = new CustomAssertions(driver);
  });

  beforeEach(async () => {
    await formAuthPage.open();
  });

  afterAll(async () => {
    await WebDriverManager.getInstance().quitDriver();
  });

  test('should load login page successfully', async () => {
    // Assert page elements are present
    await assertions.assertPageTitleContains('The Internet');
    
    const pageTitle = await formAuthPage.getPageTitle();
    expect(pageTitle).toBe('Login Page');
  });

  test('should login with valid credentials', async () => {
    // Perform login
    await formAuthPage.login(validCredentials.username, validCredentials.password);
    
    // Wait for login result
    await formAuthPage.waitForLoginResult();
    
    // Assert successful login
    expect(await formAuthPage.isLoginSuccessful()).toBe(true);
    
    // Assert secure area elements
    const secureAreaTitle = await formAuthPage.getSecureAreaTitle();
    expect(secureAreaTitle).toBe('Secure Area');
    
    // Assert flash message
    const flashMessage = await formAuthPage.getFlashMessage();
    expect(flashMessage).toContain('You logged into a secure area!');
    
    // Assert logout button is visible
    expect(await formAuthPage.isLogoutButtonVisible()).toBe(true);
  });

  test('should fail login with invalid credentials', async () => {
    // Perform login with invalid credentials
    await formAuthPage.login(invalidCredentials.username, invalidCredentials.password);
    
    // Wait for login result
    await formAuthPage.waitForLoginResult();
    
    // Assert login failed
    expect(await formAuthPage.isLoginSuccessful()).toBe(false);
    
    // Assert error message
    const flashMessage = await formAuthPage.getFlashMessage();
    expect(flashMessage).toContain('Your username is invalid!');
  });

  test('should fail login with empty credentials', async () => {
    // Try to login without entering credentials
    await formAuthPage.clickLogin();
    
    // Wait for result
    await formAuthPage.waitForLoginResult();
    
    // Assert login failed
    expect(await formAuthPage.isLoginSuccessful()).toBe(false);
    
    // Assert error message
    const flashMessage = await formAuthPage.getFlashMessage();
    expect(flashMessage).toContain('Your username is invalid!');
  });

  test('should fail login with valid username but invalid password', async () => {
    // Perform login with valid username but invalid password
    await formAuthPage.login(validCredentials.username, 'wrongpassword');
    
    // Wait for login result
    await formAuthPage.waitForLoginResult();
    
    // Assert login failed
    expect(await formAuthPage.isLoginSuccessful()).toBe(false);
    
    // Assert error message
    const flashMessage = await formAuthPage.getFlashMessage();
    expect(flashMessage).toContain('Your password is invalid!');
  });

  test('should logout successfully after login', async () => {
    // First login
    await formAuthPage.login(validCredentials.username, validCredentials.password);
    await formAuthPage.waitForLoginResult();
    
    // Verify we're logged in
    expect(await formAuthPage.isLoginSuccessful()).toBe(true);
    
    // Logout
    await formAuthPage.logout();
    
    // Assert we're back to login page
    await assertions.assertCurrentUrlContains('/login');
    
    // Assert flash message for logout
    const flashMessage = await formAuthPage.getFlashMessage();
    expect(flashMessage).toContain('You logged out of the secure area!');
  });

  test('should validate form fields individually', async () => {
    const username = 'testuser';
    const password = 'testpass';
    
    // Test username field
    await formAuthPage.enterUsername(username);
    // You could add assertions here to verify the field was filled
    
    // Test password field
    await formAuthPage.enterPassword(password);
    // You could add assertions here to verify the field was filled
    
    // Test that fields retain values before submission
    // Note: password fields typically don't allow reading values for security
  });
});