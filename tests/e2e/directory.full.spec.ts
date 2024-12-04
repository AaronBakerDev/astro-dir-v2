import { test, expect } from '@playwright/test';

test.describe('Directory Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/directory');
  });

  test('main directory page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Find Local Chimney Professionals/);
    await expect(page.locator('h1')).toContainText(
      'Find Local Chimney Professionals'
    );

    // Check for location browsing
    await expect(page.locator('h2')).toContainText('Browse by Location');
    await expect(page.locator('h2')).toContainText('Browse by Service');
  });

  test('state page loads correctly', async ({ page }) => {
    // Click first state link
    const firstStateElement = await page.locator('div.bg-white h3').first();
    const firstState = (await firstStateElement.textContent()) || 'Tennessee';
    await page.click(`text=${firstState}`);

    // Verify state page
    await expect(page.locator('h1')).toContainText(
      `Find Chimney Professionals in ${firstState}`
    );
    await expect(page.locator('nav')).toContainText(firstState);
    await expect(page.locator('h2')).toContainText('Browse by City');
  });

  test('city page loads correctly', async ({ page }) => {
    // Navigate to first state
    const firstStateElement = await page.locator('div.bg-white h3').first();
    const firstState = (await firstStateElement.textContent()) || 'Tennessee';
    await page.click(`text=${firstState}`);

    // Click first city link
    const firstCityElement = await page
      .locator('a[href^="/directory/"]')
      .first();
    const firstCity = (await firstCityElement.textContent()) || 'Knoxville';
    await page.click(`text=${firstCity}`);

    // Verify city page
    await expect(page.locator('h1')).toContainText(
      `Find Chimney Professionals in ${firstCity}`
    );
    await expect(page.locator('nav')).toContainText(firstCity);
  });

  test('service category page loads correctly', async ({ page }) => {
    // Click first service category
    const firstCategoryElement = await page
      .locator('a[href^="/directory/services/"] h3')
      .first();
    const firstCategory =
      (await firstCategoryElement.textContent()) || 'Masonry Contractors';
    await page.click(`text=${firstCategory}`);

    // Verify service category page
    await expect(page.locator('h1')).toContainText(
      `Find ${firstCategory} Near You`
    );
    await expect(page.locator('nav')).toContainText(firstCategory);
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/directory');
  });

  test('search form works on main page', async ({ page }) => {
    await page.fill('input[type="search"]', 'masonry');
    await page.selectOption('select[name="service"]', 'masonry-contractors');
    await page.click('button[type="submit"]');

    await expect(page.url()).toContain('search=masonry');
    await expect(page.url()).toContain('service=masonry-contractors');
  });

  test('location filters work correctly', async ({ page }) => {
    // Select first state
    const firstStateElement = await page.locator('div.bg-white h3').first();
    const firstState = (await firstStateElement.textContent()) || 'Tennessee';
    await page.selectOption('select[name="state"]', firstState);

    // Verify city dropdown is enabled
    await expect(page.locator('select[name="city"]')).toBeEnabled();

    // Select first city
    const firstCityElement = await page
      .locator('select[name="city"] option')
      .nth(1);
    const firstCity = (await firstCityElement.textContent()) || 'Knoxville';
    await page.selectOption('select[name="city"]', firstCity);

    await page.click('button[type="submit"]');

    // Verify URL contains location parameters
    await expect(page.url()).toContain(
      `state=${encodeURIComponent(String(firstState))}`
    );
    await expect(page.url()).toContain(
      `city=${encodeURIComponent(String(firstCity))}`
    );
  });
});

test.describe('Pagination', () => {
  test('pagination controls work correctly', async ({ page }) => {
    // Go to a page that will have multiple results
    await page.goto('/directory/services/masonry-contractors');

    // Check if pagination controls exist
    const hasPagination = await page
      .locator('.flex.justify-center.gap-2')
      .isVisible();

    if (hasPagination) {
      // Click next page if available
      const hasNextPage = await page.locator('text=Next').isVisible();
      if (hasNextPage) {
        await page.click('text=Next');
        await expect(page.url()).toContain('page=2');
      }

      // Click previous page if available
      const hasPrevPage = await page.locator('text=Previous').isVisible();
      if (hasPrevPage) {
        await page.click('text=Previous');
        await expect(page.url()).toContain('page=1');
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('handles invalid state gracefully', async ({ page }) => {
    await page.goto('/directory/invalid-state');
    await expect(page.locator('text=Error')).toBeVisible();
  });

  test('handles invalid city gracefully', async ({ page }) => {
    await page.goto('/directory/Tennessee/invalid-city');
    await expect(page.locator('text=Error')).toBeVisible();
  });

  test('handles invalid service category gracefully', async ({ page }) => {
    await page.goto('/directory/services/invalid-category');
    await expect(page.locator('text=Error')).toBeVisible();
  });
});

test.describe('SEO Elements', () => {
  test('main page has correct meta tags', async ({ page }) => {
    await page.goto('/directory');

    // Check title
    await expect(page).toHaveTitle('Find Local Chimney Professionals');

    // Check meta description
    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(description).toContain('chimney');
  });

  test('state page has correct meta tags', async ({ page }) => {
    await page.goto('/directory/Tennessee');

    // Check title
    await expect(page).toHaveTitle(/Tennessee/);

    // Check meta description
    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(description).toContain('Tennessee');
  });

  test('city page has correct meta tags', async ({ page }) => {
    await page.goto('/directory/Tennessee/Knoxville');

    // Check title
    await expect(page).toHaveTitle(/Knoxville, Tennessee/);

    // Check meta description
    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(description).toContain('Knoxville');
    expect(description).toContain('Tennessee');
  });
});
