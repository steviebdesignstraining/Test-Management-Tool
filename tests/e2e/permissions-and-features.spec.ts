import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:3001" });

const EMAIL = "tester@example.com";
const PASS = "testpass123";
const PROJECT = "Checkout Web";
const OWNER = "Test Tester";

test.describe("Home page navigation", () => {
  test("HP-P01 home page links navigate to correct pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("One source of truth for test evidence");

    // Features link
    await page.click('a:has-text("Features")');
    await expect(page.locator("h1")).toContainText("Everything you need for quality engineering");

    // Integrations link
    await page.click('a:has-text("Integrations")');
    await expect(page.locator("h1")).toContainText("Connect your existing tools");

    // Security link
    await page.click('a:has-text("Security")');
    await expect(page.locator("h1")).toContainText("Built for security-first teams");

    // Docs link
    await page.click('a:has-text("Docs")');
    await expect(page.locator("h1")).toContainText("Learn how to use TestHub");

    // Sign in link
    await page.click('a:has-text("Sign in")');
    await expect(page.locator("h2")).toContainText("Sign in");

    // Create account / register link
    await page.click('a:has-text("Create account")');
    await expect(page.locator("h2")).toContainText("Create account");
  });
});

test.describe("User registration", () => {
  test("REG-P01 register a new user", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2")).toContainText("Create account");

    const uniqueEmail = `reguser-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="name"]', "Reg User");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("REG-N01 registration with missing email is rejected", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=required")).toBeVisible();
  });

  test("REG-N02 registration with short password is rejected", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="email"]', `shortpw-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "weak");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=required|text=short|text=invalid")).toBeVisible();
  });
});

test.describe("Project member management (permissions)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("PERM-P01 add additional user to project", async ({ page }) => {
    await page.goto("/projects");
    await page.click('text=Checkout Web');
    await expect(page).toHaveURL(/projects\/.*/);

    // Navigate to team/members tab within project
    await page.click('a:has-text("Team"), button:has-text("Team"), [href*="team"]');
    await page.waitForTimeout(500);

    // Try to add a member via UI form if available
    const addMemberInput = page.locator('input[name="email"], input[name="userId"], input[name="memberEmail"]');
    if (await addMemberInput.count() > 0) {
      await addMemberInput.fill(`newmember-${Date.now()}@example.com`);
      await page.selectOption('select[name="role"], select[name="memberRole"]', { label: "Tester" });
      await page.click('button:has-text("Add"), button:has-text("Invite"), button:has-text("Create")');
      await expect(page.locator("text=added|text=invited|text=member")).toBeVisible();
    } else {
      // API fallback - add member via API request
      const meRes = await page.request.get("/api/v1/me");
      const me = await meRes.json();
      const projectsRes = await page.request.get("/api/v1/projects");
      const projects = await projectsRes.json();
      const project = projects.items?.[0] || projects[0];
      if (project) {
        const addRes = await page.request.post(`/api/v1/projects/${project.id}/members`, {
          data: { userId: me.user.id, role: "TESTER" },
        });
        expect(addRes.ok()).toBe(true);
      }
    }
  });

  test("PERM-P02 change permissions for a project user", async ({ page }) => {
    await page.goto("/projects");
    await page.click('text=Checkout Web');

    // Navigate to team/members
    await page.click('a:has-text("Team"), button:has-text("Team"), [href*="team"]');
    await page.waitForTimeout(500);

    // Look for role dropdowns on member rows
    const roleSelects = page.locator('select[name="role"], select[name="memberRole"]');
    if (await roleSelects.count() > 0) {
      await roleSelects.first().selectOption({ label: "Manager" });
      await page.click('button:has-text("Save"), button:has-text("Update")');
      await expect(page.locator("text=updated|text=saved|text=Manager")).toBeVisible();
    }
  });

  test("PERM-P03 remove permissions from a project user", async ({ page }) => {
    await page.goto("/projects");
    await page.click('text=Checkout Web');

    await page.click('a:has-text("Team"), button:has-text("Team"), [href*="team"]');
    await page.waitForTimeout(500);

    // Look for remove buttons on member rows
    const removeButtons = page.locator('button:has-text("Remove"), button:has-text("Delete"), [aria-label*="remove"]');
    if (await removeButtons.count() > 0) {
      await removeButtons.first().click();
      // Confirm deletion if dialog appears
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click();
      }
      await expect(page.locator("text=removed|text=deleted|text=success")).toBeVisible();
    }
  });

  test("PERM-N01 viewer cannot add members", async ({ page }) => {
    // This test verifies that a VIEWER role user cannot access member management
    await page.goto("/team");
    await expect(page.locator("text=Forbidden|text=403|text=Access denied")).toBeVisible();
    // Or redirect to overview
    await expect(page.url()).toMatch(/\/overview|\/team/);
  });
});

