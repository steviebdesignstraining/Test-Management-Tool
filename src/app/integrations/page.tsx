import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

interface IntegrationStatus {
  name: string;
  status: string;
  statusColor: string;
  action: string;
  actionVariant: string;
  scopes: string;
  lastSync: string | null;
  connected: boolean;
  githubUsername?: string | null | undefined;
  linkedEmail?: string | null | undefined;
}

export default async function IntegrationsPage() {
  const user = await getCurrentUser();

  const githubUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          githubId: true,
          githubUsername: true,
          githubAccessToken: true,
          email: true,
          name: true,
        },
      })
    : null;

  const isGitHubConnected = Boolean(githubUser?.githubId);

  const integrations: IntegrationStatus[] = [
    {
      name: "GitHub",
      status: isGitHubConnected ? "Connected" : "Not connected",
      statusColor: isGitHubConnected
        ? "bg-[#E3F2EA] text-[#14633E]"
        : "bg-[#EDF0F3] text-[#444F5E]",
      action: isGitHubConnected ? "Disconnect" : "Connect",
      actionVariant: isGitHubConnected
        ? "text-[#8F2A20] hover:bg-[#FBE7E4]"
        : "text-[#1F6F8B] hover:bg-[#E4F0F4]",
      scopes: "read:user, user:email, repo, workflow",
      lastSync: null,
      connected: isGitHubConnected,
      githubUsername: githubUser?.githubUsername ?? null,
      linkedEmail: githubUser?.email ?? null,
    },
    {
      name: "Jira",
      status: "Not connected",
      statusColor: "bg-[#EDF0F3] text-[#444F5E]",
      action: "Connect",
      actionVariant: "text-[#1F6F8B] hover:bg-[#E4F0F4]",
      scopes: "read:jira-work, write:jira-work",
      lastSync: null,
      connected: false,
    },
    {
      name: "Azure DevOps",
      status: "Not connected",
      statusColor: "bg-[#EDF0F3] text-[#444F5E]",
      action: "Connect",
      actionVariant: "text-[#1F6F8B] hover:bg-[#E4F0F4]",
      scopes: "vso code: read, work: read",
      lastSync: null,
      connected: false,
    },
    {
      name: "Trello",
      status: "Not connected",
      statusColor: "bg-[#EDF0F3] text-[#444F5E]",
      action: "Connect",
      actionVariant: "text-[#1F6F8B] hover:bg-[#E4F0F4]",
      scopes: "read,write",
      lastSync: null,
      connected: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Integrations"
        title="Integrations"
        description="Connect external tools and map fields."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1B2430]">{integration.name}</h3>
              <span className={`badge ${integration.statusColor}`}>{integration.status}</span>
            </div>
            <div className="space-y-2 text-xs text-[#5B6675] mb-4">
              <div className="flex justify-between">
                <span>Scopes</span>
                <span>{integration.scopes}</span>
              </div>
              <div className="flex justify-between">
                <span>Last sync</span>
                <span>{integration.lastSync || "—"}</span>
              </div>
              {integration.githubUsername && (
                <div className="flex justify-between">
                  <span>GitHub account</span>
                  <span>{integration.githubUsername || "—"}</span>
                </div>
              )}
              {integration.linkedEmail && (
                <div className="flex justify-between">
                  <span>Email on account</span>
                  <span>{integration.linkedEmail || "—"}</span>
                </div>
              )}
            </div>
            {integration.name === "GitHub" ? (
              <button
                onClick={async () => {
                  if (!integration.connected) {
                    const res = await fetch("/api/v1/auth/github/redirect");
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    }
                  } else {
                    if (window.confirm("Disconnect your GitHub account?")) {
                      await fetch("/api/v1/auth/github/disconnect", { method: "POST" });
                      window.location.reload();
                    }
                  }
                }}
                className={`w-full py-2 rounded text-sm font-medium border border-[#C9D0D8] ${integration.actionVariant}`}
              >
                {integration.action}
              </button>
            ) : (
              <button className={`w-full py-2 rounded text-sm font-medium border border-[#C9D0D8] ${integration.actionVariant}`}>
                {integration.action}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Field mappings</h3>
        <p className="text-xs text-[#5B6675] mb-3">Which system is authoritative for each mapped field.</p>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Field</th>
              <th className="table-header px-4 py-3 text-right">Authoritative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#5B6675]">Status</td>
              <td className="px-4 py-3 text-[#5B6675] text-right">Jira</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-[#5B6675]">Assignee</td>
              <td className="px-4 py-3 text-[#5B6675] text-right">GitHub</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
