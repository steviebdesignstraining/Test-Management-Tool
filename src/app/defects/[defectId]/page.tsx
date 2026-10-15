import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function DefectDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Defects"
        title="D-004 — Login fails on Safari"
        description="High severity defect reported by Sam Chen"
        actions={
          <button className="btn-primary text-xs px-3 py-1.5">Resolve</button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Expected vs actual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Expected result</p>
                <p className="text-[#1B2430]">User is logged in and redirected to dashboard.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Actual result</p>
                <p className="text-[#1B2430]">Error page displayed: "Invalid credentials" despite correct input.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Test case</p>
                <p className="text-[#1B2430]"><Link href="/test-cases/TC-001" className="text-[#1F6F8B] hover:underline">TC-001</Link></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Execution</p>
                <p className="text-[#1B2430]"><Link href="/test-executions/ex-002" className="text-[#1F6F8B] hover:underline">EX-002</Link></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">CI run</p>
                <p className="text-[#1B2430]"><Link href="#" className="text-[#1F6F8B] hover:underline">main #42</Link></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Jira issue</p>
                <p className="text-[#1B2430]"><Link href="#" className="text-[#1F6F8B] hover:underline">PROJ-123</Link></p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Activity</h2>
            <div className="space-y-3 text-sm text-[#5B6675]">
              <div className="flex gap-2">
                <span className="text-[#5B6675]">2h ago</span>
                <span className="text-[#1B2430]">Sam Chen created this defect</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#5B6675]">1h ago</span>
                <span className="text-[#1B2430]">Linked to test case TC-001</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-[28px]">
            <div className="flex items-start gap-3">
              <span className="text-[#6B4FA3]">AI</span>
              <div>
                <p className="text-sm font-semibold text-[#1B2430] mb-1">AI root-cause hypothesis</p>
                <p className="text-xs text-[#55398C]">Safari may be storing credentials in a different keychain, causing authentication to fail. Cites: TC-001 execution log.</p>
                <p className="text-xs text-[#55398C] mt-1">Potential duplicate: D-002 "Login fails on Chrome"</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">D-004</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Severity</p>
                <p className="text-[#5B6675]"><span className="badge status-fail">High</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Status</p>
                <p className="text-[#5B6675]"><span className="badge status-neutral">Open</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Assignee</p>
                <p className="text-[#5B6675]">Sam Chen</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Environment</p>
                <p className="text-[#5B6675]">Safari 17, macOS Sonoma</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Build</p>
                <p className="text-[#5B6675]">v2.4.1</p>
              </div>
            </div>
          </div>

          <button className="btn-outline w-full flex items-center justify-center gap-2">
            Create GitHub issue
          </button>
        </div>
      </div>
    </div>
  );
}
