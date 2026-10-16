import { prisma } from "@/lib/prisma";
import { updateTestCase } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function TestCaseEditPage({
  params,
}: {
  params: Promise<{ testCaseId: string }>;
}) {
  const { testCaseId } = await params;
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: { project: true, owner: true },
  });

  if (!testCase) {
    return <div className="p-[28px]">Test case not found.</div>;
  }

  const [projects, users] = await Promise.all([
    prisma.project.findMany(),
    prisma.user.findMany(),
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

      <div className="max-w-2xl space-y-4">
        <form action={updateTestCase} className="space-y-6">
          <input type="hidden" name="id" value={testCase.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Key</label>
              <input name="key" defaultValue={testCase.key} className="input" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Title</label>
              <input name="title" defaultValue={testCase.title} className="input" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Description</label>
            <textarea name="description" defaultValue={testCase.description ?? ""} className="input h-24" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Objective</label>
            <textarea name="objective" defaultValue={testCase.objective ?? ""} className="input h-24" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Preconditions</label>
            <textarea name="preconditions" defaultValue={testCase.preconditions ?? ""} className="input h-24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Priority</label>
              <select name="priority" className="input">
                <option value="HIGH" selected={testCase.priority === "HIGH"}>High</option>
                <option value="MEDIUM" selected={testCase.priority === "MEDIUM"}>Medium</option>
                <option value="LOW" selected={testCase.priority === "LOW"}>Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Status</label>
              <select name="status" className="input">
                <option value="DRAFT" selected={testCase.status === "DRAFT"}>Draft</option>
                <option value="REVIEW" selected={testCase.status === "REVIEW"}>Review</option>
                <option value="APPROVED" selected={testCase.status === "APPROVED"}>Approved</option>
                <option value="ARCHIVED" selected={testCase.status === "ARCHIVED"}>Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Test type</label>
              <select name="testType" className="input">
                <option value="">— Manual —</option>
                <option value="UI_AUTOMATION" selected={testCase.testType === "UI_AUTOMATION"}>UI Automation</option>
                <option value="API" selected={testCase.testType === "API"}>API</option>
                <option value="DATABASE" selected={testCase.testType === "DATABASE"}>Database</option>
                <option value="SECURITY" selected={testCase.testType === "SECURITY"}>Security</option>
                <option value="PERFORMANCE" selected={testCase.testType === "PERFORMANCE"}>Performance</option>
                <option value="ACCESSIBILITY" selected={testCase.testType === "ACCESSIBILITY"}>Accessibility</option>
                <option value="BACKEND" selected={testCase.testType === "BACKEND"}>Backend</option>
                <option value="FRONTEND" selected={testCase.testType === "FRONTEND"}>Frontend</option>
                <option value="GHERKIN" selected={testCase.testType === "GHERKIN"}>Gherkin / BDD</option>
              </select>
            </div>
          </div>

          {testCase.testType === "GHERKIN" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Gherkin scenario</label>
              <textarea
                name="gherkinText"
                defaultValue={testCase.gherkinText ?? ""}
                className="input h-40 font-mono text-xs"
                placeholder="Feature: ...&#10;  Scenario: ...&#10;    Given ...&#10;    When ...&#10;    Then ..."
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Component</label>
            <input name="component" defaultValue={testCase.component ?? ""} className="input" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Project</label>
              <select name="projectId" className="input" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} selected={testCase.projectId === p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Owner</label>
              <select name="ownerId" className="input" required>
                <option value="">Select owner</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} selected={testCase.ownerId === u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
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
