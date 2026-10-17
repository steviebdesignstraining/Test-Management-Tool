import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; integrationId: string }>;
}) {
  const { projectId, integrationId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <>
            <Link href="/projects" className="hover:underline">Projects</Link>
            <span className="mx-1">/</span>
            <Link href={`/projects/${projectId}`} className="hover:underline">{projectId}</Link>
            <span className="mx-1">/</span>
            <Link href={`/projects/${projectId}/integrations`} className="hover:underline">Integrations</Link>
            <span className="mx-1">/</span>
            <span>{integrationId}</span>
          </>
        }
        title="Integration Details"
        description="Integration detail and edit page."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Integration detail coming soon.</p>
      </div>
    </div>
  );
}
