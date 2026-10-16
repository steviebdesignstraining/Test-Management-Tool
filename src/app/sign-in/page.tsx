import { Suspense } from "react";
import SignInForm from "./SignInForm";
import AuthHeader from "@/components/AuthHeader";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { verified?: string };
}) {
  const params = await searchParams;
  const verified = params.verified === "1";

  return (
    <div className="min-h-full flex flex-col bg-[#F5F7F9] text-[#1B2430]">
      <AuthHeader />
      <Suspense fallback={<div>Loading…</div>}>
        <SignInForm verified={verified} />
      </Suspense>
    </div>
  );
}