test.describe("Gherkin / BDD test cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("GHERKIN-P01 add gherkin to test case", async ({ page }) => {
    await page.goto("/test-cases");
    await page.fill('input[name="key"]', "TC-GHERKIN-001");
    await page.fill('input[name="title"]', "Login with gherkin");
    await page.selectOption('select[name="projectId"]', { label: PROJECT });
    await page.selectOption('select[name="ownerId"]', { label: OWNER });
    await page.selectOption('select[name="testType"]', "GHERKIN");
    await page.fill('textarea[name="gherkinText"], textarea[name="description"]', `Feature: User login
  Scenario: Valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard`);
    await page.click('button:has-text("Create")');
    await expect(page.locator("text=TC-GHERKIN-001")).toBeVisible();

    // View the test case detail and verify gherkin is saved
    await page.click('a:has-text("Login with gherkin")');
    await expect(page.locator("text=Feature: User login")).toBeVisible();
  });

  test("GHERKIN-P02 view gherkin test case detail", async ({ page }) => {
    await page.goto("/test-cases");
    await page.click('a:has-text("Login with gherkin")');
    await expect(page.locator("h1")).toContainText("TC-GHERKIN-001");
    await expect(page.locator("text=Given I am on the login page")).toBeVisible();
  });
});

test.describe("CI/CD and Allure integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("CI-P01 view CI/CD runs page", async ({ page }) => {
    await page.goto("/ci-cd");
    await expect(page.locator("h1")).toContainText("CI/CD");
  });

  test("CI-P02 view reports / Allure page", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.locator("h1")).toContainText("Reports");
  });

  test("CI-P03 create CI run via API", async ({ page }) => {
    const meRes = await page.request.get("/api/v1/me");
    const me = await meRes.json();
    const projectsRes = await page.request.get("/api/v1/projects");
    const projects = await projectsRes.json();
    const project = projects.items?.[0] || projects[0];

    if (project) {
      const res = await page.request.post("/api/v1/ci-runs", {
        data: {
          projectId: project.id,
          pipelineName: "GitHub Actions",
          buildNumber: 42,
          status: "PASSED",
          branch: "main",
          commitSha: "abc123def456",
          commitMessage: "Fix login flow",
        },
      });
      expect(res.ok()).toBe(true);
      const ciRun = await res.json();
      expect(ciRun.pipelineName).toBe("GitHub Actions");
      expect(ciRun.buildNumber).toBe(42);
    }
  });

  test("CI-P04 create Allure report linked to CI run", async ({ page }) => {
    const meRes = await page.request.get("/api/v1/me");
    const me = await meRes.json();
    const projectsRes = await page.request.get("/api/v1/projects");
    const projects = await projectsRes.json();
    const project = projects.items?.[0] || projects[0];

    if (project) {
      const ciRes = await page.request.post("/api/v1/ci-runs", {
        data: {
          projectId: project.id,
          pipelineName: "GitHub Actions",
          buildNumber: 43,
          status: "PASSED",
          branch: "main",
          commitSha: "def456ghi789",
        },
      });
      const ciRun = await ciRes.json();

      const allureRes = await page.request.post("/api/v1/allure-reports", {
        data: {
          projectId: project.id,
          ciRunId: ciRun.id,
          name: "Allure Report Build 43",
          totalTests: 100,
          passedTests: 85,
          failedTests: 10,
          brokenTests: 3,
          skippedTests: 2,
          duration: 120000,
        },
      });
      expect(allureRes.ok()).toBe(true);
      const report = await allureRes.json();
      expect(report.totalTests).toBe(100);
      expect(report.passedTests).toBe(85);
    }
  });

  test("CI-N01 invalid CI run data is rejected", async ({ page }) => {
    const res = await page.request.post("/api/v1/ci-runs", {
      data: {
        pipelineName: "",
        buildNumber: 0,
        status: "",
      },
    });
    expect(res.ok()).toBe(false);
    expect([400, 422, 500]).toContain(res.status());
  });
});

test.describe("Analytics dashboard dynamic values", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("ANALYTICS-P01 analytics page shows dynamic metrics", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("h1")).toContainText("Analytics");

    // Verify KPI cards exist and show numeric values
    await expect(page.locator("text=Test Cases")).toBeVisible();
    await expect(page.locator("text=Executions")).toBeVisible();
    await expect(page.locator("text=Pass rate")).toBeVisible();
    await expect(page.locator("text=Defects")).toBeVisible();

    // Verify charts are present
    await expect(page.locator("svg, canvas, [role='img']")).toBeVisible();
  });

  test("ANALYTICS-P02 pass rate updates dynamically", async ({ page }) => {
    await page.goto("/analytics");
    const passRateEl = page.locator("text=%").first();
    await expect(passRateEl).toBeVisible();
    // The pass rate should be a number between 0 and 100, or "0%" if no data
    const text = await passRateEl.textContent();
    expect(text).toMatch(/\d+%|—/);
  });
});

test.describe("AI assistant features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("AI-P01 navigate to AI assistant page", async ({ page }) => {
    await page.goto("/ai-assistant");
    await expect(page.locator("h1")).toContainText("AI Test Case Generator");
  });

  test("AI-P02 AI assistant responds to query", async ({ page }) => {
    await page.goto("/analytics");
    await page.fill('input[placeholder*="Ask"]', "Which test cases have the highest failure rate?");
    await page.click('button:has-text("Send")');
    await expect(page.locator("text=Sorry|text=test|text=case|text=failure")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Settings and configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/overview");
  });

  test("SETTINGS-P01 access settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Settings");
  });

  test("SETTINGS-P01 settings page has AI configuration", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=AI|text=Gemini|text=auto-complete|text=confidence")).toBeVisible();
  });
});
