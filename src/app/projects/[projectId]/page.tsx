import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ProjectDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Projects"
        title="Checkout Web — Project detail"
        description="PRJ-001 • Owned by Alex Rivera"
        actions={
          <Link href="#" className="btn-link text-sm">Edit project</Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Overview</h2>
            <p className="text-sm text-[#5B6675]">
              Checkout Web is the primary customer-facing web application. This project covers
              manual and automated testing for the checkout flow, payment processing, and user
              account management.
            </p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Test cases</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                  <th className="table-header px-4 py-2">Key</th>
                  <th className="table-header px-4 py-2">Title</th>
                  <th className="table-header px-4 py-2">Status</th>
                  <th className="table-header px-4 py-2 text-right">Automation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                <tr>
                  <td className="px-4 py-2 text-[#1B2430] font-medium">TC-001</td>
                  <td className="px-4 py-2"><Link href="/test-cases/TC-001" className="text-[#1F6F8B] hover:underline">Login with valid credentials</Link></td>
                  <td className="px-4 py-2"><span className="badge status-neutral">Draft</span></td>
                  <td className="px-4 py-2 text-[#5B6675] text-right">Not mapped</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#1B2430] font-medium">TC-002</td>
                  <td className="px-4 py-2"><Link href="/test-cases/TC-002" className="text-[#1F6F8B] hover:underline">Checkout with valid card</Link></td>
                  <td className="px-4 py-2"><span className="badge status-neutral">Draft</span></td>
                  <td className="px-4 py-2 text-[#5B6675] text-right">Not mapped</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">PRJ-001</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Owner</p>
                <p className="text-[#5B6675]">Alex Rivera</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Test cases</p>
                <p className="text-[#5B6675]"><span className="sample-badge">Sample data</span> 124</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Last run</p>
                <p className="text-[#5B6675]">2h ago</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Pass rate</p>
                <p className="text-[#5B6675]"><span className="sample-badge">Sample data</span> 87%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Members</p>
                <p className="text-[#5B6675]">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Members</h3>
            <ul className="space-y-2 text-sm text-[#5B6675]">
              <li className="flex justify-between">
                <span>Alex Rivera</span>
                <span className="text-[#1B2430] font-medium">Owner</span>
              </li>
              <li className="flex justify-between">
                <span>Sam Chen</span>
                <span className="text-[#1B2430] font-medium">QA Lead</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
