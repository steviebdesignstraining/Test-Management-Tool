import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      testCases: { include: { owner: true, steps: true } },
      members: { include: { user: true } },
      organisation: true,
    },
  });

  if (!project) {
    return <div className="p-[28px]">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Projects"
        title={project.name + " — Project detail"}
        description={`PRJ-${project.id.slice(-4).toUpperCase()} • Owned by ${project.organisation?.name}`}
        actions={
          <Link href="/projects" className="btn-link text-sm">
            Back to projects
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Overview</h2>
            <p className="text-sm text-[#5B6675]">{project.description || "No description."}</p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Test cases</h2>
            {project.testCases.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No test cases yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F7F9]">
                  <tr>
                    <th className="table-header px-4 py-3">Key</th>
                    <th className="table-header px-4 py-3">Title</th>
                    <th className="table-header px-4 py-3">Status</th>
                    <th className="table-header px-4 py-3 text-right">Automation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D0D8]">
                  {project.testCases.map((tc) => (
                    <tr key={tc.id}>
                      <td className="px-4 py-3 text-[#1B2430] font-medium">{tc.key}</td>
                      <td className="px-4 py-3">
                        <Link href={`/test-cases/${tc.id}`} className="text-[#1F6F8B] hover:underline">
                          {tc.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3"><span className="badge status-neutral">{tc.status}</span></td>
                      <td className="px-4 py-3 text-[#5B6675] text-right">Not mapped</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">PRJ-{project.id.slice(-4).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Owner</p>
                <p className="text-[#5B6675]">{project.organisation?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Test cases</p>
                <p className="text-[#5B6675]">{project.testCases.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Members</p>
                <p className="text-[#5B6675]">{project.members.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Members</h3>
            {project.members.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No members.</p>
            ) : (
              <ul className="space-y-2 text-sm text-[#5B6675]">
                {project.members.map((m) => (
                  <li key={m.id} className="flex justify-between">
                    <span>{m.user?.name || "—"}</span>
                    <span className="text-[#1B2430] font-medium">{m.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
