"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignInFormProps {
  verified?: boolean;
}

export default function SignInForm({ verified }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, keepSignedIn }),
      });
      if (res.status === 403) {
        setError("Please verify your email before signing in.");
        setResendEmail(email);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/overview");
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendMessage(data.error || "Resend failed.");
        setResendLoading(false);
        return;
      }
      setResendMessage(data.message || "Verification email sent.");
      setResendLoading(false);
    } catch {
      setResendMessage("Unable to resend verification email.");
      setResendLoading(false);
    }
  }

  async function handleGitHub() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/github/redirect", {
        method: "GET",
      });
      if (!res.ok) {
        setError("GitHub OAuth is not configured.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/api/v1/auth/github/redirect";
      }
    } catch {
      window.location.href = "/api/v1/auth/github/redirect";
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F7F9] px-[28px]">
      <div className="w-full max-w-2xl bg-white border border-[#C9D0D8] rounded-lg shadow-sm flex flex-col md:flex-row">
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-[28px] space-y-5">
          <h2 className="text-2xl font-semibold text-[#1B2430]">Sign in</h2>
          {verified && (
            <p className="text-sm text-[#14633E] bg-[#E3F2EA] border border-[#C9D0D8] rounded px-3 py-2 mb-2">
              Email verified successfully. You can now sign in.
            </p>
          )}
          {error && (
            <p className="text-sm text-[#8F2A20] bg-[#FBE7E4] border border-[#C9D0D8] rounded px-3 py-2">
              {error}
            </p>
          )}
          {resendEmail && (
            <div className="space-y-3 p-3 bg-[#F5F7F9] rounded border border-[#C9D0D8]">
              <p className="text-sm text-[#5B6675]">
                Verify {resendEmail} to continue.
              </p>
              {resendMessage && (
                <p className={`text-sm ${resendMessage.includes("sent") ? "text-[#14633E] bg-[#E3F2EA]" : "text-[#8F2A20] bg-[#FBE7E4]"} border border-[#C9D0D8] rounded px-3 py-2`}>
                  {resendMessage}
                </p>
              )}
              <form onSubmit={handleResend} className="space-y-2">
                <button
                  type="submit"
                  className="btn-outline w-full text-sm"
                  disabled={resendLoading}
                >
                  {resendLoading ? "Sending…" : "Resend verification email"}
                </button>
              </form>
            </div>
          )}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1B2430]">Email</label>
            <input
              type="email"
              className="input w-full"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1B2430]">Password</label>
            <input
              type="password"
              className="input w-full"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-[#5B6675]">
              <input
                type="checkbox"
                className="accent-[#1F6F8B]"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              Keep me signed in
            </label>
            <a href="/forgot-password" className="text-[#1F6F8B] hover:underline">
              Forgot password?
            </a>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <hr className="border-[#C9D0D8] my-[28px]" />
          <button
            type="button"
            className="btn-outline w-full flex items-center justify-center gap-2"
            disabled={loading}
            onClick={handleGitHub}
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-7.312-1.148-.149-3.015-1.383-2.558-3.431-2.699-.476-.65-.844-2.002-.085-2.002a2.025 2.025 0 0 1 1.491.234c.137-.289.561-1.191.763-1.599C9.038 3.719 6.223 3.16 4.524 3.16c-.921 0-1.874.35-2.54.954-.676.607-.995 1.485-.634 2.275-.279.584-.444 1.182-.444 1.924v.759c0 .841.276 1.626.727 2.124.175.201.338.414.439.657.172.331.493.668.875.767.098.062.37.363.732.732-.164.19-.197.44-.197.723 0 .498.158.946.372 1.367-.185.145-.315.31-.315.494 0 .634.218 1.202.519 1.57.301.365.701.572 1.119.572.637 0 1.193-.278 1.522-.552.052.041.112.079.19.122.724.417 1.542.647 2.388.647.66 0 1.32-.159 1.874-.431.34-.166.52-.413.52-.413 0 .215.101.413.206.561.22.323.485.61.765.757.279.145.584.119.967.041.476-.096 1.002-.165 1.459-.165.606 0 1.162.162 1.516.416.354.255.636.609.636.609 0 .729.267 1.364.612 1.797.118.145.398.469.892.469.453 0 .927-.145 1.29-.383-.102.23-.248.461-.479.677a9 9 0 0 1-.397.577c-.037.06-.083.116-.134.171-.097.107-.213.193-.35.242-.17.06-.353.093-.545.093-.197 0-.4-.04-.603-.105-.16-.05-.319-.083-.47-.114-.16-.032-.319-.046-.474-.046-.158 0-.315.013-.471.028-.158.014-.314.021-.467.028a2 2 0 0 1-.514-.036c-.117-.01-.233-.013-.349-.013-.117 0-.233.004-.349.013a2 2 0 0 1-.514.036c-.153-.007-.312-.014-.471-.028-.154-.008-.31-.015-.467-.028-.155-.008-.314-.02-.474-.046-.151.031-.31.064-.47.114-.203.065-.406.105-.603.105-.192 0-.375-.033-.545-.093-.137-.049-.253-.135-.35-.242-.051-.055-.097-.111-.134-.171-.039-.06-.078-.116-.397-.577-.231-.216-.377-.447-.479-.677-.363-.237-.837-.383-1.29-.383-.494 0-.774.324-.892.469 0 0 .282-.354.636-.609.354-.254.91-.416 1.516-.416.457 0 .983.069 1.459.165.383.078.688.104.967.041.28-.147.545-.434.765-.757.105-.148.206-.346.206-.561 0 0-.18.247.52.413.554.272 1.214.431 1.874.431.846 0 1.664-.23 2.388-.647.078-.043.138-.081.19-.122.329.274.885.552 1.522.552.418 0 .818-.207 1.119-.572.301-.368.519-.936.519-1.57 0-.184-.13-.349-.315-.494-.214-.421-.372-.869-.372-1.367 0-.283-.033-.533-.197-.723.362-.369.634-.701.732-.732.382-.099.703-.436.875-.767.101-.243.264-.456.439-.657.451-.498.727-1.283.727-2.124v-.759c0-.742-.165-1.34-.444-1.924.361-.79.042-1.668-.634-2.275-.666-.604-1.619-.954-2.54-.954-1.699 0-4.514.559-4.514 2.979 0 .868.028 1.717.085 2.002 1.024.449 2.089 1.764 2.558 3.431 2.045 1.845 1.331 4.647 1.334 7.312.344.299.655.829.762 1.604"
              />
            </svg>
            Continue with GitHub
          </button>
          <p className="text-center text-sm text-[#5B6675]">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-[#1F6F8B] font-medium hover:underline">
              Create account
            </a>
          </p>
        </form>
        <div className="w-full md:w-1/2 bg-[#E4F0F4] p-[28px] flex flex-col justify-between border-l border-[#C9D0D8] md:border-l md:border-t-0 md:border-b-0 rounded-none md:rounded-r-lg">
          <div>
            <h3 className="text-lg font-semibold text-[#134F63]">One source of truth for test evidence</h3>
            <p className="text-[#1B2430] mt-2 text-sm leading-relaxed">
              TestHub brings manual testing, automation, CI/CD results, defects and AI insights into one workspace.
              Built for individual testers and QA teams.
            </p>
            <ul className="mt-6 space-y-3 text-xs text-[#134F63] list-disc pl-4">
              <li>Role-based permissions: Owner, Admin, QA Lead, Tester, Developer, Read-only</li>
              <li>Tenant isolation — users never access another organisation&apos;s records</li>
              <li>Audit history for important workflow changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
