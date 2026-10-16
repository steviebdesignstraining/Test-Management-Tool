"use client";

import { useTransition } from "react";

interface BulkDeleteButtonProps {
  action: (formData: FormData) => Promise<void>;
}

export default function BulkDeleteButton({ action }: BulkDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const ids = Array.from(
      document.querySelectorAll('input[name="ids"]:checked'),
    ) as HTMLInputElement[];
    const selected = ids.map((el) => el.value);

    if (selected.length === 0) {
      alert("Select at least one test case to delete.");
      return;
    }

    if (!window.confirm(`Delete ${selected.length} test case(s)? This cannot be undone.`)) {
      return;
    }

    const formData = new FormData();
    selected.forEach((id) => formData.append("ids", id));
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="btn-destructive text-xs px-3 py-1.5"
    >
      {isPending ? "Deleting…" : "Delete selected"}
    </button>
  );
}
