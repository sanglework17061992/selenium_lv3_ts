import { WebDriver } from 'selenium-webdriver';
import { WebDriverManager } from '@core/WebDriverManager';
import { DynamicControlsPage } from '@pages/DynamicControlsPage';
import { CustomAssertions } from '@core/CustomAssertions';

describe('Dynamic Controls Tests', () => {
  let driver: WebDriver;
  let dynamicControlsPage: DynamicControlsPage;
  let assertions: CustomAssertions;

  beforeAll(async () => {
    driver = await WebDriverManager.getInstance().getDriver();
    dynamicControlsPage = new DynamicControlsPage(driver);
    assertions = new CustomAssertions(driver);
  });

  beforeEach(async () => {
    await dynamicControlsPage.open();
  });

  afterAll(async () => {
    await WebDriverManager.getInstance().quitDriver();
  });

  test('should load dynamic controls page successfully', async () => {
    // Assert page title
    await assertions.assertPageTitleContains('The Internet');
    
    const pageTitle = await dynamicControlsPage.getPageTitle();
    expect(pageTitle).toBe('Dynamic Controls');
  });

  test('should remove and add checkbox dynamically', async () => {
    // Initially checkbox should be present
    expect(await dynamicControlsPage.isCheckboxPresent()).toBe(true);
    
    // Initial button should say "Remove"
    let buttonText = await dynamicControlsPage.getRemoveAddButtonText();
    expect(buttonText).toBe('Remove');
    
    // Remove checkbox
    const removeMessage = await dynamicControlsPage.performCheckboxOperation();
    expect(removeMessage).toBe('It\'s gone!');
    
    // Checkbox should no longer be present
    expect(await dynamicControlsPage.isCheckboxPresent()).toBe(false);
    
    // Button should now say "Add"
    buttonText = await dynamicControlsPage.getRemoveAddButtonText();
    expect(buttonText).toBe('Add');
    
    // Add checkbox back
    const addMessage = await dynamicControlsPage.performCheckboxOperation();
    expect(addMessage).toBe('It\'s back!');
    
    // Checkbox should be present again
    expect(await dynamicControlsPage.isCheckboxPresent()).toBe(true);
  });

  test('should check and uncheck checkbox when present', async () => {
    // Ensure checkbox is present
    if (!await dynamicControlsPage.isCheckboxPresent()) {
      await dynamicControlsPage.performCheckboxOperation(); // Add it back
    }
    
    // Initially checkbox should be unchecked
    expect(await dynamicControlsPage.isCheckboxChecked()).toBe(false);
    
    // Check the checkbox
    await dynamicControlsPage.clickCheckbox();
    expect(await dynamicControlsPage.isCheckboxChecked()).toBe(true);
    
    // Uncheck the checkbox
    await dynamicControlsPage.clickCheckbox();
    expect(await dynamicControlsPage.isCheckboxChecked()).toBe(false);
  });

  test('should enable and disable input field dynamically', async () => {
    // Initially input should be disabled
    expect(await dynamicControlsPage.isInputEnabled()).toBe(false);
    
    // Initial button should say "Enable"
    let buttonText = await dynamicControlsPage.getEnableDisableButtonText();
    expect(buttonText).toBe('Enable');
    
    // Enable input
    const enableMessage = await dynamicControlsPage.performInputOperation();
    expect(enableMessage).toBe('It\'s enabled!');
    
    // Input should now be enabled
    expect(await dynamicControlsPage.isInputEnabled()).toBe(true);
    
    // Button should now say "Disable"
    buttonText = await dynamicControlsPage.getEnableDisableButtonText();
    expect(buttonText).toBe('Disable');
    
    // Disable input
    const disableMessage = await dynamicControlsPage.performInputOperation();
    expect(disableMessage).toBe('It\'s disabled!');
    
    // Input should be disabled again
    expect(await dynamicControlsPage.isInputEnabled()).toBe(false);
  });

  test('should type in input field when enabled', async () => {
    // First enable the input field
    if (!await dynamicControlsPage.isInputEnabled()) {
      await dynamicControlsPage.performInputOperation();
    }
    
    // Type in the input field
    const testText = 'Hello, World!';
    await dynamicControlsPage.typeInInput(testText);
    
    // Verify the text was entered
    const inputValue = await dynamicControlsPage.getInputValue();
    expect(inputValue).toBe(testText);
  });

  test('should not allow typing when input is disabled', async () => {
    // Ensure input is disabled
    if (await dynamicControlsPage.isInputEnabled()) {
      await dynamicControlsPage.performInputOperation(); // Disable it
    }
    
    // Try to type in disabled field - should throw error
    await expect(dynamicControlsPage.typeInInput('test')).rejects.toThrow('Input field is disabled');
  });

  test('should handle multiple state changes correctly', async () => {
    // Test multiple checkbox operations
    for (let i = 0; i < 3; i++) {
      const initialPresent = await dynamicControlsPage.isCheckboxPresent();
      await dynamicControlsPage.performCheckboxOperation();
      const finalPresent = await dynamicControlsPage.isCheckboxPresent();
      expect(finalPresent).toBe(!initialPresent);
    }
    
    // Test multiple input operations
    for (let i = 0; i < 3; i++) {
      const initialEnabled = await dynamicControlsPage.isInputEnabled();
      await dynamicControlsPage.performInputOperation();
      const finalEnabled = await dynamicControlsPage.isInputEnabled();
      expect(finalEnabled).toBe(!initialEnabled);
    }
  });
});