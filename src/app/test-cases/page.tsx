import Link from "next/link";

export default function TestCasesPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Suites tree */}
      <aside className="hidden lg:block w-72 bg-white border border-[#C9D0D8] rounded p-4">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Suites</h3>
        <ul className="space-y-1 text-sm text-[#5B6675]">
          <li className="flex items-center gap-2">
            <span>▾</span>
            <span className="text-[#1B2430] font-medium">Root</span>
          </li>
          <li className="pl-4">
            <span>▸</span>
            <Link href="#" className="text-[#1F6F8B] hover:underline">Authentication</Link>
          </li>
          <li className="pl-4">
            <span>▸</span>
            <Link href="#" className="text-[#1F6F8B] hover:underline">Checkout flow</Link>
          </li>
        </ul>
      </aside>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1B2430]">Test Cases</h1>
            <p className="text-xs text-[#5B6675]">Test case management</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter…"
              className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1F6F8B] outline-none w-40"
            />
            <button className="bg-[#1F6F8B] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#134F63] flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Import CSV
            </button>
            <button className="text-[#5B6675] hover:text-[#1F6F8B] text-sm hover:underline">Export</button>
          </div>
        </div>

        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="px-4 py-3 font-medium text-[#5B6675] w-20"><input type="checkbox" /></th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Key</th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Title</th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Type</th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Priority</th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Status</th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Automation</th>
                <th className="px-4 py-3 font-medium text-[#5B6675]">Owner</th>
                <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              <tr className="hover:bg-[#EDF0F3]">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3 text-[#1B2430] font-medium">TC-001</td>
                <td className="px-4 py-3"><Link href="#" className="text-[#1F6F8B] hover:underline">Login with valid credentials</Link></td>
                <td className="px-4 py-3 text-[#5B6675]">Positive</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#E3F2EA] text-[#14633E] rounded text-[10px] font-medium">High</span></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#EDF0F3] text-[#444F5E] rounded text-[10px] font-medium">Draft</span></td>
                <td className="px-4 py-3 text-[#5B6675]">Not mapped</td>
                <td className="px-4 py-3 text-[#5B6675]">Alex Rivera</td>
                <td className="px-4 py-3 text-right">
                  <Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] mr-3 text-sm">Edit</Link>
                  <Link href="#" className="text-[#5B6675] hover:text-[#8F2A20] text-sm">Delete</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AI duplicate detection */}
        <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-4">
          <div className="flex items-start gap-3">
            <span className="text-[#6B4FA3]">✦</span>
            <div>
              <p className="text-sm font-semibold text-[#1B2430] mb-1">AI duplicate detection</p>
              <p className="text-xs text-[#55398C]">Potential duplicate found: TC-005 "Login with valid credentials" (82% similarity)</p>
              <button className="text-[#55398C] text-xs underline mt-1">Review suggestion</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
