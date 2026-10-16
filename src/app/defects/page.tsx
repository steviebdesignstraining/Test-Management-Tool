import { prisma } from "@/lib/prisma";
import { createDefect } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { FIELD_LIMITS } from "@/lib/validation";

export default async function DefectsPage() {
  const [defects, testCases, users] = await Promise.all([
    prisma.defect.findMany({
      include: { testCase: true, reporter: true, assignee: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testCase.findMany(),
    prisma.user.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Defects"
        title="Defects"
        description="Track and link defects to test cases and runs."
        actions={
          <form action={createDefect} className="flex flex-col lg:flex-row lg:items-end gap-2">
            <input name="title" placeholder="Defect title" maxLength={FIELD_LIMITS.title} className="input w-48" required />
            <select name="severity" className="input">
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <select name="reporterId" className="input">
              <option value="">Reporter</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select name="testCaseId" className="input">
              <option value="">Test case</option>
              {testCases.map((tc) => (
                <option key={tc.id} value={tc.id}>{tc.key}</option>
              ))}
            </select>
            <button className="btn-primary">Report</button>
          </form>
        }
      />

      {defects.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No defects yet. Report your first defect above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Title</th>
                <th className="table-header px-4 py-3">Severity</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3">Assignee</th>
                <th className="table-header px-4 py-3 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {defects.map((d) => (
                <tr key={d.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3">
                    <Link href={`/defects/${d.id}`} className="text-[#1F6F8B] hover:underline font-medium">
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${d.severity === "HIGH" ? "status-fail" : d.severity === "MEDIUM" ? "status-blocked" : "status-neutral"}`}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge status-neutral">{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#5B6675]">{d.reporter?.name || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {d.testCase ? (
                      <Link href={`/test-cases/${d.testCaseId}`} className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">
                        {d.testCase.key}
                      </Link>
                    ) : (
                      <span className="text-[#5B6675] text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
