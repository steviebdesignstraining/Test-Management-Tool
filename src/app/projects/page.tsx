import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ProjectCreateModal from "@/components/ProjectCreateModal";


export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      organisation: true,
      _count: { select: { testCases: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Projects"
        title="Projects"
        description="Manage your test projects and teams."
        actions={<ProjectCreateModal />}
      />

      {projects.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No projects yet. Create your first project above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Key</th>
                <th className="table-header px-4 py-3">Name</th>
                <th className="table-header px-4 py-3">Owner</th>
                <th className="table-header px-4 py-3">Cases</th>
                <th className="table-header px-4 py-3">Last run</th>
                <th className="table-header px-4 py-3">Pass rate</th>
                <th className="table-header px-4 py-3 text-right">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">
                    {project.id.slice(-4).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="text-[#1F6F8B] hover:underline">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#5B6675]">
                    {project.organisation?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#5B6675]">{project._count.testCases}</td>
                  <td className="px-4 py-3 text-[#5B6675]">—</td>
                  <td className="px-4 py-3 text-[#5B6675]">—</td>
                  <td className="px-4 py-3 text-right text-[#5B6675]">
                    {project._count.members}
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
