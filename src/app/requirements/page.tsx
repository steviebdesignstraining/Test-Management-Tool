import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function RequirementsPage() {
  const [requirements, projects, users] = await Promise.all([
    prisma.requirement.findMany({
      include: { project: true, owner: true, testCases: true },
      orderBy: { key: "asc" },
    }),
    prisma.project.findMany(),
    prisma.user.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Requirements"
        title="Requirements"
        description="Manage requirements and link them to test cases for traceability."
        actions={
          <form
            action={async (formData: FormData) => {
              "use server";
              const key = formData.get("key") as string;
              const title = formData.get("title") as string;
              const projectId = formData.get("projectId") as string;
              const ownerId = formData.get("ownerId") as string;
              const type = formData.get("type") as string;
              const priority = formData.get("priority") as string;
              const status = formData.get("status") as string;
              await fetch("/api/v1/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, title, projectId, ownerId, type, priority, status }),
              });
            }}
            className="flex flex-col lg:flex-row lg:items-center gap-2"
          >
            <input name="key" placeholder="Key (e.g. REQ-001)" className="input w-40" required />
            <input name="title" placeholder="Title" className="input flex-1" required />
            <select name="projectId" className="input">
              <option value="">Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select name="ownerId" className="input">
              <option value="">Owner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button className="btn-primary">Create</button>
          </form>
        }
      />

      {requirements.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No requirements yet. Create your first requirement above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3 w-20"><input type="checkbox" /></th>
                <th className="table-header px-4 py-3">Key</th>
                <th className="table-header px-4 py-3">Title</th>
                <th className="table-header px-4 py-3">Type</th>
                <th className="table-header px-4 py-3">Priority</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3">Project</th>
                <th className="table-header px-4 py-3">Owner</th>
                <th className="table-header px-4 py-3">Test cases</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {requirements.map((r) => (
                <tr key={r.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3 text-[#1B2430] font-medium">
                    <Link href={`/requirements/${r.id}`} className="text-[#1F6F8B] hover:underline">
                      {r.key}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{r.type}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.priority === "HIGH" ? "status-fail" : r.priority === "MEDIUM" ? "status-blocked" : "status-neutral"}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="badge status-neutral">{r.status}</span></td>
                  <td className="px-4 py-3 text-[#5B6675]">{r.project?.name || "—"}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{r.owner?.name || "—"}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{r.testCases.length}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/requirements/${r.id}`} className="btn-link mr-3">
                      View
                    </Link>
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
