"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const FEATURE_LIMIT = 2000;
const CRITERIA_LIMIT = 2000;

interface DraftStep {
  action: string;
  expectedResult: string;
  data?: string;
}

interface Draft {
  title: string;
  objective?: string;
  preconditions?: string;
  priority?: string;
  steps?: DraftStep[];
  tags?: string[];
  raw?: string;
}

const TEST_TYPES = ["FUNCTIONAL", "UI", "API", "DATABASE", "PERFORMANCE", "SECURITY", "ACCESSIBILITY", "FRONTEND", "BACKEND", "GHERKIN"];
const TEST_TYPE_LABELS: Record<string, string> = {
  FUNCTIONAL: "Functional",
  UI: "UI",
  API: "API",
  DATABASE: "Database",
  PERFORMANCE: "Performance",
  SECURITY: "Security",
  ACCESSIBILITY: "Accessibility",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  GHERKIN: "Gherkin / BDD",
};

export default function AiAssistantPage() {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string | null; email: string } | null>(null);
  const [feature, setFeature] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [projectId, setProjectId] = useState("");
  const [testType, setTestType] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");
        const [pRes, uRes] = await Promise.all([
          fetch("/api/v1/projects"),
          fetch("/api/v1/me"),
        ]);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProjects(Array.isArray(pData) ? pData : pData?.items ?? []);
        }
        if (uRes.ok) {
          const uData = await uRes.json();
          setCurrentUser(uData?.user ?? null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load project data");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const generateDraft = async () => {
    if (!feature || !projectId) {
      setError("Feature and project are required");
      return;
    }
    setLoading(true);
    setError("");
    setDraft(null);
    try {
      const res = await fetch("/api/v1/ai/test-case-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, feature, acceptanceCriteria }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate draft");
      }
      const data = await res.json();
      setDraft(data.draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate draft");
    } finally {
      setLoading(false);
    }
  };

  const importDraft = async () => {
    if (!draft || !projectId) return;
    const ownerId = currentUser?.id || "";
    if (!ownerId) {
      setError("No authenticated user found. Cannot import draft.");
      return;
    }
    const formData = new FormData();
    formData.append("title", draft.title);
    formData.append("objective", draft.objective || "");
    formData.append("preconditions", draft.preconditions || "");
    formData.append("priority", draft.priority || "MEDIUM");
    formData.append("projectId", projectId);
    formData.append("ownerId", ownerId);
    formData.append("testType", testType);
    formData.append("steps", JSON.stringify(draft.steps || []));

    try {
      const res = await fetch("/api/v1/test-cases/import-ai-draft", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }
      setImported(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="AI Assistant"
        title="AI Test Case Generator"
        description="Generate test cases from user stories, requirements, and acceptance criteria using AI."
      />

      {error && (
        <div className="text-sm text-[#8F2A20] bg-[#FBE7E4] border border-[#C9D0D8] rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Generate from feature</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Feature / description *</span>
              <span className="text-xs text-[#5B6675]">{feature.length}/{FEATURE_LIMIT}</span>
            </label>
            <textarea
              className="input h-24"
              maxLength={FEATURE_LIMIT}
              placeholder="Describe the feature or user story..."
              value={feature}
              onChange={(e) => setFeature(e.target.value.slice(0, FEATURE_LIMIT))}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Acceptance criteria (optional)</span>
              <span className="text-xs text-[#5B6675]">{acceptanceCriteria.length}/{CRITERIA_LIMIT}</span>
            </label>
            <textarea
              className="input h-20"
              maxLength={CRITERIA_LIMIT}
              placeholder="Given ... When ... Then ..."
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value.slice(0, CRITERIA_LIMIT))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Project</label>
              <select className="input w-full" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={loadingData}>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Test type</label>
              <select className="input w-full" value={testType} onChange={(e) => setTestType(e.target.value)}>
                <option value="">Manual</option>
                {TEST_TYPES.map((t) => (
                  <option key={t} value={t}>{TEST_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button className="btn-primary" onClick={generateDraft} disabled={loading || loadingData}>
            {loading ? "Generating…" : "Generate test case draft"}
          </button>
        </div>
      </div>

      {imported && (
        <div className="text-sm text-[#14633E] bg-[#E3F2EA] border border-[#C9D0D8] rounded px-3 py-2">
          Test case imported successfully.{" "}
          <Link href="/test-cases" className="text-[#134F63] font-medium hover:underline">
            View test cases
          </Link>
        </div>
      )}

      {draft && (
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Generated draft</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Title</label>
              <p className="text-sm text-[#1B2430] mt-1">{draft.title}</p>
            </div>
            {draft.objective && (
              <div>
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Objective</label>
                <p className="text-sm text-[#5B6675] mt-1">{draft.objective}</p>
              </div>
            )}
            {draft.preconditions && (
              <div>
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Preconditions</label>
                <p className="text-sm text-[#5B6675] mt-1">{draft.preconditions}</p>
              </div>
            )}
            {draft.priority && (
              <div>
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Priority</label>
                <p className="text-sm text-[#5B6675] mt-1">{draft.priority}</p>
              </div>
            )}
            {draft.steps && draft.steps.length > 0 && (
              <div>
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Steps</label>
                <table className="w-full text-left text-sm mt-2">
                  <thead className="bg-[#F5F7F9]">
                    <tr>
                      <th className="table-header px-4 py-3">#</th>
                      <th className="table-header px-4 py-3">Action</th>
                      <th className="table-header px-4 py-3">Expected result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9D0D8]">
                    {draft.steps.map((s, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-[#5B6675] text-xs">{i + 1}</td>
                        <td className="px-4 py-3 text-[#1B2430]">{s.action}</td>
                        <td className="px-4 py-3 text-[#5B6675]">{s.expectedResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {draft.tags && draft.tags.length > 0 && (
              <div>
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Tags</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {draft.tags.map((t) => (
                    <span key={t} className="badge status-accent">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {draft.raw && (
              <div>
                <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Raw output</label>
                <pre className="text-xs text-[#5B6675] mt-1 bg-[#F5F7F9] p-3 rounded overflow-x-auto">
                  {draft.raw}
                </pre>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button className="btn-primary text-sm" onClick={importDraft}>
              Import as test case
            </button>
            <button className="btn-outline text-sm" onClick={() => setDraft(null)}>
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}