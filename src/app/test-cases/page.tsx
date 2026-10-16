import { prisma } from "@/lib/prisma";
import { createTestCase, deleteTestCase, bulkDeleteTestCases } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BulkDeleteButton from "./BulkDeleteButton";
import { FIELD_LIMITS } from "@/lib/validation";

export default async function TestCasesPage() {
  const [testCases, projects, users] = await Promise.all([
    prisma.testCase.findMany({
      include: { project: true, owner: true, steps: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany(),
    prisma.user.findMany(),
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="hidden lg:block w-72 bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Suites</h3>
        <ul className="space-y-1 text-sm text-[#5B6675]">
          <li className="flex items-center gap-2">
            <span>▾</span>
            <span className="text-[#1B2430] font-medium">All cases</span>
          </li>
          {projects.map((project) => (
            <li key={project.id} className="pl-4">
              <span>▸</span>
              <Link
                href={`/test-cases?project=${project.id}`}
                className="text-[#1F6F8B] hover:underline"
              >
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex-1 space-y-4">
        <PageHeader
          breadcrumb="Test Cases"
          title="Test Cases"
          description="Manage manual and automated test cases."
          actions={
            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
              <form action={createTestCase} className="flex flex-col lg:flex-row lg:items-center gap-2">
                <input name="key" placeholder="Key (e.g. TC-001)" maxLength={FIELD_LIMITS.key} className="input w-40" required />
                <input name="title" placeholder="Title" maxLength={FIELD_LIMITS.title} className="input flex-1" required />
                <select name="projectId" className="input">
                  <option value="">Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select name="ownerId" className="input">
                  <option value="">Owner</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <select name="testType" className="input w-40">
                  <option value="">Test type</option>
                  <option value="UI_AUTOMATION">UI Automation</option>
                  <option value="API">API</option>
                  <option value="DATABASE">Database</option>
                  <option value="SECURITY">Security</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="ACCESSIBILITY">Accessibility</option>
                  <option value="FRONTEND">Frontend</option>
                  <option value="BACKEND">Backend</option>
                  <option value="GHERKIN">Gherkin / BDD</option>
                </select>
                <button className="btn-primary">Create</button>
              </form>
              <div className="flex items-center gap-2">
                <a href="/api/v1/test-cases/export" className="btn-outline text-xs px-3 py-1.5" download>
                  Export JSON
                </a>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const file = formData.get("file") as File;
                    const formData2 = new FormData();
                    formData2.append("file", file);
                    await fetch("/api/v1/test-cases/import", {
                      method: "POST",
                      body: formData2,
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <input type="file" name="file" accept=".json" className="input" />
                  <button className="btn-outline text-xs px-3 py-1.5">Import JSON</button>
                </form>
              </div>
            </div>
          }
        />

        {testCases.length === 0 ? (
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
            <p className="text-sm text-[#5B6675]">No test cases yet. Create your first test case above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <BulkDeleteButton action={bulkDeleteTestCases} />

            <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
              <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                  <tr>
                    <th className="table-header px-4 py-3 w-20"><input type="checkbox" /></th>
                    <th className="table-header px-4 py-3">Key</th>
                    <th className="table-header px-4 py-3">Title</th>
                    <th className="table-header px-4 py-3">Type</th>
                    <th className="table-header px-4 py-3">Priority</th>
                    <th className="table-header px-4 py-3">Status</th>
                    <th className="table-header px-4 py-3">Automation</th>
                    <th className="table-header px-4 py-3">Owner</th>
                    <th className="table-header px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D0D8]">
                  {testCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-[#EDF0F3]">
                      <td className="px-4 py-3">
                        <input type="checkbox" name="ids" value={tc.id} data-tc-id={tc.id} />
                      </td>
                      <td className="px-4 py-3 text-[#1B2430] font-medium">
                        <span>{tc.key}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/test-cases/${tc.id}`} className="text-[#1F6F8B] hover:underline">
                          {tc.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{tc.testType ? <span className="badge status-accent">{tc.testType}</span> : <span className="text-[#5B6675]">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${tc.priority === "HIGH" ? "status-fail" : tc.priority === "MEDIUM" ? "status-blocked" : "status-neutral"}`}>{tc.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge status-neutral">{tc.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[#5B6675]">Not mapped</td>
                      <td className="px-4 py-3 text-[#5B6675]">{tc.owner?.name || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/test-cases/${tc.id}`} className="btn-link mr-3">
                          Edit
                        </Link>
                        <form action={deleteTestCase} className="inline-block">
                          <input type="hidden" name="id" value={tc.id} />
                          <button className="btn-destructive">Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
