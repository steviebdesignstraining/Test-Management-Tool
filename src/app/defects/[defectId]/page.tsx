import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function DefectDetailPage({
  params,
}: {
  params: Promise<{ defectId: string }>;
}) {
  const { defectId } = await params;
  const defect = await prisma.defect.findUnique({
    where: { id: defectId },
    include: {
      testCase: true,
      testExecution: true,
      reporter: true,
      assignee: true,
    },
  });

  if (!defect) {
    return <div className="p-[28px]">Defect not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Defects"
        title={defect.title}
        description={`Severity: ${defect.severity} • Status: ${defect.status}`}
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
                <p className="text-[#1B2430]">{defect.expectedResult || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Actual result</p>
                <p className="text-[#1B2430]">{defect.actualResult || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Test case</p>
                {defect.testCase ? (
                  <p className="text-[#1B2430]">
                    <Link href={`/test-cases/${defect.testCaseId}`} className="text-[#1F6F8B] hover:underline">
                      {defect.testCase.key}
                    </Link>
                  </p>
                ) : (
                  <p className="text-[#5B6675]">—</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Execution</p>
                  {defect.testExecution ? (
                    <p className="text-[#1B2430]">
                      <Link href="/test-runs" className="text-[#1F6F8B] hover:underline">
                        EX-{defect.testExecutionId?.slice(-4).toUpperCase()}
                      </Link>
                    </p>
                  ) : (
                  <p className="text-[#5B6675]">—</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">CI run</p>
                <p className="text-[#5B6675]">—</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Jira issue</p>
                <p className="text-[#5B6675]">—</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Activity</h2>
            <div className="space-y-3 text-sm text-[#5B6675]">
              <div className="flex gap-2">
                <span className="text-[#5B6675]">{new Date(defect.createdAt).toLocaleDateString()}</span>
                <span className="text-[#1B2430]">{defect.reporter?.name} created this defect</span>
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
                <p className="text-[#1B2430] font-medium">D-{defect.id.slice(-4).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Severity</p>
                <p className="text-[#5B6675]">
                  <span className={`badge ${defect.severity === "HIGH" ? "status-fail" : "status-neutral"}`}>
                    {defect.severity}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Status</p>
                <p className="text-[#5B6675]"><span className="badge status-neutral">{defect.status}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Assignee</p>
                <p className="text-[#5B6675]">{defect.assignee?.name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Environment</p>
                <p className="text-[#5B6675]">{defect.environment || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Build</p>
                <p className="text-[#5B6675]">{defect.build || "—"}</p>
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
