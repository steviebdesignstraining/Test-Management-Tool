import PageHeader from "@/components/PageHeader";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Analytics / AI Insights"
        title="Analytics / AI Insights"
        description="Review AI suggestions, coverage trends and flaky tests."
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <div className="border-b border-[#C9D0D8] bg-[#F5F7F9] p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430]">Reconciliation review queue</h2>
          <p className="text-xs text-[#5B6675] mt-1">Approve, reject or correct AI suggestions. Auto-complete is off by default. Requires an approved mapping.</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header">Manual case</th>
              <th className="table-header">Automation result</th>
              <th className="table-header">Confidence</th>
              <th className="table-header text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#1B2430] font-medium">TC-001</td>
              <td className="px-4 py-3 text-[#5B6675]">login_test.py</td>
              <td className="px-4 py-3"><span className="badge status-accent">88% <span className="sample-badge" style={{ marginLeft: "6px" }}>Sample</span></span></td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-1">
                  <button className="badge status-pass">Approve</button>
                  <button className="btn-outline text-[10px] px-2 py-1">Reject</button>
                  <button className="btn-outline text-[10px] px-2 py-1">Correct</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-[28px] border border-[#C9D0D8] rounded bg-[#FAF8FD]">
                <p className="text-sm text-[#1B2430]">Add boundary tests for checkout total calculation</p>
                <p className="text-xs text-[#55398C] mt-1">Cites: TC-004, CI run #42</p>
                <div className="mt-2 flex gap-2">
                  <button className="badge status-pass">Accept</button>
                  <button className="btn-outline text-[10px] px-3 py-1">Dismiss</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
              <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Coverage trend</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                    <span>Week 1</span><span>30%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-[#1F6F8B]" style={{ width: "30%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                    <span>Week 7</span><span>70%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-[#1F6F8B]" style={{ width: "70%" }} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-[#5B6675] mt-3">Sample data — coverage over 7 weeks.</p>
            </div>
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
              <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Flaky tests</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                    <span>Week 1</span><span>2 flaky</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-[#EEE8F7] text-[#55398C]" style={{ width: "30%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                    <span>Week 7</span><span>3 flaky</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-[#EEE8F7] text-[#55398C]" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-[#5B6675] mt-3">Sample data — flaky tests over 7 weeks.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">AI assistant</h3>
            <div className="border border-[#C9D0D8] rounded p-3 h-48 overflow-y-auto text-sm text-[#5B6675] space-y-2">
              <p>Ask about project quality metrics. The assistant never sends secrets to the model.</p>
            </div>
            <div className="mt-3 flex gap-2">
              <input type="text" placeholder="Ask a question…" className="input flex-1" />
              <button className="btn-primary px-3 py-2">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
