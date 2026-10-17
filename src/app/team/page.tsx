import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/auth-utils";
import InviteForm from "@/components/invite-form";

export default async function TeamPage() {
  const currentUser = await getCurrentUser();

  const [projects, projectMembers, users] = await Promise.all([
    prisma.project.findMany({
      include: { organisation: true, _count: { select: { testCases: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.projectMember.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, emailVerified: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const isOrgAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "ORG_ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Team and Access"
        title="Team and Access"
        description="Manage members, invite new collaborators, and configure role permissions."
        actions={
          <div className="flex items-end gap-4">
            <button className="btn-primary" disabled={!isOrgAdmin}>
              Invite
            </button>
            <button className="btn-outline" disabled={!isOrgAdmin}>
              Add member
            </button>
          </div>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Invite to a project</h3>
        {projects.length === 0 ? (
          <p className="text-sm text-[#5B6675]">No projects available. Create a project first.</p>
        ) : (
          <InviteForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
        )}
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Member</th>
              <th className="table-header px-4 py-3">Role</th>
              <th className="table-header px-4 py-3">Projects</th>
              <th className="table-header px-4 py-3">Status</th>
              <th className="table-header px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-[#5B6675] text-center">
                  No team members found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const userProjects = projectMembers.filter((pm) => pm.userId === user.id);
                return (
                  <tr key={user.id} className="hover:bg-[#EDF0F3]">
                    <td className="px-4 py-3 text-[#1B2430] font-medium">
                      {user.name || user.email}
                    </td>
                    <td className="px-4 py-3 text-[#5B6675]">{user.role}</td>
                    <td className="px-4 py-3 text-[#5B6675]">
                      {userProjects.length > 0
                        ? userProjects.map((pm) => pm.project.name).join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.emailVerified ? "status-pass" : "status-neutral"}`}>
                        {user.emailVerified ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href="#" className="btn-link text-sm">
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Projects</h3>
        {projects.length === 0 ? (
          <p className="text-xs text-[#5B6675]">No projects found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Name</th>
                <th className="table-header px-4 py-3">Organisation</th>
                <th className="table-header px-4 py-3">Test Cases</th>
                <th className="table-header px-4 py-3">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">
                    <a href={`/projects/${project.id}`} className="text-[#1F6F8B] hover:underline">
                      {project.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#5B6675]">{project.organisation.name}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{project._count.testCases}</td>
                  <td className="px-4 py-3 text-[#5B6675]">
                    {projectMembers.filter((pm) => pm.projectId === project.id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Role permissions</h3>
        <p className="text-xs text-[#5B6675] mb-3">
          {isOrgAdmin
            ? "You have organisation-level administration permissions."
            : "Contact an administrator to manage role permissions."}
        </p>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-3 py-3">Permission</th>
              <th className="table-header px-3 py-3 text-center">Owner</th>
              <th className="table-header px-3 py-3 text-center">Admin</th>
              <th className="table-header px-3 py-3 text-center">QA Lead</th>
              <th className="table-header px-3 py-3 text-center">Tester</th>
              <th className="table-header px-3 py-3 text-center">Read-only</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-3 py-3 text-[#5B6675]">Create projects</td>
              <td className="px-3 py-3 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-3 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-3 text-center text-[#8F2A20]">No</td>
              <td className="px-3 py-3 text-center text-[#8F2A20]">No</td>
              <td className="px-3 py-3 text-center text-[#8F2A20]">No</td>
            </tr>
            <tr>
              <td className="px-3 py-3 text-[#5B6675]">Run tests</td>
              <td className="px-3 py-3 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-3 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-3 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-3 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-3 text-center text-[#8F2A20]">No</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Team activity</h3>
        <p className="text-xs text-[#5B6675]">
          {projectMembers.length} active project membership{projectMembers.length !== 1 ? "s" : ""}.
        </p>
      </div>
    </div>
  );
}
