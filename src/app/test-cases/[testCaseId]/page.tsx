import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function TestCaseDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Cases"
        title="TC-001 — Login with valid credentials"
        description="Positive test case for the login flow."
        actions={
          <div className="flex items-center gap-2">
            <Link href="#" className="btn-link text-sm mr-3">Clone</Link>
            <Link href="#" className="btn-link text-sm mr-3">Version history</Link>
            <Link href="#" className="btn-link text-sm">Compare</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Objective</h2>
            <p className="text-sm text-[#5B6675]">
              Verify that a user can log in with valid credentials and be redirected to the dashboard.
            </p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Preconditions</h2>
            <ul className="text-sm text-[#5B6675] space-y-2 list-disc pl-5">
              <li>User account exists in the system</li>
              <li>Application is deployed to the test environment</li>
            </ul>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Test steps</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                  <th className="table-header px-4 py-2 w-10">#</th>
                  <th className="table-header px-4 py-2">Action</th>
                  <th className="table-header px-4 py-2 text-right">Expected result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                <tr>
                  <td className="px-4 py-2 text-[#5B6675]">1</td>
                  <td className="px-4 py-2 text-[#1B2430]">Navigate to the login page</td>
                  <td className="px-4 py-2 text-[#5B6675] text-right">Login form is displayed</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#5B6675]">2</td>
                  <td className="px-4 py-2 text-[#1B2430]">Enter a valid email address</td>
                  <td className="px-4 py-2 text-[#5B6675] text-right">Email field is populated</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#5B6675]">3</td>
                  <td className="px-4 py-2 text-[#1B2430]">Enter a valid password</td>
                  <td className="px-4 py-2 text-[#5B6675] text-right">Password field is populated</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#5B6675]">4</td>
                  <td className="px-4 py-2 text-[#1B2430]">Click the Sign in button</td>
                  <td className="px-4 py-2 text-[#5B6675] text-right">User is redirected to the dashboard</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#1B2430]">Metadata</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link href="#" className="btn-link text-sm mr-3">Edit steps</Link>
                <Link href="#" className="btn-link text-sm">Delete</Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">TC-001</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Type</p>
                <p className="text-[#5B6675]">Positive</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Priority</p>
                <p className="text-[#5B6675]"><span className="badge status-pass">High</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Status</p>
                <p className="text-[#5B6675]"><span className="badge status-neutral">Draft</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Version</p>
                <p className="text-[#5B6675]">1.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Owner</p>
                <p className="text-[#5B6675]">Alex Rivera</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Automation</p>
                <p className="text-[#5B6675]">Not mapped</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Suite</p>
                <p className="text-[#5B6675]">Authentication</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-[28px]">
            <div className="flex items-start gap-3">
              <span className="text-[#6B4FA3]">AI</span>
              <div>
                <p className="text-sm font-semibold text-[#1B2430] mb-1">AI duplicate detection</p>
                <p className="text-xs text-[#55398C]">Potential duplicate found: TC-005 "Login with valid credentials" (82% similarity)</p>
                <button className="text-[#55398C] text-xs underline mt-1">Review suggestion</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Links</h3>
            <ul className="space-y-2 text-sm text-[#5B6675]">
              <li>
                <Link href="/test-plans/tp-001" className="text-[#1F6F8B] hover:underline">Related test plan: Q4 Regression</Link>
              </li>
              <li>
                <Link href="/defects/D-004" className="text-[#1F6F8B] hover:underline">Linked defect: D-004</Link>
              </li>
              <li>
                <Link href="/ci-cd" className="text-[#1F6F8B] hover:underline">CI run: main #42</Link>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Executions</h3>
            <div className="text-sm text-[#5B6675]">No executions yet.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
