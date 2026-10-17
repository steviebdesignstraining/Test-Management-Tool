import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default async function OrganisationDetailPage({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <>
            <Link href="/organisations" className="hover:underline">Organisations</Link>
            <span className="mx-1">/</span>
            <span>{organisationId}</span>
          </>
        }
        title="Organisation Details"
        description="Organisation members, projects, and settings."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Organisation detail coming soon.</p>
      </div>
    </div>
  );
}
