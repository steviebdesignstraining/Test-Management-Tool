import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ApiMonitoringPage() {
  const [collections, monitors, runs] = await Promise.all([
    prisma.apiCollection.findMany({
      include: { _count: { select: { endpoints: true, monitors: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.apiMonitor.findMany({
      include: {
        collection: { select: { id: true, name: true } },
        endpoint: { select: { id: true, name: true, method: true, url: true } },
        runs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.apiMonitorRun.findMany({
      include: {
        monitor: { select: { id: true, name: true } },
        results: { include: { endpoint: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalCollections = collections.length;
  const totalEndpoints = collections.reduce((sum, c) => sum + c._count.endpoints, 0);
  const totalMonitors = monitors.length;
  const enabledMonitors = monitors.filter((m) => m.isEnabled).length;
  const recentRuns = runs.slice(0, 10);
  const passedRuns = recentRuns.filter((r) => r.status === "PASSED").length;
  const failedRuns = recentRuns.filter((r) => r.status === "FAILED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="API Monitoring"
        title="API Monitoring"
        description="Monitor API endpoints, track performance, and receive alerts on failures."
        actions={
          <Link href="/api-monitoring/collections/create" className="btn-primary">
            Create Collection
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Collections</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{totalCollections}</p>
          <p className="text-xs text-[#5B6675] mt-1">{totalEndpoints} endpoints</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Monitors</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{totalMonitors}</p>
          <p className="text-xs text-[#5B6675] mt-1">{enabledMonitors} enabled</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Recent Runs</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{recentRuns.length}</p>
          <p className="text-xs text-[#5B6675] mt-1">{passedRuns} passed | {failedRuns} failed</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Pass Rate</p>
          <p className="text-2xl font-semibold text-[#1B2430]">
            {recentRuns.length > 0 ? Math.round((passedRuns / recentRuns.length) * 100) : 0}%
          </p>
          <p className="text-xs text-[#5B6675] mt-1">Last 10 runs</p>
        </div>
      </div>

      {/* Active Monitors */}
      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <h3 className="text-sm font-semibold text-[#1B2430] px-[28px] py-[20px] border-b border-[#C9D0D8]">
          Active Monitors
        </h3>
        {monitors.length === 0 ? (
          <div className="p-[28px] text-center text-[#5B6675]">
            No monitors configured. Create a collection and add monitors to start tracking API health.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Monitor</th>
                <th className="table-header px-4 py-3">Collection</th>
                <th className="table-header px-4 py-3">Endpoint</th>
                <th className="table-header px-4 py-3">Schedule</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {monitors.map((m) => {
                const lastRun = m.runs[0];
                return (
                  <tr key={m.id} className="hover:bg-[#EDF0F3]">
                    <td className="px-4 py-3 text-[#1B2430] font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-[#5B6675]">{m.collection.name}</td>
                    <td className="px-4 py-3 text-[#5B6675] text-xs">
                      {m.endpoint ? `${m.endpoint.method} ${m.endpoint.url}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#5B6675] text-xs">{m.schedule}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${m.isEnabled ? "status-pass" : "status-neutral"}`}>
                        {m.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/api-monitoring/collections/${m.collectionId}`} className="btn-link text-xs">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Runs */}
      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <h3 className="text-sm font-semibold text-[#1B2430] px-[28px] py-[20px] border-b border-[#C9D0D8]">
          Recent Monitor Runs
        </h3>
        {recentRuns.length === 0 ? (
          <div className="p-[28px] text-center text-[#5B6675]">
            No monitor runs yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Monitor</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3">Started</th>
                <th className="table-header px-4 py-3">Duration</th>
                <th className="table-header px-4 py-3 text-right">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {recentRuns.map((r) => {
                const passed = r.results.filter((x) => x.status === "PASSED").length;
                const failed = r.results.filter((x) => x.status === "FAILED").length;
                return (
                  <tr key={r.id} className="hover:bg-[#EDF0F3]">
                    <td className="px-4 py-3 text-[#1B2430] font-medium">{r.monitor.name}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${r.status === "PASSED" ? "status-pass" : r.status === "FAILED" ? "status-fail" : "status-neutral"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5B6675] text-xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[#5B6675] text-xs">
                      {r.duration ? r.duration + " ms" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`badge ${failed > 0 ? "status-fail" : "status-pass"}`}>
                        {passed} passed{failed > 0 ? ` | ${failed} failed` : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
