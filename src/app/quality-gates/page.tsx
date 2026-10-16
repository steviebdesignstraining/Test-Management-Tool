import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import QualityGateCreateModal from "@/components/QualityGateCreateModal";

export default async function QualityGatesPage() {
  const gates = await prisma.qualityGate.findMany({
    include: { project: true },
    orderBy: { updatedAt: "desc" },
  });
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Quality Gates"
        title="Quality Gates"
        description="Configurable preconditions that must be satisfied before workflow stage transitions."
        actions={<QualityGateCreateModal projects={projects} />}
      />

      {gates.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No quality gates yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Name</th>
                <th className="table-header px-4 py-3">Project</th>
                <th className="table-header px-4 py-3">Stage</th>
                <th className="table-header px-4 py-3">Blocking</th>
                <th className="table-header px-4 py-3">Status</th>
                <th className="table-header px-4 py-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {gates.map((gate) => (
                <tr key={gate.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">{gate.name}</td>
                  <td className="px-4 py-3">{gate.project.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#E4F0F4] text-[#134F63]">{gate.stage}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        gate.isBlocking ? "bg-[#FDECEA] text-[#8F2A20]" : "bg-[#EAF5F0] text-[#245C4A]"
                      }`}
                    >
                      {gate.isBlocking ? "Blocking" : "Advisory"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        gate.isActive ? "bg-[#EAF5F0] text-[#245C4A]" : "bg-[#F5F7F9] text-[#5B6675]"
                      }`}
                    >
                      {gate.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-[#5B6675]">
                    {gate.updatedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
