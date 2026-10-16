import { prisma } from "@/lib/prisma";
import { createTestPlan } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function TestPlansPage() {
  const [plans, projects] = await Promise.all([
    prisma.testPlan.findMany({
      include: {
        project: true,
        suites: { include: { cases: { include: { testCase: { include: { executions: true } }, assignedTo: true } } } },
        _count: { select: { suites: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Plans"
        title="Test Plans"
        description="Organise test cases into plans and track progress."
        actions={
          <form action={createTestPlan} className="flex flex-col lg:flex-row lg:items-center gap-2">
            <input name="name" placeholder="Plan name" className="input w-48" required />
            <select name="projectId" className="input">
              <option value="">Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn-primary">Create</button>
          </form>
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
