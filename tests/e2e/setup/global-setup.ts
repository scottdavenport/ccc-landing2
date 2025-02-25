import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';

async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: '.env.test' });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to login page
  await page.goto('http://localhost:3000/admin/login');

  // Fill in login credentials
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'testpassword123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to admin page and verify we're logged in
  await page.waitForURL('http://localhost:3000/admin');
  await page.waitForSelector('text=Dashboard Overview', { timeout: 10000 });

  // Store authentication state
  await context.storageState({ path: 'playwright/.auth/user.json' });

  await browser.close();
}

export default globalSetup;
