import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Team and Access"
        title="Team and Access"
        description="Manage members, roles and permissions."
        actions={
          <div className="flex items-end gap-4">
            <button className="btn-primary">Invite</button>
            <button className="btn-outline">Add member</button>
          </div>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header">Member</th>
              <th className="table-header">Role</th>
              <th className="table-header">Projects</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#1B2430] font-medium">Alex Rivera</td>
              <td className="px-4 py-3 text-[#5B6675]">Owner</td>
              <td className="px-4 py-3 text-[#5B6675]">2 <span className="sample-badge">Sample</span></td>
              <td className="px-4 py-3"><span className="badge status-pass">Active</span></td>
              <td className="px-4 py-3 text-right"><Link href="#" className="btn-link text-sm">Edit</Link></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Role permissions matrix</h3>
        <p className="text-xs text-[#5B6675] mb-3">Configure what each role can do across projects.</p>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-3 py-2">Permission</th>
              <th className="table-header px-3 py-2 text-center">Owner</th>
              <th className="table-header px-3 py-2 text-center">Admin</th>
              <th className="table-header px-3 py-2 text-center">QA Lead</th>
              <th className="table-header px-3 py-2 text-center">Tester</th>
              <th className="table-header px-3 py-2 text-center">Read-only</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-3 py-2 text-[#5B6675]">Create projects</td>
              <td className="px-3 py-2 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-2 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">No</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">No</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">No</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-[#5B6675]">Run tests</td>
              <td className="px-3 py-2 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-2 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-2 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-2 text-center text-[#14633E]">Yes</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">No</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Audit history</h3>
        <p className="text-xs text-[#5B6675]">No audit events yet.</p>
      </div>
    </div>
  );
}
