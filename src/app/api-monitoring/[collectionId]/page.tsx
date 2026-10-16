import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = await prisma.apiCollection.findUnique({
    where: { id: collectionId },
    include: {
      endpoints: { orderBy: { name: "asc" } },
      monitors: { orderBy: { createdAt: "desc" }, include: { endpoint: true } },
    },
  });

  if (!collection) {
    return <div className="p-[28px]">API collection not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="API Monitoring"
        title={collection.name}
        description={collection.description || "No description"}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/api-monitoring/collections/${collectionId}/endpoints/create`} className="btn-link text-sm mr-3">
              Add Endpoint
            </Link>
            <Link href={`/api-monitoring/collections/${collectionId}/monitors/create`} className="btn-link text-sm mr-3">
              Add Monitor
            </Link>
            <Link href="/api-monitoring" className="btn-link text-sm">
              Back to collections
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Endpoints ({collection.endpoints.length})</h3>
            {collection.endpoints.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No endpoints defined.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F7F9]">
                  <tr>
                    <th className="table-header px-4 py-3">Method</th>
                    <th className="table-header px-4 py-3">Name</th>
                    <th className="table-header px-4 py-3">URL</th>
                    <th className="table-header px-4 py-3 w-24">Auth</th>
                    <th className="table-header px-4 py-3 w-20 text-right">Timeout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D0D8]">
                  {collection.endpoints.map((e) => (
                    <tr key={e.id} className="hover:bg-[#EDF0F3]">
                      <td className="px-4 py-3">
                        <span className={`badge status-accent text-xs uppercase`}>{e.method}</span>
                      </td>
                      <td className="px-4 py-3 text-[#1B2430] font-medium">{e.name}</td>
                      <td className="px-4 py-3 text-[#5B6675] text-xs truncate max-w-[200px]">{e.url}</td>
                      <td className="px-4 py-3 text-[#5B6675] text-xs">{e.authType || "NONE"}</td>
                      <td className="px-4 py-3 text-right text-[#5B6675] text-xs">{e.timeout} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Monitors */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Monitors ({collection.monitors.length})</h3>
            {collection.monitors.length === 0 ? (
              <p className="text-sm text-[#5B6675]">No monitors configured.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {collection.monitors.map((m) => (
                  <li key={m.id} className="p-3 border border-[#C9D0D8] rounded bg-[#F9FAFB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#1B2430] font-medium">{m.name}</span>
                      <span className={`badge text-xs ${m.isEnabled ? "status-pass" : "status-neutral"}`}>
                        {m.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6675] mb-2">{m.schedule}</p>
                    {m.endpoint && (
                      <p className="text-xs text-[#5B6675]">{m.endpoint.method} {m.endpoint.url}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
