import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import PageHeader from "@/components/PageHeader";

async function createQualityGate(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;
  try {
    await prisma.qualityGate.create({
      data: {
        projectId,
        name: name.trim(),
        description: (formData.get("description") as string)?.trim() || null,
        stage: (formData.get("stage") as string) || "SUBMIT",
        rules: JSON.stringify(
          (formData.get("rules") as string || "").split("\n").filter(Boolean)
        ),
        isBlocking: formData.get("isBlocking") === "on",
      },
    });
    revalidatePath("/quality-gates");
  } catch {
    // swallow duplicates
  }
}

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
        actions={
          <form action={createQualityGate} className="flex flex-wrap items-center gap-2">
            <select name="projectId" className="input w-40" required>
              <option value="">Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Gate name"
              className="input w-40"
              required
            />
            <select name="stage" className="input w-28">
              <option value="DRAFT">Draft</option>
              <option value="SUBMIT">Submit</option>
              <option value="APPROVE">Approve</option>
              <option value="EXECUTE">Execute</option>
              <option value="RELEASE">Release</option>
            </select>
            <button className="btn-primary px-3">Create</button>
          </form>
        }
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
