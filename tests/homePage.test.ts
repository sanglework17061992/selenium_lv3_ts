import { WebDriver } from 'selenium-webdriver';
import { WebDriverManager } from '@core/WebDriverManager';
import { HomePage } from '@pages/HomePage';
import { CustomAssertions } from '@core/CustomAssertions';

describe('Home Page Tests', () => {
  let driver: WebDriver;
  let homePage: HomePage;
  let assertions: CustomAssertions;

  beforeAll(async () => {
    driver = await WebDriverManager.getInstance().getDriver();
    homePage = new HomePage(driver);
    assertions = new CustomAssertions(driver);
  });

  beforeEach(async () => {
    await homePage.open();
  });

  afterAll(async () => {
    await WebDriverManager.getInstance().quitDriver();
  });

  test('should load home page successfully', async () => {
    // Assert page title
    await assertions.assertPageTitleContains('The Internet');
    
    // Assert main heading
    const pageTitle = await homePage.getPageTitle();
    expect(pageTitle).toBe('Welcome to the-internet');
    
    // Assert subtitle
    const subtitle = await homePage.getSubtitle();
    expect(subtitle).toContain('Available Examples');
  });

  test('should display available examples', async () => {
    const examples = await homePage.getAvailableExamples();
    
    // Assert that we have multiple examples
    expect(examples.length).toBeGreaterThan(10);
    
    // Assert specific examples exist
    expect(examples).toContain('Form Authentication');
    expect(examples).toContain('Dynamic Controls');
    expect(examples).toContain('Checkboxes');
    expect(examples).toContain('Dropdown');
  });

  test('should navigate to different pages', async () => {
    // Test navigation to Form Authentication
    await homePage.goToFormAuth();
    await assertions.assertCurrentUrlContains('/login');
    
    // Go back to home
    await driver.navigate().back();
    await assertions.assertCurrentUrlContains('herokuapp.com');
    
    // Test navigation to Dynamic Controls
    await homePage.goToDynamicControls();
    await assertions.assertCurrentUrlContains('/dynamic_controls');
  });

  test('should have working navigation links', async () => {
    const testCases = [
      { method: 'goToCheckboxes', urlPart: '/checkboxes' },
      { method: 'goToDropdown', urlPart: '/dropdown' },
      { method: 'goToDynamicContent', urlPart: '/dynamic_content' },
      { method: 'goToJavaScriptAlerts', urlPart: '/javascript_alerts' },
    ];

    for (const testCase of testCases) {
      // Navigate to home page first
      await homePage.open();
      
      // Navigate to specific page
      await (homePage as any)[testCase.method]();
      
      // Assert URL contains expected part
      await assertions.assertCurrentUrlContains(testCase.urlPart);
    }
  });
});