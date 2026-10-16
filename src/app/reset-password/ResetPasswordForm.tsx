"use client";

import { useState } from "react";

interface ResetPasswordFormProps {
  initialToken?: string | null;
}

export default function ResetPasswordForm({
  initialToken,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: initialToken, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        setLoading(false);
        return;
      }
      setMessage(data.message);
      setLoading(false);
    } catch {
      setError("Unable to reset password. Please try again.");
      setLoading(false);
    }
  }

  if (!initialToken) {
    return (
      <div className="w-full max-w-md bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
        <h2 className="text-xl font-semibold text-[#1B2430] mb-2">Reset password</h2>
        <p className="text-sm text-[#5B6675] mb-6">
          No reset token provided. Please use the link in your reset email.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
      <h2 className="text-xl font-semibold text-[#1B2430] mb-2">Reset password</h2>
      <p className="text-sm text-[#5B6675] mb-6">
        Enter a new password for your account.
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
          <label className="text-sm font-medium text-[#1B2430]">New password</label>
          <input
            type="password"
            className="input w-full"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1B2430]">Confirm password</label>
          <input
            type="password"
            className="input w-full"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
