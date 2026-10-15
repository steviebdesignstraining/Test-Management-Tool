export default function TestRunsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Case queue */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Case queue</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 border border-[#C9D0D8] rounded bg-[#E4F0F4]">
              <span className="text-[#1B2430] font-medium">TC-001</span>
              <span className="text-xs text-[#134F63]">Pending</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-[#C9D0D8] rounded">
              <span className="text-[#1B2430] font-medium">TC-002</span>
              <span className="text-xs text-[#5B6675]">Pending</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-[#C9D0D8] rounded">
              <span className="text-[#1B2430] font-medium">TC-003</span>
              <span className="text-xs text-[#5B6675]">Pending</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#5B6675]">Keyboard: ↑/↓ navigate, 1-5 set status</p>
      </div>

      {/* Step table */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Test Case: TC-001 Login with valid credentials</h3>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="px-3 py-2 font-medium text-[#5B6675] w-10">#</th>
                <th className="px-3 py-2 font-medium text-[#5B6675]">Action</th>
                <th className="px-3 py-2 font-medium text-[#5B6675] text-right">Expected</th>
                <th className="px-3 py-2 font-medium text-[#5B6675] text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              <tr>
                <td className="px-3 py-2 text-[#5B6675]">1</td>
                <td className="px-3 py-2 text-[#1B2430]">Navigate to /login</td>
                <td className="px-3 py-2 text-[#5B6675] text-right">Login page loads</td>
                <td className="px-3 py-2 text-right">
                  <button className="px-3 py-1 bg-[#E3F2EA] text-[#14633E] rounded text-[10px] font-medium">Pass</button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-[#5B6675]">2</td>
                <td className="px-3 py-2 text-[#1B2430]">Enter valid email and password</td>
                <td className="px-3 py-2 text-[#5B6675] text-right">Fields populated</td>
                <td className="px-3 py-2 text-right">
                  <button className="px-3 py-1 border border-[#C9D0D8] text-[#5B6675] rounded text-[10px] font-medium hover:bg-[#EDF0F3]">Fail</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3">
            <label className="block text-xs font-medium text-[#5B6675] mb-1">Actual result</label>
            <textarea className="w-full border border-[#C9D0D8] rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#1F6F8B] outline-none" rows={3} placeholder="Describe what happened…" />
          </div>
        </div>
      </div>

      {/* Outcome panel */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Outcome</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#5B6675]">Status</span>
            <span className="px-2 py-0.5 bg-[#FBEFD9] text-[#7A4600] rounded text-[10px] font-medium">Blocked</span>
          </div>
          <button className="w-full border border-[#C9D0D8] text-[#8F2A20] py-2 rounded text-sm font-medium hover:bg-[#FBE7E4] flex items-center justify-center gap-2 mb-2">
            <span className="text-[12px]">⚠</span> Not applicable
          </button>
          <button className="w-full border border-[#C9D0D8] text-[#1F6F8B] py-2 rounded text-sm font-medium hover:bg-[#E4F0F4] flex items-center justify-center gap-2">
            <span className="text-[12px]">🐛</span> Create/link defect
          </button>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Evidence</h3>
          <button className="w-full border border-[#C9D0D8] text-[#5B6675] py-2 rounded text-sm hover:bg-[#EDF0F3]">
            Attach evidence
          </button>
        </div>
      </div>
    </div>
  );
}
