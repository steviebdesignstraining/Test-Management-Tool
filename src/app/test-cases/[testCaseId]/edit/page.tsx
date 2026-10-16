import { prisma } from "@/lib/prisma";
import { updateTestCase } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ValidatedInput } from "@/components/ValidatedInput";
import { FIELD_LIMITS } from "@/lib/validation";

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

      <div className="max-w-2xl space-y-6">
        <form action={updateTestCase} className="space-y-6">
          <input type="hidden" name="id" value={testCase.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Key"
              name="key"
              maxLength={FIELD_LIMITS.key}
              initialValue={testCase.key}
              required
            />
            <ValidatedInput
              label="Title"
              name="title"
              maxLength={FIELD_LIMITS.title}
              initialValue={testCase.title}
              required
            />
          </div>

          <ValidatedInput
            label="Description"
            name="description"
            as="textarea"
            rows={4}
            maxLength={FIELD_LIMITS.description}
            initialValue={testCase.description ?? ""}
          />

          <ValidatedInput
            label="Objective"
            name="objective"
            as="textarea"
            rows={4}
            maxLength={FIELD_LIMITS.objective}
            initialValue={testCase.objective ?? ""}
          />

          <ValidatedInput
            label="Preconditions"
            name="preconditions"
            as="textarea"
            rows={4}
            maxLength={FIELD_LIMITS.preconditions}
            initialValue={testCase.preconditions ?? ""}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Priority</label>
              <select name="priority" className="input">
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                  <option key={p} value={p} selected={testCase.priority === p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Status</label>
              <select name="status" className="input">
                {["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"].map((s) => (
                  <option key={s} value={s} selected={testCase.status === s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Test type</label>
              <select name="testType" className="input">
                <option value="">— Manual —</option>
                {["UI_AUTOMATION", "API", "DATABASE", "SECURITY", "PERFORMANCE", "ACCESSIBILITY", "BACKEND", "FRONTEND", "GHERKIN"].map((t) => (
                  <option key={t} value={t} selected={testCase.testType === t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {testCase.testType === "GHERKIN" && (
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Gherkin scenario</span>
                <span className="text-xs text-[#5B6675]">
                  {(testCase.gherkinText ?? "").length}/{FIELD_LIMITS.gherkinText}
                </span>
              </label>
              <textarea
                name="gherkinText"
                defaultValue={testCase.gherkinText ?? ""}
                maxLength={FIELD_LIMITS.gherkinText}
                className="input h-40 font-mono text-xs"
                placeholder="Feature: ...
  Scenario: ...
    Given ...
    When ...
    Then ..."
              />
            </div>
          )}

          <ValidatedInput
            label="Component"
            name="component"
            maxLength={FIELD_LIMITS.component}
            initialValue={testCase.component ?? ""}
          />

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
