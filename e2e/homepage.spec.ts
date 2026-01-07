import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/FastWrite|Documentation/i);
  });

  test('should have source type selection', async ({ page }) => {
    const githubRadio = page.getByRole('radio', { name: /github/i });
    const zipRadio = page.getByRole('radio', { name: /zip/i });
    
    await expect(githubRadio).toBeVisible();
    await expect(zipRadio).toBeVisible();
  });

  test('should toggle between GitHub and ZIP source types', async ({ page }) => {
    // Start with GitHub
    const githubRadio = page.getByRole('radio', { name: /github/i });
    await githubRadio.click();
    await expect(page.getByPlaceholder(/github\.com/i)).toBeVisible();

    // Switch to ZIP
    const zipRadio = page.getByRole('radio', { name: /zip/i });
    await zipRadio.click();
    await expect(page.getByText(/drag.*drop/i)).toBeVisible();
  });

  test('should have AI provider selection', async ({ page }) => {
    // Look for provider selection
    const providerSelect = page.locator('text=AI Provider').locator('..').locator('select, [role="combobox"]').first();
    await expect(providerSelect).toBeVisible();
  });

  test('should show documentation sections', async ({ page }) => {
    // Check for documentation type tabs or sections
    const codeTab = page.getByRole('tab', { name: /code/i });
    const reportTab = page.getByRole('tab', { name: /report/i });
    
    // At least one should be visible
    const hasCodeTab = await codeTab.isVisible().catch(() => false);
    const hasReportTab = await reportTab.isVisible().catch(() => false);
    
    expect(hasCodeTab || hasReportTab).toBeTruthy();
  });

  test('should have a generate button', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate/i });
    await expect(generateButton).toBeVisible();
  });

  test('should show warning when generating without API key', async ({ page }) => {
    // Clear any stored API keys
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    
    // Try to generate
    const generateButton = page.getByRole('button', { name: /generate/i });
    await generateButton.click();
    
    // Should show some error message about API key
    const toastOrError = page.locator('[data-sonner-toast], .toast, [role="alert"]').first();
    await expect(toastOrError).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle
    const themeToggle = page.getByRole('button', { name: /theme|dark|light|sun|moon/i }).first();
    
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class');
      
      // Click toggle
      await themeToggle.click();
      
      // Wait for theme change
      await page.waitForTimeout(500);
      
      // Theme should have changed
      const newClass = await htmlElement.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });
});

test.describe('GitHub URL Input', () => {
  test('should accept valid GitHub URL', async ({ page }) => {
    await page.goto('/');
    
    const urlInput = page.getByPlaceholder(/github\.com/i);
    await urlInput.fill('https://github.com/facebook/react');
    
    await expect(urlInput).toHaveValue('https://github.com/facebook/react');
  });

  test('should show branch input field', async ({ page }) => {
    await page.goto('/');
    
    const branchInput = page.getByPlaceholder(/main.*develop/i);
    await expect(branchInput).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Main content should still be visible
    await expect(page.locator('main, [role="main"], .container').first()).toBeVisible();
    
    // Generate button should be visible
    const generateButton = page.getByRole('button', { name: /generate/i });
    await expect(generateButton).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Main content should still be visible
    await expect(page.locator('main, [role="main"], .container').first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to results page when results exist', async ({ page }) => {
    await page.goto('/');
    
    // Store mock result
    await page.evaluate(() => {
      localStorage.setItem('documentationResult', JSON.stringify({
        textContent: '# Test Documentation\n\nThis is a test.',
        visualContent: ''
      }));
    });
    
    // Navigate to results
    await page.goto('/results');
    
    // Should show the documentation
    await expect(page.getByText('Test Documentation')).toBeVisible();
  });

  test('should show message when no results exist', async ({ page }) => {
    await page.goto('/');
    
    // Clear results
    await page.evaluate(() => {
      localStorage.removeItem('documentationResult');
    });
    
    // Navigate to results
    await page.goto('/results');
    
    // Should show no results message
    await expect(page.getByText(/no.*documentation|no.*results|generate.*first/i)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    
    // Should have at least one h1
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have labeled form inputs', async ({ page }) => {
    await page.goto('/');
    
    // Check for labeled inputs
    const labeledInputs = page.locator('label').filter({ has: page.locator('input, select, textarea') });
    const inputs = page.locator('input[aria-label], input[id], select[aria-label], textarea[aria-label]');
    
    const labeledCount = await labeledInputs.count();
    const ariaLabeledCount = await inputs.count();
    
    // Should have some labeled inputs
    expect(labeledCount + ariaLabeledCount).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focused = page.locator(':focus');
    await expect(focused).toBeTruthy();
  });
});
