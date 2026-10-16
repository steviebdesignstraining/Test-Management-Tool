import { prisma } from "@/lib/prisma";
import { createTestCase, deleteTestCase } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BulkDeleteButton from "./BulkDeleteButton";
import StepScript from "./step-script";
import { FIELD_LIMITS } from "@/lib/validation";

const TEST_TYPES = [
  { value: "FUNCTIONAL", label: "Functional" },
  { value: "NEGATIVE", label: "Negative" },
  { value: "BOUNDARY", label: "Boundary" },
  { value: "REGRESSION", label: "Regression" },
  { value: "SMOKE", label: "Smoke" },
  { value: "EXPLORATORY", label: "Exploratory" },
  { value: "SECURITY", label: "Security" },
  { value: "ACCESSIBILITY", label: "Accessibility" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "API", label: "API" },
  { value: "DATABASE", label: "Database" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const SEVERITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const TEST_LEVELS = [
  { value: "UNIT", label: "Unit" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "SYSTEM", label: "System" },
  { value: "ACCEPTANCE", label: "Acceptance" },
];

const AUTOMATION_STATUSES = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATED", label: "Automated" },
  { value: "CANDIDATE", label: "Candidate for Automation" },
  { value: "NOT_SUITABLE", label: "Not Suitable" },
];

const TEST_ENVIRONMENTS = [
  { value: "DEVELOPMENT", label: "Development" },
  { value: "QA", label: "QA" },
  { value: "STAGING", label: "Staging" },
  { value: "PRODUCTION", label: "Production" },
];

const EXECUTION_STATUSES = [
  { value: "NOT_RUN", label: "Not Run" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "SKIPPED", label: "Skipped" },
];

export default async function TestCasesPage() {
  const [testCases, projects, users, testSuites] = await Promise.all([
    prisma.testCase.findMany({
      include: { project: true, owner: true, steps: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.testSuite.findMany({ include: { testPlan: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="hidden lg:block w-72 bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Suites</h3>
        <ul className="space-y-1 text-sm text-[#5B6675]">
          <li className="flex items-center gap-2">
            <span>▾</span>
            <span className="text-[#1B2430] font-medium">All cases</span>
          </li>
          {projects.map((project) => (
            <li key={project.id} className="pl-4 mb-3">
              <span>▸</span>
              <Link
                href={`/test-cases?project=${project.id}`}
                className="text-[#1F6F8B] hover:underline font-medium"
              >
                {project.name}
              </Link>
            </li>
          ))}
          {testSuites.map((suite) => (
            <li key={suite.id} className="pl-8">
              <span>▸</span>
              <Link
                href={`/test-cases?suite=${suite.id}`}
                className="text-[#1F6F8B] hover:underline text-xs"
              >
                {suite.name} ({suite.testPlan?.name || "No plan"})
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex-1 space-y-6">
        {/* Create Test Case Form */}
        <div className="bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
          <PageHeader
            breadcrumb="Test Cases"
            title="Create Test Case"
            description="Define a new test case with steps, expected results, and execution tracking."
            actions={
              projects.length === 0 ? (
                <span className="text-xs text-[#8F2A20]">
                  No projects found. Create a project first.
                </span>
              ) : null
            }
          />

          {projects.length === 0 && (
            <div className="bg-[#FBE7E4] border border-[#C9D0D8] rounded p-4 mt-4">
              <p className="text-sm text-[#8F2A20]">
                You must create a project before you can create test cases. Go to{" "}
                <Link href="/projects" className="text-[#1F6F8B] hover:underline font-medium">
                  Projects
                </Link>
                to create one.
              </p>
            </div>
          )}

          {projects.length > 0 && (
            <form action={createTestCase} className="space-y-6 mt-4">
              <input type="hidden" name="key" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Test Case ID
                  </label>
                  <input
                    name="title"
                    placeholder="e.g. Verify login with valid credentials"
                    className="input w-full"
                    required
                    maxLength={FIELD_LIMITS.title}
                  />
                  <p className="text-xs text-[#5B6675]">
                    The ID will be auto-generated (e.g. TC-LOGIN-001).
                  </p>
                </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Project <span className="text-[#8F2A20]">*</span>
                </label>
                <select name="projectId" className="input" required>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Test suite
                </label>
                <select name="testSuiteId" className="input">
                  <option value="">No suite</option>
                  {testSuites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Owner / Author <span className="text-[#8F2A20]">*</span>
                </label>
                <select name="ownerId" className="input" required>
                  <option value="">Select owner</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Reviewer / Approver
                </label>
                <select name="reviewerId" className="input">
                  <option value="">No reviewer assigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Test Case Type
                  </label>
                  <select name="testType" className="input">
                    <option value="">Select type</option>
                    {TEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Priority
                  </label>
                  <select name="priority" className="input">
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Severity
                  </label>
                  <select name="severity" className="input">
                    {SEVERITIES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Test Level
                  </label>
                  <select name="testLevel" className="input">
                    <option value="">Select level</option>
                    {TEST_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Test Technique
                  </label>
                  <select name="testTechnique" className="input">
                    <option value="">Select technique</option>
                    <option value="EQUIVALENCE_PARTITIONING">Equivalence Partitioning</option>
                    <option value="BOUNDARY_VALUE_ANALYSIS">Boundary Value Analysis</option>
                    <option value="DECISION_TABLE">Decision Table</option>
                    <option value="STATE_TRANSITION">State Transition</option>
                    <option value="USE_CASE">Use Case</option>
                    <option value="PAIRWISE">Pairwise / Combinatorial</option>
                    <option value="ERROR_GUESSING">Error Guessing</option>
                    <option value="EXPLORATORY">Exploratory</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Automation Status
                  </label>
                  <select name="automationStatus" className="input">
                    {AUTOMATION_STATUSES.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Test Environment
                  </label>
                  <select name="testEnvironment" className="input">
                    <option value="">Select environment</option>
                    {TEST_ENVIRONMENTS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Module / Feature
                </label>
                <input
                  name="component"
                  placeholder="e.g. Login, Checkout, API Gateway"
                  className="input w-full"
                  maxLength={FIELD_LIMITS.component}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Requirement / User Story ID
                  </label>
                  <input
                    name="requirementLinks"
                    placeholder="e.g. REQ-001, US-042"
                    className="input w-full"
                  />
                  <p className="text-xs text-[#5B6675]">
                    Comma-separated requirement IDs for traceability.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                    Tags / Labels
                  </label>
                  <input
                    name="labels"
                    placeholder="e.g. smoke, critical, api"
                    className="input w-full"
                  />
                  <p className="text-xs text-[#5B6675]">
                    Comma-separated tags for filtering.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Automation Script / Link
                </label>
                <input
                  name="automationScriptLink"
                  placeholder="URL or path to automated test script"
                  className="input w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Estimated Duration (minutes)
                </label>
                <input
                  name="estimatedDuration"
                  type="number"
                  min="0"
                  placeholder="e.g. 30"
                  className="input w-40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Objective / Description <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="objective"
                  rows={3}
                  placeholder="Explains the purpose of the test and the behaviour being verified."
                  className="input w-full"
                  required
                  maxLength={FIELD_LIMITS.objective}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Preconditions <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="preconditions"
                  rows={3}
                  placeholder="Conditions that must be met before execution."
                  className="input w-full"
                  required
                  maxLength={FIELD_LIMITS.preconditions}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Test Data
                </label>
                <textarea
                  name="testData"
                  rows={3}
                  placeholder="Inputs, accounts or data required. Enter 'Not applicable' if not needed."
                  className="input w-full"
                  maxLength={FIELD_LIMITS.testData}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Expected Results <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Defines the correct outcome for each step or for the overall test."
                  className="input w-full"
                  required
                  maxLength={FIELD_LIMITS.description}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Execution Status
                </label>
                <select name="status" className="input">
                  {EXECUTION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Actual Result
                </label>
                <textarea
                  name="actualResult"
                  rows={3}
                  placeholder="Records what happened when the test was run."
                  className="input w-full"
                  maxLength={FIELD_LIMITS.description}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[#1B2430] uppercase tracking-wider">
                  Test Steps
                </h4>
                <p className="text-xs text-[#5B6675]">
                  Numbered, clear and repeatable actions the tester must perform.
                </p>
                <div id="test-steps-container" className="space-y-3">
                  <div className="border border-[#C9D0D8] rounded p-3 bg-[#F5F7F9]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#5B6675]">Step 1</span>
                      <button
                        type="button"
                        className="text-xs text-[#8F2A20] hover:underline"
                        onClick={() => {
                          const btn = document.activeElement as HTMLButtonElement;
                          (window as any).removeStep(btn);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <input
                          name="stepActions"
                          placeholder="Step action"
                          className="input w-full text-sm"
                          required
                        />
                      </div>
                      <div>
                        <input
                          name="stepExpectedResults"
                          placeholder="Expected result"
                          className="input w-full text-sm"
                          required
                        />
                      </div>
                      <div>
                        <input
                          name="stepData"
                          placeholder="Test data (optional)"
                          className="input w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-outline text-xs px-3 py-1.5"
                  onClick={() => (window as any).addStep()}
                >
                  + Add Step
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="btn-primary">Create Test Case</button>
                <Link href="/test-cases" className="btn-outline">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Test Cases List */}
        <div className="space-y-4">
          {testCases.length === 0 ? (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
              <p className="text-sm text-[#5B6675]">No test cases yet. Create your first test case above.</p>
            </div>
          ) : (
            <div>
              <BulkDeleteButton />

              <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F5F7F9]">
                    <tr>
                      <th className="table-header px-4 py-3 w-20"><input type="checkbox" /></th>
                      <th className="table-header px-4 py-3">ID</th>
                      <th className="table-header px-4 py-3">Title</th>
                      <th className="table-header px-4 py-3">Type</th>
                      <th className="table-header px-4 py-3">Priority</th>
                      <th className="table-header px-4 py-3">Severity</th>
                      <th className="table-header px-4 py-3">Status</th>
                      <th className="table-header px-4 py-3">Automation</th>
                      <th className="table-header px-4 py-3">Owner</th>
                      <th className="table-header px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9D0D8]">
                    {testCases.map((tc) => (
                      <tr key={tc.id} className="hover:bg-[#EDF0F3]">
                        <td className="px-4 py-3">
                          <input type="checkbox" name="ids" value={tc.id} />
                        </td>
                        <td className="px-4 py-3 text-[#1B2430] font-medium">
                          {tc.key}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/test-cases/${tc.id}`} className="text-[#1F6F8B] hover:underline">
                            {tc.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {tc.testType ? (
                            <span className="badge status-accent">{tc.testType}</span>
                          ) : (
                            <span className="text-[#5B6675]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${tc.priority === "HIGH" || tc.priority === "CRITICAL" ? "status-fail" : tc.priority === "MEDIUM" ? "status-blocked" : "status-neutral"}`}>
                            {tc.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge status-neutral">{tc.severity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${tc.status === "PASSED" ? "status-pass" : tc.status === "FAILED" ? "status-fail" : tc.status === "BLOCKED" ? "status-warn" : "status-neutral"}`}>
                            {tc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#5B6675]">{tc.automationStatus}</td>
                        <td className="px-4 py-3 text-[#5B6675]">{tc.owner?.name || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/test-cases/${tc.id}`} className="btn-link mr-3">
                            View
                          </Link>
                          <Link href={`/test-cases/${tc.id}/edit`} className="btn-link mr-3">
                            Edit
                          </Link>
                          <form action={deleteTestCase} className="inline-block">
                            <input type="hidden" name="id" value={tc.id} />
                            <button className="btn-destructive">Delete</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <StepScript></StepScript>
    </div>
  );
}
