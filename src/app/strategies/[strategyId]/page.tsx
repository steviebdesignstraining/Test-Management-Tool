import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string }>;
}) {
  const { strategyId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <>
            <Link href="/strategies" className="hover:underline">Strategies</Link>
            <span className="mx-1">/</span>
            <span>{strategyId}</span>
          </>
        }
        title="Strategy Details"
        description="Strategy detail page (sections, versions, approval)."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Strategy detail coming soon.</p>
      </div>
    </div>
  );
}
