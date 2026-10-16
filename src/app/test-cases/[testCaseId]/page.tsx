import { prisma } from "@/lib/prisma";
import { addTestStep, updateTestStep, deleteTestStep, uploadExecutionAttachment } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function TestCaseDetailPage({
  params,
}: {
  params: Promise<{ testCaseId: string }>;
}) {
  const { testCaseId } = await params;
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: {
      steps: { orderBy: { position: "asc" } },
      executions: { include: { tester: true }, orderBy: { createdAt: "desc" } },
      project: true,
      owner: true,
      defects: true,
      versions: { orderBy: { version: "desc" }, include: { changedBy: { select: { name: true } } } },
      attachments: { include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!testCase) {
    return <div className="p-[28px]">Test case not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Cases"
        title={testCase.key + " — " + testCase.title}
        description="Test case detail with steps and executions."
        actions={
          <div className="flex items-center gap-2">
            <form action={async (formData: FormData) => {
              "use server";
              const id = formData.get("id") as string;
              const testCase = await prisma.testCase.findUnique({ where: { id } });
              if (!testCase) return;
              await prisma.testCase.create({
                data: {
                  key: testCase.key + "-COPY",
                  title: testCase.title + " (Copy)",
                  description: testCase.description,
                  objective: testCase.objective,
                  preconditions: testCase.preconditions,
                  priority: testCase.priority,
                  status: "DRAFT",
                  component: testCase.component,
                  projectId: testCase.projectId,
                  ownerId: testCase.ownerId,
                },
              });
            }}
            className="inline"
          >
              <input type="hidden" name="id" value={testCaseId} />
              <button className="btn-link text-sm mr-3">Clone</button>
            </form>
            <Link href={`/test-cases/${testCaseId}/edit`} className="btn-link text-sm mr-3">
              Edit
            </Link>
            <Link href="/test-cases" className="btn-link text-sm mr-3">
              Back to test cases
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Objective</h2>
            <p className="text-sm text-[#5B6675]">{testCase.objective || "No objective defined."}</p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Preconditions</h2>
            <p className="text-sm text-[#5B6675]">{testCase.preconditions || "None"}</p>
          </div>

          {testCase.gherkinText && (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
              <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Gherkin Scenario</h2>
              <pre className="text-xs text-[#5B6675] font-mono whitespace-pre-wrap bg-[#F5F7F9] p-3 rounded overflow-x-auto">
                {testCase.gherkinText}
              </pre>
            </div>
          )}

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Test steps</h2>
            <form action={addTestStep} className="space-y-3 mb-4">
              <input type="hidden" name="testCaseId" value={testCaseId} />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">#</label>
              <input name="position" type="number" defaultValue={String(testCase.steps.length + 1)} className="input w-20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Action</label>
              <input name="action" placeholder="Step action" className="input" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Expected result</label>
              <input name="expectedResult" placeholder="Expected result" className="input" required />
            </div>
                <button className="btn-primary w-full text-xs px-3 py-1.5">Add step</button>
              </div>
            </form>

            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                    <th className="table-header px-4 py-3 w-10">#</th>
                    <th className="table-header px-4 py-3">Action</th>
                    <th className="table-header px-4 py-3 text-right">Expected result</th>
                    <th className="table-header px-4 py-3 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                {testCase.steps.map((step, i) => (
                  <tr key={step.id} className="hover:bg-[#EDF0F3]">
                    <td className="px-4 py-3 text-[#5B6675] text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-[#1B2430]">{step.action}</td>
                    <td className="px-4 py-3 text-[#5B6675] text-right">{step.expectedResult}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={updateTestStep} className="inline-flex items-end gap-1">
                        <input type="hidden" name="id" value={step.id} />
                        <input type="hidden" name="testCaseId" value={testCaseId} />
                        <input name="action" defaultValue={step.action} className="input w-24 text-xs" />
                        <input name="expectedResult" defaultValue={step.expectedResult} className="input w-24 text-xs" />
                        <input name="position" type="number" defaultValue={String(step.position)} className="input w-12 text-xs" />
                        <button className="btn-link text-xs">Save</button>
                      </form>
                      <form action={deleteTestStep} className="inline">
                        <input type="hidden" name="id" value={step.id} />
                        <input type="hidden" name="testCaseId" value={testCaseId} />
                        <button className="btn-destructive text-xs">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {testCase.steps.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-[#5B6675] text-center">
                      No steps defined.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {testCase.executions.length > 0 && (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
              <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Executions</h2>
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F7F9]">
                  <tr>
                    <th className="table-header px-4 py-3">Status</th>
                    <th className="table-header px-4 py-3">Tester</th>
                    <th className="table-header px-4 py-3">Environment</th>
                    <th className="table-header px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D0D8]">
                  {testCase.executions.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3">
                        <span className={`badge ${e.status === "PASSED" ? "status-pass" : e.status === "FAILED" ? "status-fail" : "status-neutral"}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#5B6675] text-xs">{e.tester?.name || "—"}</td>
                      <td className="px-4 py-3 text-[#5B6675] text-xs">{e.environment || "—"}</td>
                      <td className="px-4 py-3 text-[#5B6675] text-xs">{e.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {testCase.versions.length > 0 && (
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Version History</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                  <th className="table-header px-4 py-3">Version</th>
                  <th className="table-header px-4 py-3">Changed by</th>
                  <th className="table-header px-4 py-3">Changed at</th>
                  <th className="table-header px-4 py-3 text-right">Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                {testCase.versions.map((v) => (
                  <tr key={v.id} className="hover:bg-[#EDF0F3]">
                    <td className="px-4 py-3 text-[#1B2430] font-medium">v{v.version}</td>
                    <td className="px-4 py-3 text-[#5B6675]">{v.changedBy?.name || "System"}</td>
                    <td className="px-4 py-3 text-[#5B6675] text-xs">{new Date(v.changedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right text-[#5B6675]">{v.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">{testCase.key}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Project</p>
                <p className="text-[#5B6675]">{testCase.project?.name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Priority</p>
                <p className="text-[#5B6675]"><span className="badge status-pass">{testCase.priority}</span></p>
              </div>
              {testCase.testType && (
                <div className="space-y-1">
                  <p className="text-xs text-[#5B6675] uppercase tracking-wider">Test type</p>
                  <p className="text-[#5B6675]"><span className="badge status-accent">{testCase.testType}</span></p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Severity</p>
                <p className="text-[#5B6675]">{testCase.severity || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Status</p>
                <p className="text-[#5B6675]"><span className="badge status-neutral">{testCase.status}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Owner</p>
                <p className="text-[#5B6675]">{testCase.owner?.name || "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Attachments</h3>
            <form action={uploadExecutionAttachment} className="flex gap-2 mb-3">
              <input type="hidden" name="testCaseId" value={testCaseId} />
              <input type="hidden" name="uploadedById" value={testCase.ownerId} />
              <input type="file" name="file" accept="image/*,.pdf,.json,.zip,.md,.csv" className="input w-48 text-xs" />
              <button className="btn-primary text-xs">Upload</button>
            </form>
            {testCase.attachments.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {testCase.attachments.map((att) => (
                  <li key={att.id} className="flex items-center justify-between">
                    <span className="text-[#5B6675]">{att.originalName}</span>
                    <a
                      href={`/api/v1/attachments/${att.id}`}
                      className="btn-link text-xs"
                      download
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#5B6675]">No attachments.</p>
            )}

          {testCase.defects.length > 0 && (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
              <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Linked defects</h3>
              <ul className="space-y-2 text-sm text-[#5B6675]">
                {testCase.defects.map((d) => (
                  <li key={d.id}>
                    <Link href={`/defects/${d.id}`} className="text-[#1F6F8B] hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
