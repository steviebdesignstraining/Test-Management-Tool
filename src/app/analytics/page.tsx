export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#1B2430]">Analytics / AI Insights</h1>

      {/* Reconciliation review queue */}
      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <div className="border-b border-[#C9D0D8] bg-[#F5F7F9] p-4">
          <h2 className="text-sm font-semibold text-[#1B2430]">Reconciliation review queue</h2>
          <p className="text-xs text-[#5B6675] mt-1">Approve, reject or correct AI suggestions. Auto-complete is off by default. Requires an approved mapping.</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Manual case</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Automation result</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Confidence</th>
              <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#1B2430] font-medium">TC-001</td>
              <td className="px-4 py-3 text-[#5B6675]">login_test.py</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#E4F0F4] text-[#134F63] rounded text-[10px] font-medium">88%</span></td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-1">
                  <button className="px-2 py-1 bg-[#E3F2EA] text-[#14633E] rounded text-[10px] font-medium">Approve</button>
                  <button className="px-2 py-1 border border-[#C9D0D8] text-[#5B6675] rounded text-[10px] font-medium hover:bg-[#EDF0F3]">Reject</button>
                  <button className="px-2 py-1 border border-[#C9D0D8] text-[#5B6675] rounded text-[10px] font-medium hover:bg-[#EDF0F3]">Correct</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-4">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 border border-[#C9D0D8] rounded bg-[#FAF8FD]">
                <p className="text-sm text-[#1B2430]">Add boundary tests for checkout total calculation</p>
                <p className="text-xs text-[#55398C] mt-1">Cites: TC-004, CI run #42</p>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1 bg-[#E3F2EA] text-[#14633E] rounded text-[10px] font-medium">Accept</button>
                  <button className="px-3 py-1 border border-[#C9D0D8] text-[#5B6675] rounded text-[10px] font-medium hover:bg-[#EDF0F3]">Dismiss</button>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#C9D0D8] rounded p-4">
              <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Coverage trend</h3>
              <div className="h-32 flex items-end gap-2">
                {[30, 45, 50, 55, 60, 65, 70].map((v, i) => (
                  <div key={i} className="flex-1 bg-[#1F6F8B] rounded-t-sm" style={{ height: `${v}%` }} />
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#C9D0D8] rounded p-4">
              <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Flaky tests</h3>
              <div className="h-32 flex items-end gap-2">
                {[2, 1, 3, 1, 2, 4, 3].map((v, i) => (
                  <div key={i} className="flex-1 bg-[#EEE8F7] rounded-t-sm" style={{ height: `${v * 15}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assistant panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-4">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">AI assistant</h3>
            <div className="border border-[#C9D0D8] rounded p-3 h-48 overflow-y-auto text-sm text-[#5B6675] space-y-2">
              <p>Ask about project quality metrics. The assistant never sends secrets to the model.</p>
            </div>
            <div className="mt-3 flex gap-2">
              <input type="text" placeholder="Ask a question…" className="flex-1 border border-[#C9D0D8] rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#1F6F8B] outline-none" />
              <button className="bg-[#1F6F8B] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#134F63]">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
