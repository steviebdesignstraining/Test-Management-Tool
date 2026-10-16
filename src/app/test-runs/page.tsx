import { prisma } from "@/lib/prisma";
import { createExecution, updateStepResult, uploadAttachment } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function TestRunsPage() {
  const [executions, testCases, users] = await Promise.all([
    prisma.testExecution.findMany({
      include: {
        testCase: true,
        tester: true,
        stepResults: { include: { testStep: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.testCase.findMany(),
    prisma.user.findMany(),
  ]);

  const total = executions.length;
  const passed = executions.filter((e) => e.status === "PASSED").length;
  const failed = executions.filter((e) => e.status === "FAILED").length;
  const blocked = executions.filter((e) => e.status === "BLOCKED").length;
  const notRun = executions.filter((e) => e.status === "NOT_RUN").length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Runs"
        title="Test Runs"
        description="Execute test cases and record results."
        actions={
          <form action={createExecution} className="flex flex-col lg:flex-row lg:items-center gap-2">
            <select name="testCaseId" className="input">
              <option value="">Test case</option>
              {testCases.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.key} — {tc.title}
                </option>
              ))}
            </select>
            <select name="status" className="input">
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="NOT_RUN">Not run</option>
            </select>
            <select name="testerId" className="input">
              <option value="">Tester</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button className="btn-primary">Run</button>
          </form>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Run progress</h3>
        <div className="w-full bg-[#EDF0F3] h-2 rounded-full mb-2">
          <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: total > 0 ? `${Math.round((passed / total) * 100)}%` : "0%" }} />
        </div>
        <p className="text-xs text-[#5B6675]">{passed} of {total} cases executed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Case queue</h3>
            <div className="space-y-2 text-sm">
              {testCases.map((tc) => (
                <div key={tc.id} className="flex items-center justify-between p-3 border border-[#C9D0D8] rounded">
                  <span className="text-[#1B2430] font-medium">{tc.key}</span>
                  <span className="text-xs text-[#5B6675]">Pending</span>
                </div>
              ))}
              {testCases.length === 0 && <p className="text-sm text-[#5B6675]">No test cases.</p>}
            </div>
          </div>
          <p className="text-xs text-[#5B6675]">Keyboard: ↑/↓ navigate, 1-5 set status</p>
        </div>

        <div className="lg:col-span-6 space-y-4">
          {executions.length > 0 ? (
            executions.map((exec) => (
              <div key={exec.id} className="bg-white border border-[#C9D0D8] rounded p-[28px] mb-4">
                <h3 className="text-sm font-semibold text-[#1B2430] mb-3">
                  {exec.testCase?.key} — {exec.testCase?.title}
                </h3>
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F5F7F9]">
                    <tr>
                    <th className="table-header px-4 py-3 w-10">#</th>
                    <th className="table-header px-4 py-3">Action</th>
                    <th className="table-header px-4 py-3 text-right">Expected</th>
                    <th className="table-header px-4 py-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9D0D8]">
                    {exec.stepResults.map((sr, i) => (
                      <tr key={sr.id}>
                        <td className="px-3 py-3 text-[#5B6675]">{i + 1}</td>
                        <td className="px-3 py-3 text-[#1B2430]">{sr.testStep?.action || "Step"}</td>
                        <td className="px-3 py-3 text-[#5B6675] text-right">{sr.testStep?.expectedResult || "—"}</td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <form action={updateStepResult} className="inline">
                              <input type="hidden" name="id" value={sr.id} />
                              <input type="hidden" name="status" value="PASSED" />
                              <button className={`badge ${sr.status === "PASSED" ? "status-pass" : "status-neutral"} text-xs px-2 py-1`}>
                                Pass
                              </button>
                            </form>
                            <form action={updateStepResult} className="inline">
                              <input type="hidden" name="id" value={sr.id} />
                              <input type="hidden" name="status" value="FAILED" />
                              <button className={`badge ${sr.status === "FAILED" ? "status-fail" : "status-neutral"} text-xs px-2 py-1`}>
                                Fail
                              </button>
                            </form>
                            <form action={updateStepResult} className="inline">
                              <input type="hidden" name="id" value={sr.id} />
                              <input type="hidden" name="status" value="BLOCKED" />
                              <button className={`badge ${sr.status === "BLOCKED" ? "status-blocked" : "status-neutral"} text-xs px-2 py-1`}>
                                Blocked
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-[#5B6675] uppercase tracking-wider mb-1">Actual result</label>
                  <p className="text-sm text-[#5B6675]">{exec.actualResult || "No actual result recorded."}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
              <p className="text-sm text-[#5B6675]">No executions yet. Run a test case above.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Outcome</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#5B6675]">Status</span>
              <span className={`badge ${passed > 0 && failed === 0 && blocked === 0 ? "status-pass" : failed > 0 ? "status-fail" : "status-blocked"}`}>
                {failed > 0 ? "Failed" : blocked > 0 ? "Blocked" : "Passed"}
              </span>
            </div>
            <button className="btn-destructive w-full mb-2 flex items-center justify-center gap-2">
              Not applicable
            </button>
            <button className="btn-outline w-full flex items-center justify-center gap-2">
              Create/link defect
            </button>
          </div>
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Evidence</h3>
            <form action={uploadAttachment} className="space-y-2">
              <input type="file" name="file" className="input" required />
              <button className="btn-primary w-full text-xs px-3 py-1.5">Attach evidence</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
