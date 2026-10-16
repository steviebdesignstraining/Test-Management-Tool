import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ requirementId: string }>;
}) {
  const { requirementId } = await params;
  const requirement = await prisma.requirement.findUnique({
    where: { id: requirementId },
    include: {
      project: true,
      owner: true,
      testCases: { include: { testCase: true } },
      acceptanceCriteria: { orderBy: { position: "asc" } },
    },
  });

  if (!requirement) {
    return <div className="p-[28px]">Requirement not found.</div>;
  }

  const [testCases] = await Promise.all([
    prisma.testCase.findMany({ where: { projectId: requirement.projectId }, orderBy: { key: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Requirements"
        title={requirement.key + " — " + requirement.title}
        description="Requirement detail with acceptance criteria and linked test cases."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/requirements" className="btn-link text-sm mr-3">
              Back to requirements
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Description</h2>
            <p className="text-sm text-[#5B6675]">{requirement.description || "No description."}</p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Acceptance Criteria</h2>
            {requirement.acceptanceCriteria.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No acceptance criteria defined.</p>
            ) : (
              <ul className="space-y-2 text-sm text-[#5B6675]">
                {requirement.acceptanceCriteria.map((c, i) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <span className="text-[#1B2430] font-medium">{i + 1}.</span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Linked Test Cases</h2>
            {requirement.testCases.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No test cases linked yet.</p>
            ) : (
              <div className="space-y-2">
                {requirement.testCases.map((rtc) => (
                  <div key={rtc.id} className="flex items-center justify-between p-3 border border-[#C9D0D8] rounded">
                    <div>
                      <span className="text-[#1B2430] font-medium">{rtc.testCase.key}</span>
                      <br />
                      <span className="text-xs text-[#5B6675]">{rtc.testCase.title}</span>
                    </div>
                    <Link href={`/test-cases/${rtc.testCaseId}`} className="text-[#1F6F8B] text-sm hover:underline">
                      Open case
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <select id="link-test-case" className="input w-full mb-2">
                <option value="">Link a test case</option>
                {testCases.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.key} — {tc.title}
                  </option>
                ))}
              </select>
              <button className="btn-primary w-full text-xs px-3 py-1.5" onClick={() => {
                const select = document.getElementById("link-test-case") as HTMLSelectElement | null;
                if (!select || !select.value) return;
                fetch(`/api/v1/requirements/${requirementId}/test-cases`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ testCaseId: select.value }),
                }).then(() => window.location.reload());
              }}>
                Link
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">{requirement.key}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Project</p>
                <p className="text-[#5B6675]">{requirement.project?.name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Type</p>
                <p className="text-[#5B6675]">{requirement.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Priority</p>
                <p className="text-[#5B6675]"><span className={`badge ${requirement.priority === "HIGH" ? "status-fail" : requirement.priority === "MEDIUM" ? "status-blocked" : "status-neutral"}`}>{requirement.priority}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Status</p>
                <p className="text-[#5B6675]"><span className="badge status-neutral">{requirement.status}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Owner</p>
                <p className="text-[#5B6675]">{requirement.owner?.name || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Traceability</h3>
            <p className="text-xs text-[#5B6675] mb-3">
              {requirement.testCases.length} test case(s) linked to this requirement.
            </p>
            <div className="w-full bg-[#EDF0F3] h-2 rounded-full mb-2">
              <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <p className="text-xs text-[#5B6675]">Coverage: {requirement.testCases.length} test case(s)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
