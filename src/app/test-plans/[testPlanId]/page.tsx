import { prisma } from "@/lib/prisma";
import { addTestCaseToPlan } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function TestPlanDetailPage({
  params,
}: {
  params: Promise<{ testPlanId: string }>;
}) {
  const { testPlanId } = await params;
  const plan = await prisma.testPlan.findUnique({
    where: { id: testPlanId },
    include: {
      project: true,
      suites: { include: { cases: { include: { testCase: true, assignedTo: true } } } },
    },
  });

  if (!plan) {
    return <div className="p-[28px]">Test plan not found.</div>;
  }

  const [testCases, users] = await Promise.all([
    prisma.testCase.findMany({ where: { projectId: plan.projectId }, orderBy: { key: "asc" } }),
    prisma.user.findMany(),
  ]);

  const totalCases = plan.suites.reduce((sum, s) => sum + s.cases.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Plans"
        title={plan.name + " — Test plan detail"}
        description={plan.project?.name}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/test-runs" className="btn-link text-sm mr-3">
              New run
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Progress</h2>
            <div className="w-full bg-[#EDF0F3] h-2 rounded-full mb-2">
              <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: totalCases > 0 ? "50%" : "0%" }} />
            </div>
            <p className="text-xs text-[#5B6675]">{totalCases} cases</p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Add test case</h2>
            <form action={addTestCaseToPlan} className="space-y-3">
              <input type="hidden" name="testPlanId" value={testPlanId} />
              <select name="testCaseId" className="input w-full" required>
                <option value="">Select a test case</option>
                {testCases.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.key} — {tc.title}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="suiteName"
                  placeholder="Suite (e.g. Smoke)"
                  className="input"
                  defaultValue="Default"
                />
                <input
                  name="position"
                  type="number"
                  placeholder="Position"
                  className="input"
                  defaultValue="0"
                />
              </div>
              <button className="btn-primary w-full">Add to plan</button>
            </form>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Plan summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Scope</p>
                <p className="text-[#1B2430]">{plan.scope || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Environments</p>
                <p className="text-[#1B2430]">Staging, Production</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Risks</p>
                <p className="text-[#1B2430]">—</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Reviewers</p>
                <p className="text-[#1B2430]">—</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Entry criteria</p>
                <p className="text-[#1B2430]">—</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Exit criteria</p>
                <p className="text-[#1B2430]">—</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Suites and assignments</h2>
            {plan.suites.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No suites yet. Add a test case to create a suite.</p>
            ) : (
              <div className="space-y-4">
                {plan.suites.map((suite) => (
                  <div key={suite.id} className="border border-[#C9D0D8] rounded overflow-hidden">
                    <div className="bg-[#F5F7F9] px-4 py-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-[#1B2430]">{suite.name}</span>
                      <span className="text-xs text-[#5B6675]">{suite.cases.length} case(s)</span>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#F5F7F9]">
                        <tr>
                          <th className="table-header px-4 py-3">Key</th>
                          <th className="table-header px-4 py-3">Title</th>
                          <th className="table-header px-4 py-3">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9D0D8]">
                        {suite.cases.map((pc) => (
                          <tr key={pc.id} className="hover:bg-[#EDF0F3]">
                            <td className="px-4 py-3 text-[#1B2430] font-medium">
                              <span>{pc.testCase.key}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Link href={`/test-cases/${pc.testCaseId}`} className="text-[#1F6F8B] hover:underline">
                                {pc.testCase.title}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-[#5B6675]">
                              {pc.assignedTo?.name || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">TP-{plan.id.slice(-4).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Project</p>
                <p className="text-[#5B6675]">{plan.project?.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Assignments</h3>
            <div className="space-y-3">
              <select className="input w-full" disabled={users.length === 0}>
                <option value="">Select assignee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button className="btn-outline w-full text-xs disabled:opacity-50 disabled:pointer-events-none">
                Assign selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
