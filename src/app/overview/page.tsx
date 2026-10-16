import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export default async function OverviewPage() {
  const [testCases, executions, defects, projects] = await Promise.all([
    prisma.testCase.findMany({ include: { steps: true } }),
    prisma.testExecution.findMany({ include: { stepResults: true } }),
    prisma.defect.findMany(),
    prisma.project.findMany(),
  ]);

  const totalCases = testCases.length;
  const totalExecutions = executions.length;
  const passed = executions.filter((e) => e.status === "PASSED").length;
  const failed = executions.filter((e) => e.status === "FAILED").length;
  const blocked = executions.filter((e) => e.status === "BLOCKED").length;
  const passRate = totalExecutions > 0 ? Math.round((passed / totalExecutions) * 100) : 0;

  // Automation pass rate: executions that have step results (automated) vs total with step results
  const automatedExecutions = executions.filter((e) => e.stepResults && e.stepResults.length > 0);
  const automatedPassed = automatedExecutions.filter((e) => e.status === "PASSED").length;
  const automationPassRate = automatedExecutions.length > 0 ? Math.round((automatedPassed / automatedExecutions.length) * 100) : 0;

  // Mapping coverage: test cases with at least one step defined ÷ total test cases
  const mappedCases = testCases.filter((tc) => tc.steps && tc.steps.length > 0).length;
  const mappingCoverage = totalCases > 0 ? Math.round((mappedCases / totalCases) * 100) : 0;

  // Pipeline success: successful executions ÷ total executions
  const pipelineSuccess = totalExecutions > 0 ? Math.round((passed / totalExecutions) * 100) : 0;
  const openDefects = defects.filter((d) => d.status === "OPEN").length;

  // Trend data from real execution history grouped by day
  const trendData = executions
    .filter((e) => e.createdAt)
    .reduce((acc, e) => {
      const day = e.createdAt!.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = { passed: 0, total: 0 };
      acc[day].total += 1;
      if (e.status === "PASSED") acc[day].passed += 1;
      return acc;
    }, {} as Record<string, { passed: number; total: number }>);
  const trendDays = Object.entries(trendData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([, data]) => (data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0));

  const exitBadge = openDefects > 0
    ? "text-xs px-2 py-1 bg-[#FBE7E4] text-[#8F2A20] rounded"
    : "text-xs px-2 py-1 bg-[#E3F2EA] text-[#14633E] rounded";
  const gateBadge = passRate < 90
    ? "text-xs px-2 py-1 bg-[#FBEFD9] text-[#7A4600] rounded"
    : "text-xs px-2 py-1 bg-[#E3F2EA] text-[#14633E] rounded";

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
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{passRate}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ total executions ({totalExecutions})</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Automation pass rate</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{automationPassRate}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ automated executions</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapping coverage</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{mappingCoverage}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Mapped ÷ eligible manual cases</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Pipeline success</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{pipelineSuccess}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Successful ÷ total runs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Manual execution results</h2>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#5B6675] mb-1">
                <span>Passed</span><span>{passed}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-pass" style={{ width: totalExecutions > 0 ? Math.round((passed / totalExecutions) * 100) + "%" : "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#5B6675] mb-1">
                <span>Failed</span><span>{failed}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-fail" style={{ width: totalExecutions > 0 ? Math.round((failed / totalExecutions) * 100) + "%" : "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#5B6675] mb-1">
                <span>Blocked</span><span>{blocked}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-blocked" style={{ width: totalExecutions > 0 ? Math.round((blocked / totalExecutions) * 100) + "%" : "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#5B6675] mb-1">
                <span>Not run</span><span>{totalCases - totalExecutions}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-neutral" style={{ width: totalCases > 0 ? Math.round(((totalCases - totalExecutions) / totalCases) * 100) + "%" : "0%" }} />
              </div>
            </div>
          </div>
          <p className="text-xs text-[#5B6675] mt-3">{totalExecutions} executions in the system.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Automated execution results</h2>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-[#5B6675] mb-1">
                <span>Passed</span><span>{passed}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-pass" style={{ width: totalExecutions > 0 ? Math.round((passed / totalExecutions) * 100) + "%" : "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#5B6675] mb-1">
                <span>Failed</span><span>{failed}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill status-fail" style={{ width: totalExecutions > 0 ? Math.round((failed / totalExecutions) * 100) + "%" : "0%" }} />
              </div>
            </div>
          </div>
          <p className="text-xs text-[#5B6675] mt-3">{totalExecutions} automated runs.</p>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Pass rate trend</h2>
        <div className="h-40 border-b border-[#C9D0D8] flex items-end gap-1 pb-4">
          {trendDays.map((v, i) => (
            <div key={i} className="w-full bg-[#1F6F8B] rounded-t-sm" style={{ height: v + "%" }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#5B6675] mt-2">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <p className="text-xs text-[#5B6675] mt-3">Trend based on execution history.</p>
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
              <span className={exitBadge}>{openDefects > 0 ? "No" : "Yes"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5B6675]">Quality gate</span>
              <span className={gateBadge}>{passRate < 90 ? "Warning" : "Pass"}</span>
            </div>
            <div className="w-full bg-[#EDF0F3] h-2 rounded-full mt-2">
              <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: passRate + "%" }} />
            </div>
            <p className="text-xs text-[#5B6675] mt-1">Plan progress: {passRate}%</p>
          </div>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Recent CI runs</h2>
          <p className="text-sm text-[#5B6675]">No CI runs yet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Flaky tests</h2>
          <p className="text-sm text-[#5B6675]">{failed > 0 ? failed + " failed executions" : "No flaky tests detected."}</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Integration health</h2>
          <p className="text-sm text-[#5B6675]">No integrations configured.</p>
        </div>
        <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-2 flex items-center gap-1">
            <span className="badge status-accent">AI summary</span>
            AI-generated summary
          </h2>
          <p className="text-sm text-[#1B2430] mb-2">
            {totalCases} test cases and {totalExecutions} executions tracked.{" "}
            {openDefects > 0 ? openDefects + " open defects need attention." : "No open defects."}
          </p>
          <p className="text-xs text-[#5B6675]">Confidence is a prioritisation signal, not proof.</p>
        </div>
      </div>
    </div>
  );
}
