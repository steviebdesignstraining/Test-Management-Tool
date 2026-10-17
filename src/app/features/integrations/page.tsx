import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default function FeaturesIntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Features / Integrations"
        title="Integrations"
        description="Connect TestHub with your development and testing tools."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675] mb-4">Explore available integrations for TestHub.</p>
        <Link href="/integrations" className="text-sm text-[#134F63] hover:underline">
          Manage your integrations →
        </Link>
      </div>
    </div>
  );
}
