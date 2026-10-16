import { prisma } from "@/lib/prisma";
import { createStrategy } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { FIELD_LIMITS } from "@/lib/validation";

const STRATEGY_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "SUPERSEDED", label: "Superseded" },
];

export default async function StrategiesPage() {
  const [strategies, projects] = await Promise.all([
    prisma.testStrategy.findMany({
      include: { project: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Strategies"
        title="Test Strategies"
        description="Define the overall testing approach, standards, risks and quality objectives per project."
        actions={
          projects.length === 0 ? (
            <span className="text-xs text-[#8F2A20]">
              No projects found. Create a project first.
            </span>
          ) : (
            <form action={createStrategy} className="space-y-4 mt-4">
              <input type="hidden" name="version" defaultValue="1.0" />
              <input type="hidden" name="status" defaultValue="DRAFT" />

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Strategy name <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="name"
                  placeholder="e.g. Regression Testing Strategy"
                  className="input w-full md:w-72"
                  required
                  maxLength={FIELD_LIMITS.title}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Project <span className="text-[#8F2A20]">*</span>
                </label>
                <select name="projectId" className="input" required>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Purpose and objectives <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="purposeAndObjectives"
                  rows={2}
                  placeholder="Intended testing outcomes"
                  className="input w-full md:w-96"
                  required
                  maxLength={FIELD_LIMITS.objective}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Risk-based approach <span className="text-[#8F2A20]">*</span>
                </label>
                <textarea
                  name="riskBasedApproach"
                  rows={2}
                  placeholder="How testing effort is prioritised"
                  className="input w-full md:w-96"
                  required
                  maxLength={FIELD_LIMITS.objective}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Test levels <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="testLevels"
                  placeholder="Unit, integration, system, acceptance"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Test types <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="testTypes"
                  placeholder="Functional, regression, security, performance, API"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Test data approach <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="testDataApproach"
                  placeholder="Creation, masking, privacy, access, cleanup"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Automation strategy <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="automationStrategy"
                  placeholder="What to automate, tooling and maintenance"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Defect management <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="defectManagement"
                  placeholder="Severity, triage, ownership and retesting"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Roles and responsibilities <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="rolesAndResponsibilities"
                  placeholder="Accountability for testing and approvals"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Quality metrics <span className="text-[#8F2A20]">*</span>
                </label>
                <input
                  name="qualityMetrics"
                  placeholder="Coverage, defect trends, pass rates, risk measures"
                  className="input w-full md:w-72"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Scope and exclusions
                </label>
                <input
                  name="scopeAndExclusions"
                  placeholder="Coverage boundaries"
                  className="input w-full md:w-72"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                  Status
                </label>
                <select name="status" className="input">
                  {STRATEGY_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#C9D0D8]">
                <button className="btn-primary">Create Strategy</button>
                <button type="button" className="btn-outline">Cancel</button>
              </div>
            </form>
          )
        }
      />

      {projects.length === 0 && (
        <div className="bg-[#FBE7E4] border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-sm text-[#8F2A20]">
            You must create a project before you can create test strategies. Go to{" "}
            <Link href="/projects" className="text-[#1F6F8B] hover:underline font-medium">
              Projects
            </Link>
            to create one.
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <>
          {strategies.length === 0 ? (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
              <p className="text-sm text-[#5B6675]">No test strategies yet. Create your first strategy above.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F7F9]">
                  <tr>
                    <th className="table-header px-4 py-3">Strategy</th>
                    <th className="table-header px-4 py-3">Project</th>
                    <th className="table-header px-4 py-3">Version</th>
                    <th className="table-header px-4 py-3">Status</th>
                    <th className="table-header px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D0D8]">
                  {strategies.map((strategy) => (
                    <tr key={strategy.id} className="hover:bg-[#EDF0F3]">
                      <td className="px-4 py-3">
                        <Link href={`/strategies/${strategy.id}`} className="text-[#1F6F8B] hover:underline font-medium">
                          {strategy.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#5B6675]">{strategy.project?.name}</td>
                      <td className="px-4 py-3 text-[#5B6675]">{strategy.version}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${strategy.status === "APPROVED" ? "status-pass" : strategy.status === "DRAFT" ? "status-neutral" : "status-warn"}`}>
                          {strategy.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/strategies/${strategy.id}`} className="btn-link mr-3">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
