import { prisma } from "@/lib/prisma";
import { updateTestCase } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ValidatedInput } from "@/components/ValidatedInput";
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

export default async function TestCaseEditPage({
  params,
}: {
  params: Promise<{ testCaseId: string }>;
}) {
  const { testCaseId } = await params;
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: { project: true, owner: true, requirementLinks: { include: { requirement: true } } },
  });

  if (!testCase) {
    return <div className="p-[28px]">Test case not found.</div>;
  }

  const [projects, users] = await Promise.all([
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Cases"
        title={`Edit ${testCase.key}`}
        description="Edit test case details."
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/test-cases/${testCaseId}`} className="btn-link text-sm mr-3">
              Cancel
            </Link>
          </div>
        }
      />

      <div className="max-w-4xl space-y-6">
        <form action={updateTestCase} className="space-y-6">
          <input type="hidden" name="id" value={testCase.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Test Case ID
              </label>
              <input
                name="key"
                className="input w-full"
                value={testCase.key}
                readOnly
              />
              <p className="text-xs text-[#5B6675]">Auto-generated, cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Project <span className="text-[#8F2A20]">*</span>
              </label>
              <select name="projectId" className="input" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} selected={testCase.projectId === p.id}>
                    {p.name}
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
                <option key={u.id} value={u.id} selected={testCase.ownerId === u.id}>
                  {u.name || u.email}
                </option>
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
                <option key={u.id} value={u.id} selected={testCase.reviewerId === u.id}>
                  {u.name || u.email}
                </option>
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
                  <option key={t.value} value={t.value} selected={testCase.testType === t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Priority
              </label>
              <select name="priority" className="input">
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} selected={testCase.priority === p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Severity
              </label>
              <select name="severity" className="input">
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value} selected={testCase.severity === s.value}>
                    {s.label}
                  </option>
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
                  <option key={l.value} value={l.value} selected={testCase.testLevel === l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Test Technique
              </label>
              <select name="testTechnique" className="input">
                <option value="">Select technique</option>
                <option value="EQUIVALENCE_PARTITIONING" selected={testCase.testTechnique === "EQUIVALENCE_PARTITIONING"}>Equivalence Partitioning</option>
                <option value="BOUNDARY_VALUE_ANALYSIS" selected={testCase.testTechnique === "BOUNDARY_VALUE_ANALYSIS"}>Boundary Value Analysis</option>
                <option value="DECISION_TABLE" selected={testCase.testTechnique === "DECISION_TABLE"}>Decision Table</option>
                <option value="STATE_TRANSITION" selected={testCase.testTechnique === "STATE_TRANSITION"}>State Transition</option>
                <option value="USE_CASE" selected={testCase.testTechnique === "USE_CASE"}>Use Case</option>
                <option value="PAIRWISE" selected={testCase.testTechnique === "PAIRWISE"}>Pairwise / Combinatorial</option>
                <option value="ERROR_GUESSING" selected={testCase.testTechnique === "ERROR_GUESSING"}>Error Guessing</option>
                <option value="EXPLORATORY" selected={testCase.testTechnique === "EXPLORATORY"}>Exploratory</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Automation Status
              </label>
              <select name="automationStatus" className="input">
                {AUTOMATION_STATUSES.map((a) => (
                  <option key={a.value} value={a.value} selected={testCase.automationStatus === a.value}>
                    {a.label}
                  </option>
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
                  <option key={e.value} value={e.value} selected={testCase.testEnvironment === e.value}>
                    {e.label}
                  </option>
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
              className="input w-full"
              value={testCase.component || ""}
              maxLength={FIELD_LIMITS.component}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Requirement / User Story IDs
              </label>
              <input
                name="requirementLinks"
                className="input w-full"
                value={testCase.requirementLinks?.map((rl) => rl.requirement.key).join(", ") || ""}
                placeholder="e.g. REQ-001, US-042"
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
                className="input w-full"
                value={testCase.labels?.join(", ") || ""}
                placeholder="e.g. smoke, critical, api"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Automation Script / Link
            </label>
            <input
              name="automationScriptLink"
              className="input w-full"
              value={testCase.automationScriptLink || ""}
              placeholder="URL or path to automated test script"
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
              className="input w-40"
              value={testCase.estimatedDuration || ""}
            />
          </div>

          <ValidatedInput
            label="Title <span className='text-[#8F2A20] ml-1 text-xs'>*</span>"
            name="title"
            maxLength={FIELD_LIMITS.title}
            initialValue={testCase.title}
            required
          />

          <ValidatedInput
            label="Objective / Description <span className='text-[#8F2A20] ml-1 text-xs'>*</span>"
            name="objective"
            as="textarea"
            rows={3}
            maxLength={FIELD_LIMITS.objective}
            initialValue={testCase.objective || ""}
            required
          />

          <ValidatedInput
            label="Preconditions <span className='text-[#8F2A20] ml-1 text-xs'>*</span>"
            name="preconditions"
            as="textarea"
            rows={3}
            maxLength={FIELD_LIMITS.preconditions}
            initialValue={testCase.preconditions || ""}
            required
          />

          <ValidatedInput
            label="Test Data"
            name="testData"
            as="textarea"
            rows={3}
            maxLength={FIELD_LIMITS.testData}
            initialValue={testCase.testData || ""}
          />

          <ValidatedInput
            label="Expected Results <span className='text-[#8F2A20] ml-1 text-xs'>*</span>"
            name="description"
            as="textarea"
            rows={4}
            maxLength={FIELD_LIMITS.description}
            initialValue={testCase.description || ""}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Execution Status
              </label>
              <select name="status" className="input">
                {EXECUTION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value} selected={testCase.status === s.value}>
                    {s.label}
                  </option>
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
                className="input w-full"
                placeholder="Records what happened when the test was run."
                maxLength={FIELD_LIMITS.description}
                defaultValue={testCase.actualResult || ""}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button className="btn-primary">Save changes</button>
            <Link href={`/test-cases/${testCaseId}`} className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
