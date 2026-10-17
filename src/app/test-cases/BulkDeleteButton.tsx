"use client";

import { useTransition, useState } from "react";
import { bulkDeleteTestCases } from "@/app/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function BulkDeleteButton() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleDelete() {
    const ids = Array.from(
      document.querySelectorAll('input[name="ids"]:checked'),
    ) as HTMLInputElement[];
    const selected = ids.map((el) => el.value);

    if (selected.length === 0) {
      alert("Select at least one test case to delete.");
      return;
    }

    setSelectedIds(selected);
    setShowConfirm(true);
  }

  function confirmDelete() {
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ids", id));
    startTransition(async () => {
      await bulkDeleteTestCases(formData);
      setShowConfirm(false);
      window.location.reload();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="btn-destructive text-xs px-3 py-1.5"
      >
        {isPending ? "Deleting…" : "Delete selected"}
      </button>
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Test Cases"
        message={`Delete ${selectedIds.length} test case(s)? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
