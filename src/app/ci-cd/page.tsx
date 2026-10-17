import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export default async function CiCdPage() {
  const [executions] = await Promise.all([
    prisma.testExecution.findMany(),
  ]);

  const total = executions.length;
  const passed = executions.filter((e) => e.status === "PASSED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="CI/CD Runs"
        title="CI/CD Runs"
        description="View pipeline results and quality gates."
        actions={
          <button className="btn-primary">Connect CI</button>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Workflow</th>
              <th className="table-header px-4 py-3">Branch</th>
              <th className="table-header px-4 py-3">Commit</th>
              <th className="table-header px-4 py-3">Actor</th>
              <th className="table-header px-4 py-3">Status</th>
              <th className="table-header px-4 py-3">Tests</th>
              <th className="table-header px-4 py-3">Duration</th>
              <th className="table-header px-4 py-3 text-right">Allure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            {total === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-[#5B6675] text-center">
                  No CI runs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Run detail</h3>
          <p className="text-xs text-[#5B6675]">Select a run to see jobs, failure types, retries and a link to the original GitHub run.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Quality gates</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#5B6675]">Minimum pass rate (90%)</span>
              <span className={`badge ${total > 0 && Math.round((passed / total) * 100) >= 90 ? "status-pass" : "status-neutral"}`}>
                {total > 0 ? (Math.round((passed / total) * 100) >= 90 ? "Met" : "Failed") : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5B6675]">No critical failures</span>
              <span className="badge status-neutral">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
