import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import EnvironmentCreateModal from "@/components/EnvironmentCreateModal";

export default async function EnvironmentsPage() {
  const environments = await prisma.environment.findMany({
    include: { project: true },
    orderBy: { updatedAt: "desc" },
  });
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Environments"
        title="Environments"
        description="Managed test environments (dev/QA/staging/production) linked to projects."
        actions={<EnvironmentCreateModal projects={projects} />}
      />

      {environments.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No environments yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Name</th>
                <th className="table-header px-4 py-3">Project</th>
                <th className="table-header px-4 py-3">Type</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3">Base URL</th>
                <th className="table-header px-4 py-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {environments.map((env) => (
                <tr key={env.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">{env.name}</td>
                  <td className="px-4 py-3">{env.project.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#E4F0F4] text-[#134F63]">{env.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#F5F7F9] text-[#5B6675]">{env.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs truncate max-w-[200px]">{env.baseUrl ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-xs text-[#5B6675]">
                    {env.updatedAt.toLocaleDateString()}
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
