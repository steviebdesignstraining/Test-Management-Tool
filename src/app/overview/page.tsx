import PageHeader from "@/components/PageHeader";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Home"
        title="Overview"
        description="One source of truth for test evidence."
        actions={
          <div className="flex items-center gap-3">
            <select className="input w-48">
              <option>Checkout Web</option>
            </select>
            <button className="btn-primary">Save view</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Manual pass rate</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ eligible completed</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Automation pass rate</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ eligible completed</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapping coverage</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Mapped ÷ eligible manual cases</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Pipeline success</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Successful ÷ total runs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Manual execution results</h2>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Passed</span><span>4</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-pass" style={{ width: "50%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Failed</span><span>2</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-fail" style={{ width: "25%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Blocked</span><span>1</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-blocked" style={{ width: "12%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Not run</span><span>1</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-neutral" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#5B6675] mt-3">Sample data — 8 eligible cases in the last 7 days.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Automated execution results</h2>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Passed</span><span>3</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-pass" style={{ width: "37%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Failed</span><span>1</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-fail" style={{ width: "12%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Flaky</span><span>2</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-flaky" style={{ width: "25%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#5B6675] mb-1">
                <span>Skipped</span><span>1</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-neutral" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#5B6675] mt-3">Sample data — 8 automated runs in the last 7 days.</p>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Pass rate trend</h2>
        <div className="h-40 border-b border-[#C9D0D8] flex items-end gap-1 pb-4">
          {[20, 35, 30, 45, 40, 55, 50].map((v, i) => (
            <div key={i} className="w-full bg-[#1F6F8B] rounded-t-sm" style={{ height: `${v}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#5B6675] mt-2">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <p className="text-[10px] text-[#5B6675] mt-3">No data yet — run tests to populate the trend.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Release readiness</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5B6675]">Entry criteria met</span>
              <span className="text-xs px-2 py-1 bg-[#E3F2EA] text-[#14633E] rounded">Yes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5B6675]">Exit criteria met</span>
              <span className="text-xs px-2 py-1 bg-[#FBE7E4] text-[#8F2A20] rounded">No</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5B6675]">Quality gate</span>
              <span className="text-xs px-2 py-1 bg-[#FBEFD9] text-[#7A4600] rounded">Warning</span>
            </div>
            <div className="w-full bg-[#EDF0F3] h-2 rounded-full mt-2">
              <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: "65%" }} />
            </div>
            <p className="text-[10px] text-[#5B6675] mt-1">Plan progress: 65% <span className="sample-badge">Sample data</span></p>
          </div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Recent CI runs</h2>
          <div className="text-sm text-[#5B6675]">No CI runs yet.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Flaky tests</h2>
          <div className="text-sm text-[#5B6675]">No flaky tests detected.</div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Integration health</h2>
          <div className="text-sm text-[#5B6675]">No integrations configured.</div>
        </div>
        <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-2 flex items-center gap-1">
            <span className="text-[10px] bg-[#6B4FA3] text-white px-1.5 py-0.5 rounded">AI summary</span>
            AI-generated summary
          </h2>
          <p className="text-sm text-[#1B2430] mb-2">No recent activity to summarize. Run tests to generate insights.</p>
          <p className="text-[10px] text-[#5B6675]">Confidence is a prioritisation signal, not proof.</p>
        </div>
      </div>
    </div>
  );
}
