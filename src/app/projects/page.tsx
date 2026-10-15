import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Projects"
        title="Projects"
        description="Manage your test projects and teams."
        actions={
          <button className="btn-primary">Create project</button>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Key</th>
              <th className="table-header px-4 py-3">Name</th>
              <th className="table-header px-4 py-3">Owner</th>
              <th className="table-header px-4 py-3">Cases</th>
              <th className="table-header px-4 py-3">Last run</th>
              <th className="table-header px-4 py-3">Pass rate</th>
              <th className="table-header px-4 py-3 text-right">Members</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3 text-[#1B2430] font-medium">PRJ-001</td>
              <td className="px-4 py-3"><Link href="/projects/checkout-web" className="text-[#1F6F8B] hover:underline">Checkout Web</Link></td>
              <td className="px-4 py-3 text-[#5B6675]">Alex Rivera</td>
              <td className="px-4 py-3 text-[#5B6675]">124</td>
              <td className="px-4 py-3 text-[#5B6675]">2h ago</td>
              <td className="px-4 py-3 text-[#5B6675]">87%</td>
              <td className="px-4 py-3 text-right text-[#5B6675]">4</td>
            </tr>
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3 text-[#1B2430] font-medium">PRJ-002</td>
              <td className="px-4 py-3"><Link href="/projects/mobile-api" className="text-[#1F6F8B] hover:underline">Mobile API</Link></td>
              <td className="px-4 py-3 text-[#5B6675]">Sam Chen</td>
              <td className="px-4 py-3 text-[#5B6675]">68</td>
              <td className="px-4 py-3 text-[#5B6675]">1d ago</td>
              <td className="px-4 py-3 text-[#5B6675]">—</td>
              <td className="px-4 py-3 text-right text-[#5B6675]">3</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Create project</h3>
          <p className="text-xs text-[#5B6675] mb-4">Start a new workspace for your team.</p>
          <button className="btn-outline w-full">New project</button>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Empty state</h3>
          <p className="text-xs text-[#5B6675]">No projects found.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Error state</h3>
          <p className="text-xs text-[#5B6675]">Unable to load projects.</p>
          <button className="btn-primary w-full">Retry</button>
        </div>
      </div>
    </div>
  );
}
