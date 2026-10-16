import { prisma } from "@/lib/prisma";
import { createTestPlan } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { FIELD_LIMITS } from "@/lib/validation";

const PLAN_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default async function TestPlansPage() {
  const [plans, projects, strategies] = await Promise.all([
    prisma.testPlan.findMany({
      include: {
        project: true,
        strategy: true,
        suites: { include: { cases: { include: { testCase: { include: { executions: true } }, assignedTo: true } } } },
        _count: { select: { suites: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.testStrategy.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Plans"
        title="Test Plans"
        description="Organise test cases into plans and track progress."
        actions={
          projects.length === 0 ? (
            <span className="text-xs text-[#8F2A20]">
              No projects found. Create a project first.
            </span>
          ) : (
            <form action={createTestPlan} className="space-y-4 mt-4">
              <input type="hidden" name="status" defaultValue="DRAFT" />

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Plan name <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="name"
                  placeholder="e.g. Q1 Release Testing"
                  className="input w-full md:w-64"
                  required
                  maxLength={FIELD_LIMITS.title}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Project <span className="text-[#8F2A20]">*</span>
                </label>
                <select name="projectId" className="input" required>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Strategy <span className="text-[#8F2A20]">*</span>
                </label>
                <select name="strategyId" className="input" required>
                  <option value="">Select strategy</option>
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (v{s.version})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Strategy version
                </label>
                <input
                  name="strategyVersion"
                  placeholder="e.g. 1.0"
                  className="input w-full md:w-48"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Scope <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="scope"
                  rows={2}
                  placeholder="Features, modules and requirements included"
                  className="input w-full md:w-96"
                  required
                  maxLength={FIELD_LIMITS.description}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Exclusions
                </label>
                <input
                  name="description"
                  placeholder="Explicitly excluded testing"
                  className="input w-full md:w-72"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Entry criteria <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="entryCriteria"
                  rows={2}
                  placeholder="Conditions that must be satisfied before testing starts"
                  className="input w-full md:w-96"
                  required
                  maxLength={FIELD_LIMITS.objective}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Exit criteria <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="exitCriteria"
                  rows={2}
                  placeholder="Conditions for completion or release recommendation"
                  className="input w-full md:w-96"
                  required
                  maxLength={FIELD_LIMITS.objective}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Status
                </label>
                <select name="status" className="input">
                  {PLAN_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#C9D0D8]">
                <button className="btn-primary">Create Plan</button>
                <button type="button" className="btn-outline">Cancel</button>
              </div>
            </form>
          )
        }
      />

      {plans.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No test plans yet. Create your first plan above.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                  <th className="table-header px-4 py-3">Plan</th>
                  <th className="table-header px-4 py-3">Progress</th>
                  <th className="table-header px-4 py-3">Scope</th>
                  <th className="table-header px-4 py-3">Owner</th>
                  <th className="table-header px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                {plans.map((plan) => {
                  const totalCases = plan.suites.reduce((sum, s) => sum + s.cases.length, 0);
                  const executedCases = plan.suites.reduce((sum, s) => sum + s.cases.filter((c) => c.testCase.executions.length > 0).length, 0);
                  const pct = totalCases > 0 ? Math.round((executedCases / totalCases) * 100) : 0;
                  return (
                    <tr key={plan.id} className="hover:bg-[#EDF0F3]">
                      <td className="px-4 py-3">
                        <div className="text-[#1B2430] font-medium">
                          <Link href={`/test-plans/${plan.id}`} className="text-[#1F6F8B] hover:underline">
                            {plan.name}
                          </Link>
                        </div>
                        <div className="text-xs text-[#5B6675]">{plan.project?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-[#EDF0F3] h-2 rounded-full">
                          <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-xs text-[#5B6675] mt-1">{pct}% ({totalCases} cases)</div>
                      </td>
                      <td className="px-4 py-3 text-[#5B6675]">{plan.scope || "—"}</td>
                      <td className="px-4 py-3 text-[#5B6675]">{plan.project?.name}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/test-plans/${plan.id}`} className="btn-link mr-3">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border border-[#C9D0D8] rounded p-[28px] mt-6">
              <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Plan summary — {plan.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-[#5B6675] uppercase tracking-wider">Scope</p>
                  <p className="text-[#1B2430]">{plan.scope || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#5B6675] uppercase tracking-wider">Project</p>
                  <p className="text-[#1B2430]">{plan.project?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
