export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TestFlow API",
    version: "1.0.0",
    description: "Test Management Platform REST API",
  },
  servers: [
    { url: "/api/v1", description: "API v1" },
    { url: "http://localhost:3001/api/v1", description: "Local development" },
  ],
  tags: [
    { name: "Auth", description: "Authentication and identity" },
    { name: "Organisations", description: "Organisations and workspaces" },
    { name: "Projects", description: "Projects" },
    { name: "TestCases", description: "Test cases" },
    { name: "TestPlans", description: "Test plans and suites" },
    { name: "Executions", description: "Test runs and executions" },
    { name: "Defects", description: "Defect management" },
    { name: "Automation", description: "Automation and CI/CD" },
    { name: "AI", description: "AI assistant and reconciliation" },
    { name: "Integrations", description: "Third-party integrations" },
    { name: "System", description: "Health and system" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "User created" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Logged in" } },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out",
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        responses: { "200": { description: "Current user" } },
      },
      patch: {
        tags: ["Auth"],
        summary: "Update current user",
        responses: { "200": { description: "Updated" } },
      },
    },
    "/organisations": {
      get: {
        tags: ["Organisations"],
        summary: "List organisations",
        responses: { "200": { description: "List of organisations" } },
      },
      post: {
        tags: ["Organisations"],
        summary: "Create organisation",
        responses: { "201": { description: "Created" } },
      },
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects",
        responses: { "200": { description: "List of projects" } },
      },
      post: {
        tags: ["Projects"],
        summary: "Create project",
        responses: { "201": { description: "Created" } },
      },
    },
    "/projects/{projectId}/test-cases": {
      get: {
        tags: ["TestCases"],
        summary: "List test cases",
        responses: { "200": { description: "List of test cases" } },
      },
      post: {
        tags: ["TestCases"],
        summary: "Create test case",
        responses: { "201": { description: "Created" } },
      },
    },
    "/test-cases/{testCaseId}": {
      get: {
        tags: ["TestCases"],
        summary: "Get test case",
        responses: { "200": { description: "Test case" } },
      },
      patch: {
        tags: ["TestCases"],
        summary: "Update test case",
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        tags: ["TestCases"],
        summary: "Delete test case",
        responses: { "200": { description: "Deleted" } },
      },
    },
    "/test-plans": {
      get: {
        tags: ["TestPlans"],
        summary: "List test plans",
        responses: { "200": { description: "List of test plans" } },
      },
      post: {
        tags: ["TestPlans"],
        summary: "Create test plan",
        responses: { "201": { description: "Created" } },
      },
    },
    "/defects": {
      get: {
        tags: ["Defects"],
        summary: "List defects",
        responses: { "200": { description: "List of defects" } },
      },
      post: {
        tags: ["Defects"],
        summary: "Create defect",
        responses: { "201": { description: "Created" } },
      },
    },
    "/ci-connections": {
      get: {
        tags: ["Automation"],
        summary: "List CI/CD connections",
        responses: { "200": { description: "List of connections" } },
      },
      post: {
        tags: ["Automation"],
        summary: "Create CI/CD connection",
        responses: { "201": { description: "Created" } },
      },
    },
    "/analytics/overview": {
      get: {
        tags: ["System"],
        summary: "Analytics overview",
        responses: { "200": { description: "Analytics data" } },
      },
    },
  },
  components: {
    schemas: {},
  },
};
