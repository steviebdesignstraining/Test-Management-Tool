import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Page not found"
        title="Page not found"
        description="The page you're looking for doesn't exist."
      />

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px] max-w-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-2xl font-semibold text-[#1B2430]">404</p>
          <p className="text-sm text-[#5B6675]">
            We couldn't find that page. Check the URL or return to a known location.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/overview" className="btn-primary">
              Back to Overview
            </Link>
            <Link href="/sign-in" className="btn-outline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
