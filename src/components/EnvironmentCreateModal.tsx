"use client";

import { useState } from "react";
import { createEnvironment } from "@/app/actions";
import Modal from "@/components/Modal";

interface EnvironmentCreateModalProps {
  projects: { id: string; name: string }[];
}

export default function EnvironmentCreateModal({ projects }: EnvironmentCreateModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary px-4 flex items-center gap-2">
        <span className="text-base leading-none">+</span> New Environment
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Environment">
        <form action={createEnvironment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Project <span className="text-[#8F2A20]">*</span>
              </label>
              <select name="projectId" className="input w-full" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Name <span className="text-[#8F2A20]">*</span>
              </label>
              <input name="name" className="input w-full" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Type
              </label>
              <select name="type" className="input w-full">
                <option value="DEVELOPMENT">Development</option>
                <option value="QA">QA</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Base URL
              </label>
              <input name="baseUrl" className="input w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Description
            </label>
            <textarea name="description" rows={3} className="input w-full" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#C9D0D8]">
            <button type="submit" className="btn-primary">Create Environment</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
