import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/v1/auth/verify-email/${token}`, {
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    redirect(`/sign-in?verified=1`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F5F7F9] px-[28px]">
      <div className="w-full max-w-md bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
        <h2 className="text-xl font-semibold text-[#1B2430] mb-2">Verify email</h2>
        <p className="text-sm text-[#5B6675] mb-6">
          {data.message || "The verification link is invalid or has expired."}
        </p>
        <a
          href="/sign-in"
          className="btn-primary w-full"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
