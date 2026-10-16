import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3001" });

test.describe("TestHub full user journey", () => {
  test("sign in, create project, test case, execute, create defect", async ({ page }) => {
    // 1. Sign in
    await page.goto("/sign-in");
    await expect(page.locator("h2")).toContainText("Sign in");
    await page.fill('input[type="email"]', "tester@example.com");
    await page.fill('input[type="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");

    // 2. Verify overview shows data
    await expect(page.locator("h1")).toContainText("Overview");

    // 3. Create a project
    await page.goto("/projects");
    await expect(page.locator("h1")).toContainText("Projects");
    await page.fill('input[name="name"]', "E2E Test Project");
    await page.click('button:has-text("Create")');
    await expect(page.locator("text=E2E Test Project").first()).toBeVisible();

    // 4. Create a test case
    await page.goto("/test-cases");
    await expect(page.locator("h1")).toContainText("Test Cases");
    await page.fill('input[name="key"]', "TC-E2E-001");
    await page.fill('input[name="title"]', "E2E login test case");
    await page.selectOption('select[name="projectId"]', { label: "Checkout Web" });
    await page.selectOption('select[name="ownerId"]', { label: "Test Tester" });
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);
    await expect(page.locator("span:has-text('TC-E2E-001')")).toBeVisible();

    // 5. View test case detail
    await page.click('a:has-text("E2E login test case")');
    await expect(page.locator("h1")).toContainText("TC-E2E-001");

    // 6. Create a test run/execution
    await page.goto("/test-runs");
    await expect(page.locator("h1")).toContainText("Test Runs");
    await page.selectOption('select[name="testCaseId"]', { label: "TC-E2E-001 — E2E login test case" });
    await page.selectOption('select[name="status"]', "PASSED");
    await page.selectOption('select[name="testerId"]', { label: "Test Tester" });
    await page.click('button:has-text("Run")');
    await expect(page.locator("span:has-text('TC-E2E-001')")).toBeVisible();

    // 7. Create a defect
    await page.goto("/defects");
    await expect(page.locator("h1")).toContainText("Defects");
    await page.fill('input[name="title"]', "E2E test defect");
    await page.selectOption('select[name="severity"]', "HIGH");
    await page.selectOption('select[name="reporterId"]', { label: "Test Tester" });
    await page.click('button:has-text("Report")');
    await expect(page.locator("text=E2E test defect").first()).toBeVisible();

    // 8. View defect detail
    await page.locator("text=E2E test defect").first().click();
    await expect(page.locator("h1")).toContainText("E2E test defect");
  });
});
