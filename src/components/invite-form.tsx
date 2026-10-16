"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
}

export default function InviteForm({ projects }: { projects: Project[] }) {
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [role, setRole] = useState("TESTER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !projectId) return;
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
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input flex-1"
          required
          disabled={loading}
        />
        {projects.length > 1 && (
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white w-48"
            disabled={loading}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white w-36"
          disabled={loading}
        >
          <option value="TESTER">Tester</option>
          <option value="MANAGER">Manager</option>
          <option value="OWNER">Owner</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button type="submit" className="btn-primary w-32" disabled={loading}>
          {loading ? "Sending…" : "Invite"}
        </button>
      </div>
      {message && <p className={`text-xs ${message.includes("sent") ? "text-[#14633E]" : "text-[#8F2A20]"}`}>{message}</p>}
    </form>
  );
}
