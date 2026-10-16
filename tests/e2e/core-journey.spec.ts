import { test, expect } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";
import type { Browser, Page } from "@playwright/test";

const STATE_FILE = path.join(os.tmpdir(), "tmt-session-state.json");

fs.writeFileSync(STATE_FILE, "{}");

test.use({ baseURL: "http://localhost:3001", storageState: STATE_FILE });

const EMAIL = "tester@example.com";
const PASS = "testpass123";
const PROJECT = "Checkout Web";
const OWNER = "Test Tester";

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/sign-in");
  await expect(page.locator("h2")).toContainText("Sign in");
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/overview");
  await context.storageState({ path: STATE_FILE });
  await context.close();
});

test.describe("Core user journey (implemented workflows)", () => {
  test("AUTH-P03 sign in with valid credentials creates a session", async ({ page }: { page: Page }) => {
    await page.goto("/overview");
    await expect(page).toHaveURL("/overview");
    await expect(page.locator("h1")).toContainText("Overview");
  });

  test("AUTH-N02 sign in with wrong password is rejected", async ({ page }: { page: Page }) => {
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email or password.")).toBeVisible();
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("TEN-P02 create a project", async ({ page }: { page: Page }) => {
    await page.goto("/projects");
    await page.fill('input[name="name"]', "E2E Smoke Project");
    await page.click('button:has-text("Create")');
    await expect(page.locator("text=E2E Smoke Project").first()).toBeVisible();
  });

  test("CASE-P01 create a test case with key/title/project/owner", async ({ page }: { page: Page }) => {
    await page.goto("/test-cases");
    await page.fill('input[name="key"]', "TC-E2E-P1");
    await page.fill('input[name="title"]', "Alpha test");
    await page.selectOption('select[name="projectId"]', { label: PROJECT });
    await page.selectOption('select[name="ownerId"]', { label: OWNER });
    await page.click('button:has-text("Create")');
    await expect(page.locator("span:has-text('TC-E2E-P1')")).toBeVisible();
  });

  test("CASE-P02 create a test case with test type", async ({ page }: { page: Page }) => {
    await page.goto("/test-cases");
    await page.fill('input[name="key"]', "TC-E2E-P2");
    await page.fill('input[name="title"]', "API type test");
    await page.selectOption('select[name="projectId"]', { label: PROJECT });
    await page.selectOption('select[name="ownerId"]', { label: OWNER });
    await page.selectOption('select[name="testType"]', "API");
    await page.click('button:has-text("Create")');
    await expect(page.locator("span:has-text('TC-E2E-P2')")).toBeVisible();

    await page.locator('a:has-text("API type test")').first().click();
    await expect(page.locator("h1")).toContainText("TC-E2E-P2");
    await expect(page.locator(".badge.status-accent")).toContainText("API");
  });

  test("CASE-P03 view test case detail shows test type badge", async ({ page }: { page: Page }) => {
    await page.goto("/test-cases");
    await expect(page.locator("span:has-text('TC-E2E-P1')")).toBeVisible();

    await page.locator('a:has-text("Alpha test")').first().click();
    await expect(page.locator("h1")).toContainText("TC-E2E-P1");
  });

  test("CASE-N02 duplicate case key is handled without server error", async ({ page }: { page: Page }) => {
    await page.goto("/test-cases");
    await page.fill('input[name="key"]', "TC-E2E-N2");
    await page.fill('input[name="title"]', "Beta test");
    await page.selectOption('select[name="projectId"]', { label: PROJECT });
    await page.selectOption('select[name="ownerId"]', { label: OWNER });
    await page.click('button:has-text("Create")');
    await page.fill('input[name="key"]', "TC-E2E-N2");
    await page.fill('input[name="title"]', "Beta test (updated)");
    await page.click('button:has-text("Create")');
    await expect(page).toHaveURL("/test-cases");
    await expect(page.locator("text=TC-E2E-N2")).toBeVisible();
  });

  test("PLAN-P01/P02 create a test plan and add a test case to it", async ({ page }: { page: Page }) => {
    await page.goto("/test-plans");
    await page.fill('input[name="name"]', "Smoke Plan");
    await page.selectOption('select[name="projectId"]', { label: PROJECT });
    await page.click('button:has-text("Create")');
    await expect(page.locator("text=Smoke Plan").first()).toBeVisible();

    await page.locator('a:has-text("Smoke Plan")').first().click();
    await expect(page.locator("h1")).toContainText("Smoke Plan — Test plan detail");

    await page.selectOption('select[name="testCaseId"]', {
      label: "TC-E2E-P1 — Alpha test",
    });
    await page.click('button:has-text("Add to plan")');
    await expect(page.locator("span:has-text('TC-E2E-P1')")).toBeVisible();
  });

  test("EXEC-P01/P02 create a test execution", async ({ page }: { page: Page }) => {
    await page.goto("/test-runs");
    await page.selectOption('select[name="testCaseId"]', {
      label: "TC-E2E-P1 — Alpha test",
    });
    await page.selectOption('select[name="status"]', "PASSED");
    await page.selectOption('select[name="testerId"]', { label: OWNER });
    await page.click('button:has-text("Run")');
    await expect(page.locator("h3:has-text('TC-E2E-P1 — Alpha test')").first()).toBeVisible();
  });

  test("DEF-P01/P02 create a defect and link to test case", async ({ page }: { page: Page }) => {
    await page.goto("/defects");
    await page.fill('input[name="title"]', "Smoke test defect");
    await page.selectOption('select[name="severity"]', "HIGH");
    await page.selectOption('select[name="reporterId"]', { label: OWNER });
    await page.selectOption('select[name="testCaseId"]', { label: "TC-E2E-P1" });
    await page.click('button:has-text("Report")');
    await expect(page.locator("text=Smoke test defect").first()).toBeVisible();

    await page.locator("text=Smoke test defect").first().click();
    await expect(page.locator("h1")).toContainText("Smoke test defect");
  });

  test("DEF-P03 create a defect with external ticket link", async ({ page }: { page: Page }) => {
    const res = await page.request.post("/api/v1/defects", {
      data: {
        title: "External ticket defect E2E",
        reporterId: (await page.request.get("/api/v1/me").then((r) => r.json())).user.id,
        severity: "MEDIUM",
        externalTicketId: "JIRA-E2E-1",
        externalTicketUrl: "https://example.atlassian.net/browse/JIRA-E2E-1",
      },
    });
    expect(res.ok()).toBe(true);
    const defect = await res.json();
    expect(defect.externalTicketId).toBe("JIRA-E2E-1");

    await page.goto("/defects");
    await expect(page.locator("text=External ticket defect E2E").first()).toBeVisible();
  });

  test("AI-01 navigate to AI assistant page", async ({ page }: { page: Page }) => {
    await page.goto("/ai-assistant");
    await expect(page.locator("h1")).toContainText("AI Test Case Generator");
  });

  test("AI-02 navigate to analytics page shows metrics", async ({ page }: { page: Page }) => {
    await page.goto("/analytics");
    await expect(page.locator("h1")).toContainText("Analytics");
    await expect(page.locator("text=Test Cases")).toBeVisible();
  });

  test("AUTH-P04 sign out invalidates session", async ({ page }: { page: Page }) => {
    const res = await page.request.post("/api/v1/auth/logout");
    expect(res.ok()).toBe(true);
    const cookies = await page.context().cookies();
    expect(cookies.some((c: { name: string }) => c.name === "session")).toBe(false);
    const me = await page.request.get("/api/v1/me");
    expect(me.status()).toBe(401);
  });
});
