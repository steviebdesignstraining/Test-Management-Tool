"use client";

import { useState, useEffect, useCallback } from "react";

interface TestParameter {
  id: string;
  name: string;
  value: string;
  description?: string | null;
  isRequired: boolean;
  position: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface TestCaseParametersProps {
  testCaseId: string;
  initialParameters: TestParameter[];
}

export default function TestCaseParameters({
  testCaseId,
  initialParameters,
}: TestCaseParametersProps) {
  const [parameters, setParameters] = useState<TestParameter[]>(initialParameters);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setParameters(initialParameters);
  }, [initialParameters]);

  const fetchParameters = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/test-cases/${testCaseId}/parameters`);
      if (!res.ok) throw new Error("Failed to fetch parameters");
      const data = await res.json();
      setParameters(data.items || []);
    } catch {
      setError("Failed to load parameters");
    }
  }, [testCaseId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/v1/test-cases/${testCaseId}/parameters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value, description, isRequired }),
      });
      if (!res.ok) throw new Error("Failed to add parameter");
      const created = await res.json();
      setParameters((prev) => [...prev, created]);
      setName("");
      setValue("");
      setDescription("");
      setIsRequired(false);
      setSuccess("Parameter added.");
    } catch {
      setError("Failed to add parameter");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/test-cases/${testCaseId}/parameters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value, description, isRequired }),
      });
      if (!res.ok) throw new Error("Failed to update parameter");
      const updated = await res.json();
      setParameters((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      setName("");
      setValue("");
      setDescription("");
      setIsRequired(false);
      setSuccess("Parameter updated.");
    } catch {
      setError("Failed to update parameter");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this parameter?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/test-cases/${testCaseId}/parameters/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete parameter");
      setParameters((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Parameter deleted.");
    } catch {
      setError("Failed to delete parameter");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: TestParameter) => {
    setEditingId(p.id);
    setName(p.name);
    setValue(p.value);
    setDescription(p.description || "");
    setIsRequired(Boolean(p.isRequired));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setValue("");
    setDescription("");
    setIsRequired(false);
  };

  return (
    <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1B2430]">Test Parameters</h3>
        {parameters.length > 0 && (
          <button
            onClick={fetchParameters}
            className="btn-link text-xs text-[#5B6675] hover:text-[#1B2430]"
          >
            Refresh
          </button>
        )}
      </div>

      <p className="text-xs text-[#5B6675] mb-3">
        Define data-driven test parameters (e.g. base_url, username, api_key) that can be referenced
        in test steps and executions.
      </p>

      {parameters.length === 0 && (
        <p className="text-sm text-[#5B6675]">No parameters defined. Add your first parameter below.</p>
      )}

      {parameters.length > 0 && (
        <table className="w-full text-left text-sm mb-4">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Name</th>
              <th className="table-header px-4 py-3">Value</th>
              <th className="table-header px-4 py-3 w-20">Required</th>
              <th className="table-header px-4 py-3 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            {parameters.map((p) => {
              const isEditing = editingId === p.id;
              if (isEditing) {
                return (
                  <tr key={p.id} className="bg-[#F5F7F9]">
                    <td className="px-4 py-3">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input w-full text-sm"
                        autoFocus
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="input w-full text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                        className="form-checkbox"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form onSubmit={(e) => handleUpdate(p.id, e)} className="inline-flex gap-1">
                        <button className="btn-primary text-xs px-2 py-1">Save</button>
                        <button type="button" onClick={cancelEdit} className="btn-link text-xs">
                          Cancel
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={p.id} className="hover:bg-[#EDF0F3]">
                  <td className="px-4 py-3 text-[#1B2430] font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-[#5B6675]">{p.value}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isRequired ? "status-fail" : "status-neutral"}`}>
                      {p.isRequired ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="btn-link text-xs mr-2"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn-destructive text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. base_url"
              className="input w-full"
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Value</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. https://api.example.com"
              className="input w-full"
              disabled={loading}
            />
          </div>
          {editingId ? null : (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="input w-full"
                disabled={loading}
              />
            </div>
          )}
          {editingId ? null : (
            <div className="space-y-1 flex items-end">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="form-checkbox"
              />
              <label className="text-xs text-[#5B6675] ml-1">Required</label>
            </div>
          )}
          <div className="md:col-span-2 flex items-end gap-2">
            {editingId ? (
              <>
                <button onSubmit={(e) => handleUpdate(editingId!, e)} className="btn-primary px-4 py-2">
                  Save
                </button>
                <button type="button" onClick={cancelEdit} className="btn-link text-sm">
                  Cancel
                </button>
              </>
            ) : (
              <button type="submit" className="btn-primary px-4 py-2" disabled={loading || !name || !value}>
                {loading ? "Adding…" : "Add parameter"}
              </button>
            )}
          </div>
        </div>
      </form>

      {error && <p className="text-xs text-[#8F2A20] mt-2">{error}</p>}
      {success && <p className="text-xs text-[#14633E] mt-2">{success}</p>}
    </div>
  );
}
