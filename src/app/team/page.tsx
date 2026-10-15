import Link from "next/link";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#1B2430]">Team and Access</h1>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Member</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Role</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Projects</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Status</th>
              <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#1B2430] font-medium">Alex Rivera</td>
              <td className="px-4 py-3 text-[#5B6675]">Owner</td>
              <td className="px-4 py-3 text-[#5B6675]">2</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#E3F2EA] text-[#14633E] rounded text-[10px] font-medium">Active</span></td>
              <td className="px-4 py-3 text-right"><Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">Edit</Link></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-end gap-4">
        <button className="bg-[#1F6F8B] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#134F63]">Invite</button>
        <button className="border border-[#C9D0D8] text-[#5B6675] px-4 py-2 rounded text-sm font-medium hover:bg-[#EDF0F3]">Add member</button>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-5">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Role permissions matrix</h3>
        <p className="text-xs text-[#5B6675] mb-3">Configure what each role can do across projects.</p>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-3 py-2 font-medium text-[#5B6675]">Permission</th>
              <th className="px-3 py-2 font-medium text-[#5B6675] text-center">Owner</th>
              <th className="px-3 py-2 font-medium text-center text-[#5B6675]">Admin</th>
              <th className="px-3 py-2 font-medium text-center text-[#5B6675]">QA Lead</th>
              <th className="px-3 py-2 font-medium text-center text-[#5B6675]">Tester</th>
              <th className="px-3 py-2 font-medium text-center text-[#5B6675]">Read-only</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-3 py-2 text-[#5B6675]">Create projects</td>
              <td className="px-3 py-2 text-center text-[#14633E]">✓</td>
              <td className="px-3 py-2 text-center text-[#14633E]">✓</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">✗</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">✗</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">✗</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-[#5B6675]">Run tests</td>
              <td className="px-3 py-2 text-center text-[#14633E]">✓</td>
              <td className="px-3 py-2 text-center text-[#14633E]">✓</td>
              <td className="px-3 py-2 text-center text-[#14633E]">✓</td>
              <td className="px-3 py-2 text-center text-[#14633E]">✓</td>
              <td className="px-3 py-2 text-center text-[#8F2A20]">✗</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-5">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Audit history</h3>
        <p className="text-xs text-[#5B6675]">No audit events yet.</p>
      </div>
    </div>
  );
}
