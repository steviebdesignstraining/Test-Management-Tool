import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const INTEGRATION_TYPES = [
  { value: "POSTMAN", label: "Postman", description: "Import and sync Postman collections for API test coverage." },
  { value: "JIRA", label: "Jira", description: "Link defects and test results to Jira issues." },
  { value: "AZURE_DEVOPS", label: "Azure DevOps", description: "Connect Azure DevOps pipelines and work items." },
  { value: "TRELLO", label: "Trello", description: "Sync test cases and defects to Trello cards." },
  { value: "SLACK", label: "Slack", description: "Send test run notifications to Slack channels." },
];

export default async function ProjectIntegrationsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, integrations] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.thirdPartyIntegration.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!project) {
    return <div className="p-[28px]">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Integrations"
        title="Integrations"
        description={`Configure third-party integrations for ${project.name}`}
        actions={
          <Link href={`/projects/${projectId}/integrations/create`} className="btn-primary">
            Add Integration
          </Link>
        }
      />

      {/* Available integration types */}
      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Available Integrations</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {INTEGRATION_TYPES.map((t) => (
            <div key={t.value} className="p-4 border border-[#C9D0D8] rounded bg-[#F9FAFB]">
              <h4 className="text-sm font-semibold text-[#1B2430] mb-1">{t.label}</h4>
              <p className="text-xs text-[#5B6675] mb-3">{t.description}</p>
              <Link
                href={`/projects/${projectId}/integrations/create?type=${t.value}`}
                className="btn-link text-xs text-[#1F6F8B] hover:underline"
              >
                Configure
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Configured integrations */}
      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <h3 className="text-sm font-semibold text-[#1B2430] px-[28px] py-[20px] border-b border-[#C9D0D8]">
          Configured Integrations ({integrations.length})
        </h3>
        {integrations.length === 0 ? (
          <div className="p-[28px] text-center text-[#5B6675]">
            No integrations configured. Add one above to connect external tools.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Type</th>
                <th className="table-header px-4 py-3">Name</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3">Last Synced</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {integrations.map((i) => (
                <tr key={i.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">{i.type}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{i.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${i.isEnabled ? "status-pass" : "status-neutral"}`}>
                      {i.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5B6675] text-xs">
                    {i.lastSyncedAt ? new Date(i.lastSyncedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/projects/${projectId}/integrations/${i.id}`} className="btn-link text-xs mr-2">
                      Edit
                    </Link>
                    <form
                      action={async () => {}}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (window.confirm("Delete this integration?")) {
                          // Handle delete via fetch
                          fetch(`/api/v1/projects/${projectId}/integrations/${i.id}`, {
                            method: "DELETE",
                          }).then(() => window.location.reload());
                        }
                      }}
                      className="inline"
                    >
                      <button className="btn-destructive text-xs">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
