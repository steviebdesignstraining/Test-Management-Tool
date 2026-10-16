"use client";

import { useState } from "react";
import { createTestCase } from "@/app/actions";
import Modal from "@/components/Modal";
import { FIELD_LIMITS } from "@/lib/validation";

const EXECUTION_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "SKIPPED", label: "Skipped" },
];

interface TestCaseCreateModalProps {
  projects: { id: string; name: string; key: string }[];
  users: { id: string; name: string | null }[];
}

export default function TestCaseCreateModal({ projects, users }: TestCaseCreateModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary px-4 flex items-center gap-2"
      >
        <span className="text-base leading-none">+</span>
        <span>New Test Case</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Test Case">
        <form action={createTestCase} className="space-y-4">
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
                Title <span className="text-[#8F2A20]">*</span>
              </label>
              <input
                name="title"
                className="input w-full"
                required
                maxLength={FIELD_LIMITS.title}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Objective / Description <span className="text-[#8F2A20]">*</span>
            </label>
            <textarea
              name="objective"
              rows={3}
              className="input w-full"
              required
              maxLength={FIELD_LIMITS.objective}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Preconditions <span className="text-[#8F2A20]">*</span>
            </label>
            <textarea
              name="preconditions"
              rows={3}
              className="input w-full"
              required
              maxLength={FIELD_LIMITS.preconditions}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
              Expected Results <span className="text-[#8F2A20]">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              className="input w-full"
              required
              maxLength={FIELD_LIMITS.description}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Execution Status
              </label>
              <select name="status" className="input">
                {EXECUTION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
                Reviewer
              </label>
              <select name="reviewerId" className="input">
                <option value="">No reviewer assigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name ?? u.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#C9D0D8]">
            <button type="submit" className="btn-primary">Create Test Case</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
