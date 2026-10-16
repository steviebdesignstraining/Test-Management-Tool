"use client";

import { useState } from "react";
import AuthHeader from "@/components/AuthHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed.");
        setLoading(false);
        return;
      }
      setMessage(
        data.resetSent
          ? "If an account exists, a reset link has been sent."
          : data.message,
      );
      setLoading(false);
    } catch {
      setError("Unable to process request. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F5F7F9] px-[28px]">
      <AuthHeader />
      <main className="flex-1 py-6">
        <div className="w-full max-w-md mx-auto bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
          <h2 className="text-xl font-semibold text-[#1B2430] mb-2">Forgot password</h2>
          <p className="text-sm text-[#5B6675] mb-6">
            Enter your email and we’ll send you a link to reset your password.
          </p>
          {error && (
            <p className="text-sm text-[#8F2A20] bg-[#FBE7E4] border border-[#C9D0D8] rounded px-3 py-2 mb-4">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-[#14633E] bg-[#E3F2EA] border border-[#C9D0D8] rounded px-3 py-2 mb-4">
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="text-center text-sm text-[#5B6675] mt-6">
            Remember your password?{" "}
            <a href="/sign-in" className="text-[#1F6F8B] font-medium hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
