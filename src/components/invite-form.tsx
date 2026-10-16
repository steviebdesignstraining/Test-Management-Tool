"use client";

import { useState } from "react";

export default function InviteForm({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TESTER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Invitation sent successfully.");
        setEmail("");
      } else {
        setMessage(data.error || "Failed to send invitation.");
      }
    } catch {
      setMessage("Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input flex-1"
          required
          disabled={loading}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white"
          disabled={loading}
        >
          <option value="TESTER">Tester</option>
          <option value="MANAGER">Manager</option>
          <option value="OWNER">Owner</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Sending…" : "Invite"}
        </button>
      </div>
      {message && <p className={`text-xs ${message.includes("sent") ? "text-[#14633E]" : "text-[#8F2A20]"}`}>{message}</p>}
    </form>
  );
}
