import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { deleteTestCase } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BulkDeleteButton from "./BulkDeleteButton";
import TestCaseCreateForm from "./test-case-create-form";
import { FIELD_LIMITS } from "@/lib/validation";

const TEST_TYPES = [
  { value: "FUNCTIONAL", label: "Functional" },
  { value: "NEGATIVE", label: "Negative" },
  { value: "BOUNDARY", label: "Boundary" },
  { value: "REGRESSION", label: "Regression" },
  { value: "SMOKE", label: "Smoke" },
  { value: "EXPLORATORY", label: "Exploratory" },
  { value: "SECURITY", label: "Security" },
  { value: "ACCESSIBILITY", label: "Accessibility" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "API", label: "API" },
  { value: "DATABASE", label: "Database" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const SEVERITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const TEST_LEVELS = [
  { value: "UNIT", label: "Unit" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "SYSTEM", label: "System" },
  { value: "ACCEPTANCE", label: "Acceptance" },
];

const AUTOMATION_STATUSES = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATED", label: "Automated" },
  { value: "CANDIDATE", label: "Candidate for Automation" },
  { value: "NOT_SUITABLE", label: "Not Suitable" },
];

const TEST_ENVIRONMENTS = [
  { value: "DEVELOPMENT", label: "Development" },
  { value: "QA", label: "QA" },
  { value: "STAGING", label: "Staging" },
  { value: "PRODUCTION", label: "Production" },
];

const EXECUTION_STATUSES = [
  { value: "NOT_RUN", label: "Not Run" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "SKIPPED", label: "Skipped" },
];

export default async function TestCasesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const projectFilter = typeof searchParams?.project === "string" ? searchParams.project : undefined;
  const priorityFilter = typeof searchParams?.priority === "string" ? searchParams.priority : undefined;
  const automationFilter = typeof searchParams?.automation === "string" ? searchParams.automation : undefined;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { key: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (projectFilter) {
    where.projectId = projectFilter;
  }
  if (priorityFilter) {
    where.priority = priorityFilter;
  }
  if (automationFilter) {
    where.automationStatus = automationFilter;
  }

  const [testCases, projects, users, testSuites] = await Promise.all([
    prisma.testCase.findMany({
      where,
      include: { project: true, owner: true, steps: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.testSuite.findMany({ include: { testPlan: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="hidden lg:block w-72 bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Filters</h3>
        <form className="space-y-3">
          <div>
            <label className="text-xs text-[#5B6675]">Search</label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search cases..."
              className="input w-full mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-[#5B6675]">Project</label>
            <select name="project" defaultValue={projectFilter} className="input w-full mt-1">
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#5B6675]">Priority</label>
            <select name="priority" defaultValue={priorityFilter} className="input w-full mt-1">
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#5B6675]">Automation</label>
            <select name="automation" defaultValue={automationFilter} className="input w-full mt-1">
              <option value="">All</option>
              {AUTOMATION_STATUSES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Apply Filters</button>
          <Link href="/test-cases" className="btn-outline w-full text-center">Clear Filters</Link>
        </form>
      </aside>

      <div className="flex-1 space-y-6">
        <div className="bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
          <PageHeader
            breadcrumb="Test Cases"
            title="Test Cases Library"
            description="Manage and organize your test cases."
            actions={
              projects.length === 0 ? (
                <span className="text-xs text-[#8F2A20]">No projects found. Create a project first.</span>
              ) : (
                <Link href="/test-cases/create" className="btn-primary">Create Test Case</Link>
              )
            }
          />

          {projects.length === 0 && (
            <div className="bg-[#FBE7E4] border border-[#C9D0D8] rounded p-4 mt-4">
              <p className="text-sm text-[#8F2A20]">
                You must create a project before you can create test cases. Go to{" "}
                <Link href="/projects" className="text-[#1F6F8B] hover:underline font-medium">Projects</Link>
                to create one.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#5B6675]">{testCases.length} test case(s) found</p>
            <BulkDeleteButton />
          </div>
          {testCases.length === 0 ? (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
              <p className="text-sm text-[#5B6675]">No test cases found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#C9D0D8] rounded overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-[#F5F7F9]">
                  <tr>
                    <th className="table-header px-4 py-3 w-20">
                      <input type="checkbox" onChange={(e) => {
                        document.querySelectorAll('input[name="ids"]').forEach((cb) => {
                          (cb as HTMLInputElement).checked = e.target.checked;
                        });
                      }} />
                    </th>
                    <th className="table-header px-4 py-3">ID</th>
                    <th className="table-header px-4 py-3">Title</th>
                    <th className="table-header px-4 py-3">Type</th>
                    <th className="table-header px-4 py-3">Priority</th>
                    <th className="table-header px-4 py-3">Severity</th>
                    <th className="table-header px-4 py-3">Status</th>
                    <th className="table-header px-4 py-3">Automation</th>
                    <th className="table-header px-4 py-3">Owner</th>
                    <th className="table-header px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D0D8]">
                  {testCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-[#EDF0F3]">
                      <td className="px-4 py-3"><input type="checkbox" name="ids" value={tc.id} /></td>
                      <td className="px-4 py-3 text-[#1B2430] font-medium">{tc.key}</td>
                      <td className="px-4 py-3"><Link href={`/test-cases/${tc.id}`} className="text-[#1F6F8B] hover:underline">{tc.title}</Link></td>
                      <td className="px-4 py-3">{tc.testType ? <span className="badge status-accent">{tc.testType}</span> : <span className="text-[#5B6675]">—</span>}</td>
                      <td className="px-4 py-3"><span className={`badge ${tc.priority === "HIGH" || tc.priority === "CRITICAL" ? "status-fail" : tc.priority === "MEDIUM" ? "status-blocked" : "status-neutral"}`}>{tc.priority}</span></td>
                      <td className="px-4 py-3"><span className="badge status-neutral">{tc.severity}</span></td>
                      <td className="px-4 py-3"><span className={`badge ${tc.status === "PASSED" ? "status-pass" : tc.status === "FAILED" ? "status-fail" : tc.status === "BLOCKED" ? "status-warn" : "status-neutral"}`}>{tc.status}</span></td>
                      <td className="px-4 py-3 text-[#5B6675]">{tc.automationStatus}</td>
                      <td className="px-4 py-3 text-[#5B6675]">{tc.owner?.name || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/test-cases/${tc.id}`} className="btn-link mr-3 text-xs">View</Link>
                        <Link href={`/test-cases/${tc.id}/edit`} className="btn-link mr-3 text-xs">Edit</Link>
                        <form action={deleteTestCase} className="inline-block">
                          <input type="hidden" name="id" value={tc.id} />
                          <button className="btn-destructive text-xs px-2 py-1">Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
