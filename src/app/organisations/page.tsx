import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function OrganisationsPage() {
  const [organisations] = await Promise.all([
    prisma.organisation.findMany({
      include: { _count: { select: { projects: true, members: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Organisations"
        title="Organisations"
        description="Manage organisations and workspaces."
        actions={
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              await fetch("/api/v1/organisations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              });
            }}
            className="flex items-center gap-2"
          >
            <input name="name" placeholder="Organisation name" className="input w-48" required />
            <button className="btn-primary text-xs px-3 py-1.5">Create</button>
          </form>
        }
      />

      {organisations.length === 0 ? (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">No organisations yet. Create your first organisation above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header px-4 py-3">Name</th>
                <th className="table-header px-4 py-3">Projects</th>
                <th className="table-header px-4 py-3">Members</th>
                <th className="table-header px-4 py-3">Created</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              {organisations.map((org) => (
                <tr key={org.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">
                    <Link href={`/organisations/${org.id}`}>{org.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-[#5B6675]">{org._count.projects}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{org._count.members}</td>
                  <td className="px-4 py-3 text-[#5B6675] text-xs">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/organisations/${org.id}`} className="btn-link text-sm">
                      View
                    </Link>
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
