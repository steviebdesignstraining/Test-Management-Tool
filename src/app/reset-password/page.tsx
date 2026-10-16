import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const params = await searchParams;
  const token = params.token ?? null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F5F7F9] px-[28px]">
      <ResetPasswordForm initialToken={token} />
    </div>
  );
}
