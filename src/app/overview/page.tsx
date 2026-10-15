import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B2430]">Overview</h1>
          <p className="text-[#5B6675] text-sm">One source of truth for test evidence.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1F6F8B] outline-none">
            <option>Checkout Web</option>
          </select>
          <input
            type="text"
            placeholder="Search…"
            className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1F6F8B] outline-none w-48"
          />
          <button className="bg-[#1F6F8B] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#134F63]">
            Save view
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Manual pass rate</p>
          <p className="text-2xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ eligible completed</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Automation pass rate</p>
          <p className="text-2xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ eligible completed</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapping coverage</p>
          <p className="text-2xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Mapped ÷ eligible manual cases</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Pipeline success</p>
          <p className="text-2xl font-semibold text-[#1B2430] mt-1">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Successful ÷ total runs</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Manual execution results</h2>
          <div className="h-32 flex items-end gap-2">
            {[4, 2, 1, 0].map((v, i) => (
              <div key={i} className="flex-1 bg-[#E3F2EA] rounded-t-sm" style={{ height: `${v * 20}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#5B6675] mt-2">
            <span>Passed</span><span>Failed</span><span>Blocked</span><span>Not run</span>
          </div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Automated execution results</h2>
          <div className="h-32 flex items-end gap-2">
            {[3, 1, 2, 1].map((v, i) => (
              <div key={i} className="flex-1 bg-[#EDF0F3] rounded-t-sm" style={{ height: `${v * 20}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#5B6675] mt-2">
            <span>Passed</span><span>Failed</span><span>Flaky</span><span>Skipped</span>
          </div>
        </div>
      </div>

      {/* Pass rate trend */}
      <div className="bg-white border border-[#C9D0D8] rounded p-5">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Pass rate trend</h2>
        <div className="h-40 border-b border-[#C9D0D8] flex items-end gap-1 pb-4">
          {[20, 35, 30, 45, 40, 55, 50].map((v, i) => (
            <div key={i} className="w-full bg-[#1F6F8B] rounded-t-sm" style={{ height: `${v}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#5B6675] mt-2">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <p className="text-xs text-[#5B6675] mt-3">No data yet — run tests to populate the trend.</p>
      </div>

      {/* Release readiness + recent CI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
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
            <p className="text-[10px] text-[#5B6675] mt-1">Plan progress: 65%</p>
          </div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Recent CI runs</h2>
          <div className="text-sm text-[#5B6675]">No CI runs yet.</div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Flaky tests</h2>
          <div className="text-sm text-[#5B6675]">No flaky tests detected.</div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Integration health</h2>
          <div className="text-sm text-[#5B6675]">No integrations configured.</div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-5 ai-box p-4">
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
