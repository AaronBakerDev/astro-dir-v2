import { test as base, expect, type Page } from '@playwright/test';

const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/directory');
    await use(page);
  },
});

test('should display the main heading', async ({ page }) => {
  await expect(page.locator('h1')).toContainText(
    'Find Local Chimney Professionals'
  );
});

test('should have working search form', async ({ page }) => {
  // Test search input
  const searchInput = page.locator('input[name="search"]');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('masonry');

  // Test service select
  const serviceSelect = page.locator('select[name="service"]');
  await expect(serviceSelect).toBeVisible();
  await serviceSelect.selectOption('Masonry Contractors');

  // Test search button
  const searchButton = page.locator('button[type="submit"]');
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  // Check URL parameters
  await expect(page).toHaveURL(/.*search=masonry/);
  await expect(page).toHaveURL(/.*service=Masonry\+Contractors/);
});

test('should display service category cards', async ({ page }) => {
  const categoryCards = page.locator('a[href^="/directory?service="]');
  await expect(categoryCards).toHaveCount(4); // We have 4 service categories

  // Test first category card
  const firstCard = categoryCards.first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard).toContainText('Masonry Contractors');
  await expect(firstCard).toContainText('View all professionals');
});

test('should handle search results', async ({ page }) => {
  // Perform a search
  await page.fill('input[name="search"]', 'masonry');
  await page.click('button[type="submit"]');

  // Wait for results
  await page.waitForSelector('h2:has-text("Search Results")');

  // Check results container
  const resultsContainer = page.locator('.grid');
  await expect(resultsContainer).toBeVisible();

  // Check individual result cards
  const resultCards = page.locator('a[href^="/places/"]');
  await expect(resultCards).toBeVisible();
});

test('should handle no results state', async ({ page }) => {
  // Perform a search that should yield no results
  await page.fill('input[name="search"]', 'nonexistentservice12345');
  await page.click('button[type="submit"]');

  // Check for no results message
  await expect(page.locator('text=No professionals found')).toBeVisible();
});

test('should have working category navigation', async ({ page }) => {
  // Click first category card
  await page.click('a[href^="/directory?service="]:first-child');

  // Check URL and selected service
  await expect(page).toHaveURL(/.*service=/);
  await expect(page.locator('select[name="service"]')).toHaveValue(/./);
});
