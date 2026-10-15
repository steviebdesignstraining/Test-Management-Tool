import PageHeader from "@/components/PageHeader";

export default function TestRunsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Runs"
        title="Test Runs"
        description="Execute test cases and record results."
        actions={
          <button className="btn-primary">New run</button>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Run progress</h3>
        <div className="w-full bg-[#EDF0F3] h-2 rounded-full">
          <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: "40%" }} />
        </div>
        <p className="text-[10px] text-[#5B6675] mt-1">4 of 10 cases executed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
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

        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Test Case: TC-001 Login with valid credentials</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                  <th className="table-header w-10">#</th>
                  <th className="table-header">Action</th>
                  <th className="table-header text-right">Expected</th>
                  <th className="table-header text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                <tr>
                  <td className="px-3 py-2 text-[#5B6675]">1</td>
                  <td className="px-3 py-2 text-[#1B2430]">Navigate to /login</td>
                  <td className="px-3 py-2 text-[#5B6675] text-right">Login page loads</td>
                  <td className="px-3 py-2 text-right">
                    <button className="badge status-pass">Pass</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-[#5B6675]">2</td>
                  <td className="px-3 py-2 text-[#1B2430]">Enter valid email and password</td>
                  <td className="px-3 py-2 text-[#5B6675] text-right">Fields populated</td>
                  <td className="px-3 py-2 text-right">
                    <button className="btn-outline text-[10px] px-3 py-1">Fail</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3">
              <label className="block text-xs font-medium text-[#5B6675] mb-1">Actual result</label>
              <textarea className="input w-full" rows={3} placeholder="Describe what happened…" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Outcome</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#5B6675]">Status</span>
              <span className="badge status-blocked">Blocked</span>
            </div>
            <button className="btn-destructive w-full mb-2 flex items-center justify-center gap-2">
              Not applicable
            </button>
            <button className="btn-outline w-full flex items-center justify-center gap-2">
              Create/link defect
            </button>
          </div>
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Evidence</h3>
            <button className="btn-outline w-full">Attach evidence</button>
          </div>
        </div>
      </div>
    </div>
  );
}
