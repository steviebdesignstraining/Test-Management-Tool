import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export default async function AuditLogsPage() {
  const [logs, users] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Audit Logs"
        title="Audit Logs"
        description="View security-sensitive operations and system events."
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Time</th>
              <th className="table-header px-4 py-3">User</th>
              <th className="table-header px-4 py-3">Action</th>
              <th className="table-header px-4 py-3">Entity</th>
              <th className="table-header px-4 py-3">Entity ID</th>
              <th className="table-header px-4 py-3 text-right">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-[#5B6675] text-center">
                  No audit events yet.
                </td>
              </tr>
            ) : (
              <>{logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#5B6675] text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[#1B2430]">
                    {log.user?.name || log.user?.email || "System"}
                  </td>
                  <td className="px-4 py-3 text-[#5B6675] text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-[#5B6675] text-xs">{log.entity || "—"}</td>
                  <td className="px-4 py-3 text-[#5B6675] text-xs">{log.entityId || "—"}</td>
                  <td className="px-4 py-3 text-[#5B6675] text-xs">{log.ip || "—"}</td>
                </tr>
              ))}</>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Users</h3>
        <p className="text-xs text-[#5B6675]">
          {users.length} registered user(s) in the system.
        </p>
      </div>
    </div>
  );
}
