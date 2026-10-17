import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default async function IntegrationCreatePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

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
            <span>Create</span>
          </>
        }
        title="Connect Integration"
        description="Connect a third-party integration."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Integration create flow coming soon.</p>
      </div>
    </div>
  );
}
