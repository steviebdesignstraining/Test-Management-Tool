import PageHeader from "@/components/PageHeader";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Integrations"
        title="Integrations"
        description="Connect external tools and map fields."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "GitHub", status: "Connected", statusColor: "bg-[#E3F2EA] text-[#14633E]", action: "Disconnect", actionVariant: "text-[#8F2A20] hover:bg-[#FBE7E4]" },
          { name: "Jira", status: "Expired credentials", statusColor: "bg-[#FBE7E4] text-[#8F2A20]", action: "Reconnect", actionVariant: "text-[#1F6F8B] hover:bg-[#E4F0F4]" },
          { name: "Azure DevOps", status: "Not connected", statusColor: "bg-[#EDF0F3] text-[#444F5E]", action: "Connect", actionVariant: "text-[#1F6F8B] hover:bg-[#E4F0F4]" },
          { name: "Trello", status: "Not connected", statusColor: "bg-[#EDF0F3] text-[#444F5E]", action: "Connect", actionVariant: "text-[#1F6F8B] hover:bg-[#E4F0F4]" },
        ].map((integration) => (
          <div key={integration.name} className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1B2430]">{integration.name}</h3>
              <span className={`badge ${integration.statusColor}`}>{integration.status}</span>
            </div>
            <div className="space-y-2 text-xs text-[#5B6675] mb-4">
              <div className="flex justify-between"><span>Scopes</span><span>repo, read:discussion <span className="sample-badge">Sample</span></span></div>
              <div className="flex justify-between"><span>Last sync</span><span>—</span></div>
            </div>
            <button className={`w-full py-2 rounded text-sm font-medium border border-[#C9D0D8] ${integration.actionVariant}`}>{integration.action}</button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Field mappings</h3>
        <p className="text-xs text-[#5B6675] mb-3">Which system is authoritative for each mapped field.</p>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-2">Field</th>
              <th className="table-header px-4 py-2 text-right">Authoritative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-2 text-[#5B6675]">Status</td>
              <td className="px-4 py-2 text-[#5B6675] text-right">Jira</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-[#5B6675]">Assignee</td>
              <td className="px-4 py-2 text-[#5B6675] text-right">GitHub</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
