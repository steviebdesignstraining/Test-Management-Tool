import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { verified?: string };
}) {
  const params = await searchParams;
  const verified = params.verified === "1";

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SignInForm verified={verified} />
    </Suspense>
  );
}
