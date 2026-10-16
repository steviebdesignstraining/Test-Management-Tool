"use client";

import { useState } from "react";
import { createQualityGate } from "@/app/actions";
import Modal from "@/components/Modal";

interface QualityGateCreateModalProps {
  projects: { id: string; name: string }[];
}

export default function QualityGateCreateModal({ projects }: QualityGateCreateModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary px-4 flex items-center gap-2">
        <span className="text-base leading-none">+</span> New Quality Gate
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Quality Gate">
        <form action={createQualityGate} className="space-y-4">
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
                Stage
              </label>
              <select name="stage" className="input w-full">
                <option value="DRAFT">Draft</option>
                <option value="SUBMIT">Submit</option>
                <option value="APPROVE">Approve</option>
                <option value="EXECUTE">Execute</option>
                <option value="RELEASE">Release</option>
              </select>
            </div>
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 text-sm text-[#5B6675]">
                <input type="checkbox" name="isBlocking" defaultChecked className="h-4 w-4" />
                Blocking
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Rules (one per line)
            </label>
            <textarea name="rules" rows={3} className="input w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Description
            </label>
            <textarea name="description" rows={2} className="input w-full" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#C9D0D8]">
            <button type="submit" className="btn-primary">Create Gate</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
