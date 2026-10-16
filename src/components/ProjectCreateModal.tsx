"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectCreateModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/v1/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: "" }),
    });
    if (res.ok) {
      setOpen(false);
      setName("");
      router.refresh();
    }
  };

  return (
    <>
      <button type="button" className="btn-primary px-4 flex items-center gap-2" onClick={() => setOpen(true)}>
        <span className="text-base leading-none">+</span> New Project
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded border border-[#C9D0D8] p-[28px] w-96">
            <h2 className="text-lg font-semibold mb-4">Create Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="input w-full"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
