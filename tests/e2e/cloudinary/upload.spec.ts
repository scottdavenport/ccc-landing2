import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Sponsor Logo Upload Flow', () => {
  // Mock API response for successful upload
  const mockSuccessResponse = {
    id: '123',
    name: 'Test Sponsor',
    website: 'https://example.com',
    logo_url: 'https://example.com/logo.png'
  };

  // Mock API response for error
  const mockErrorResponse = {
    error: 'Failed to upload image'
  };

  // Helper to setup API mocking
  async function setupApiMocking(page: any, options: { success?: boolean } = {}) {
    const { success = true } = options;
    
    await page.route('**/api/sponsors', async route => {
      const request = route.request();
      console.log('Request intercepted:', {
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });

      if (request.method() === 'POST') {
        await route.fulfill({
          status: success ? 200 : 500,
          contentType: 'application/json',
          body: JSON.stringify(success ? mockSuccessResponse : mockErrorResponse)
        });
      } else {
        await route.continue();
      }
    });
  }
  test.beforeEach(async ({ page }) => {
    // Enable detailed request/response logging
    page.on('request', async request => {
      console.log('Request:', {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        resourceType: request.resourceType()
      });
    });

    page.on('response', async response => {
      const request = response.request();
      console.log('Response:', {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    // Log any console messages from the page
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text());
    });

    // Navigate to the sponsor management page
    await page.goto('/admin/sponsors');
    // Click the Add New Sponsor button
    await page.click('text=Add New Sponsor');
    // Wait for the form to be visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('should successfully upload a logo', async ({ page }) => {
    // Setup API mocking
    await setupApiMocking(page, { success: true });
    let apiCalled = false;
    
    // Track API calls
    page.on('response', async response => {
      if (response.url().includes('/api/sponsors')) {
        apiCalled = true;
        console.log('API Response:', {
          status: response.status(),
          url: response.url(),
          headers: response.headers()
        });
      }
    });



    // Fill in sponsor details
    await page.fill('input[name="name"]', 'Test Sponsor');
    await page.fill('input[name="website"]', 'https://example.com');
    
    // Upload the test image
    const testImagePath = path.join(__dirname, '../../fixtures/test-images/sample-logo.png');
    await page.setInputFiles('input[type="file"]', testImagePath);
    
    // Verify preview is displayed
    await expect(page.locator('.image-preview')).toBeVisible();
    
    // Debug form state before submission
    const formContent = await page.evaluate(() => {
      const form = document.querySelector('form');
      const formData = new FormData(form!);
      return Object.fromEntries(formData);
    });
    console.log('Form content:', formContent);
    
    // Get the submit button and ensure it's visible
    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeVisible();

    // Click submit button
    await submitButton.click();

    // Wait for button to show loading state
    await expect(submitButton).toHaveText('Submitting...');
    await expect(submitButton).toHaveClass(/cursor-not-allowed/);

    // Wait for API response
    const response = await page.waitForResponse(
      response => response.url().includes('/api/sponsors') && response.request().method() === 'POST'
    );

    // Log the response and button state
    console.log('Form submission complete:', {
      buttonState: await submitButton.evaluate(el => ({
        disabled: el.disabled,
        ariaDisabled: el.getAttribute('aria-disabled'),
        className: el.className,
        text: el.textContent
      })),
      response: {
        status: response.status(),
        statusText: response.statusText(),
        url: response.url()
      }
    });
    
    // Verify API was called
    if (!apiCalled) {
      throw new Error('API was not called');
    }
    
    // Wait for success message and form reset
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.success-message')).toContainText('Sponsor created successfully');
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="website"]')).toHaveValue('');
    await expect(page.locator('.image-preview')).not.toBeVisible();
  });

  test('should handle invalid file types', async ({ page }) => {
    // Fill in sponsor details
    await page.fill('input[name="name"]', 'Invalid File Test');
    await page.fill('input[name="website"]', 'https://example.com');
    
    // Try to upload an invalid file type
    const invalidFilePath = path.join(__dirname, '../../fixtures/test-images/invalid.txt');
    await page.setInputFiles('input[type="file"]', invalidFilePath);
    
    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid file type');
  });

  test('should handle upload errors', async ({ page }) => {
    // Setup API mocking with error response
    await setupApiMocking(page, { success: false });
    // Track all requests to the sponsors API
    const requests: any[] = [];
    const responses: any[] = [];

    // Intercept all requests
    await page.route('**', async route => {
      const request = route.request();
      const url = request.url();
      
      if (url.includes('/api/sponsors')) {
        requests.push({
          method: request.method(),
          url: url,
          headers: request.headers(),
          postData: request.postData()
        });

        if (request.method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': '*'
            },
            body: JSON.stringify({ error: 'Failed to upload image' })
          });
          return;
        }
      }
      
      await route.continue();
    });

    // Track responses
    page.on('response', response => {
      if (response.url().includes('/api/sponsors')) {
        responses.push({
          status: response.status(),
          url: response.url(),
          headers: response.headers()
        });
      }
    });

    // Fill in sponsor details
    await page.fill('input[name="name"]', 'Error Test Sponsor');
    await page.fill('input[name="website"]', 'https://example.com');
    
    // Upload the test image
    const testImagePath = path.join(__dirname, '../../fixtures/test-images/sample-logo.png');
    await page.setInputFiles('input[type="file"]', testImagePath);
    
    // Get the submit button and ensure it's visible
    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeVisible();

    // Click submit button
    await submitButton.click();

    // Wait for button to show loading state
    await expect(submitButton).toHaveText('Submitting...');
    await expect(submitButton).toHaveClass(/cursor-not-allowed/);

    // Wait for API response
    const response = await page.waitForResponse(
      response => response.url().includes('/api/sponsors') && response.request().method() === 'POST'
    );

    // Log the response and button state
    console.log('Form submission complete (error test):', {
      buttonState: await submitButton.evaluate(el => ({
        disabled: el.disabled,
        ariaDisabled: el.getAttribute('aria-disabled'),
        className: el.className,
        text: el.textContent
      })),
      response: {
        status: response.status(),
        statusText: response.statusText(),
        url: response.url()
      }
    });
    
    // Verify error message appears
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
    
    // Verify error handling
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-message')).toContainText('Failed to upload image');
  });
});
