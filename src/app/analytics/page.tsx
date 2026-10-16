"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

interface TestCase {
  id: string;
  key: string;
  title: string;
  testType?: string | null;
  status: string;
  priority: string;
  severity: string;
  project: { name: string };
}

interface TestExecution {
  id: string;
  status: string;
  createdAt: string;
  testCase: { title: string; testType?: string | null };
}

interface Defect {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
}

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

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "status-fail",
  HIGH: "status-blocked",
  MEDIUM: "status-flaky",
  LOW: "status-pass",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "status-fail",
  IN_PROGRESS: "status-blocked",
  RESOLVED: "status-pass",
  CLOSED: "status-flaky",
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [casesRes, execRes, defectRes] = await Promise.all([
          fetch("/api/v1/test-cases"),
          fetch("/api/v1/test-runs"),
          fetch("/api/v1/defects"),
        ]);
        const casesData = await casesRes.json();
        const execData = await execRes.json();
        const defectData = await defectRes.json();

        if (!mounted) return;

        const caseList = Array.isArray(casesData) ? casesData : casesData?.items ?? [];
        const execList = (Array.isArray(execData) ? execData : execData?.items ?? []) as TestExecution[];
        const defectList = Array.isArray(defectData) ? defectData : defectData?.items ?? [];

        setTestCases(caseList);
        setExecutions(execList);
        setDefects(defectList);
      } catch {
        // metrics load failed, keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationHistory: messages }),
      });
      const data = await res.json();
      const reply = data?.response || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function getStatusBadge(status: string) {
    const norm = status?.toUpperCase() || "";
    const className = STATUS_COLORS[norm] || "status-neutral";
    return <span className={`badge ${className} text-xs`}>{status}</span>;
  }

  function getSeverityBadge(severity: string) {
    const norm = severity?.toUpperCase() || "";
    const className = SEVERITY_COLORS[norm] || "status-neutral";
    return <span className={`badge ${className} text-xs`}>{severity}</span>;
  }

  function typeDistribution(): { type: string; count: number; label: string }[] {
    const map = new Map<string, number>();
    testCases.forEach((tc) => {
      const t = tc.testType || "UNLABELED";
      map.set(t, (map.get(t) || 0) + 1);
    });
    return Array.from(map.entries()).map(([type, count]) => ({
      type,
      count,
      label: TEST_TYPE_LABELS[type] || type,
    }));
  }

  function defectLifecycle(): { status: string; count: number }[] {
    const map = new Map<string, number>();
    const order = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    defects.forEach((d) => {
      const s = d.status?.toUpperCase() || "UNKNOWN";
      map.set(s, (map.get(s) || 0) + 1);
    });
    return order.map((s) => ({ status: s, count: map.get(s) || 0 }));
  }

  function executionTrend(): { date: string; passed: number; failed: number }[] {
    const map = new Map<string, { passed: number; failed: number }>();
    executions.forEach((e) => {
      const date = e.createdAt?.slice(0, 10) || "unknown";
      if (!map.has(date)) map.set(date, { passed: 0, failed: 0 });
      const cur = map.get(date)!;
      if (e.status === "PASSED") cur.passed++;
      else if (e.status === "FAILED") cur.failed++;
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));
  }

  const types = typeDistribution();
  const maxTypeCount = Math.max(...types.map((t) => t.count), 1);
  const lifecycle = defectLifecycle();
  const maxLifecycleCount = Math.max(...lifecycle.map((l) => l.count), 1);
  const trend = executionTrend();
  const maxTrendCount = Math.max(...trend.map((t) => t.passed + t.failed), 1);

  const totalExec = executions.length;
  const passedCount = executions.filter((e) => e.status === "PASSED").length;
  const failedCount = executions.filter((e) => e.status === "FAILED").length;
  const passRate = totalExec > 0 ? Math.round((passedCount / totalExec) * 100) : 0;
  const autoTestCases = testCases.filter((tc) => tc.testType === "UI_AUTOMATION").length;
  const totalCases = testCases.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumb="Analytics"
          title="Analytics"
          description="Test coverage, defect lifecycle and AI insights."
        />
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px] text-center">
          <p className="text-sm text-[#5B6675]">Loading metrics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Analytics"
        title="Analytics"
        description="Test coverage, defect lifecycle and AI insights."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card fade-in">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Test cases</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{totalCases}</p>
          <p className="text-xs text-[#5B6675] mt-1">{autoTestCases} automated</p>
        </div>
        <div className="card fade-in">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Executions</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{totalExec}</p>
          <p className="text-xs text-[#5B6675] mt-1">{failedCount} failed</p>
        </div>
        <div className="card fade-in">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Pass rate</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{passRate}%</p>
          <div className="progress-bar mt-2">
            <div
              className="progress-bar-fill bg-[#0A8043]"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
        <div className="card fade-in">
          <p className="text-xs text-[#5B6675] uppercase tracking-wider">Defects</p>
          <p className="text-2xl font-semibold text-[#1B2430]">{defects.length}</p>
          <p className="text-xs text-[#5B6675] mt-1">
            {lifecycle.find((l) => l.status === "OPEN")?.count || 0} open
          </p>
        </div>
      </div>

      {/* Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Type Distribution */}
        <div className="lg:col-span-2 card fade-in h-full">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Testing type breakdown</h3>
          {types.length === 0 ? (
            <p className="text-sm text-[#5B6675]">No test cases found. Add projects to get started.</p>
          ) : (
            <div className="space-y-3">
              {types.map((t) => (
                <div key={t.type} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-[#5B6675]">{t.label}</span>
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-bar-fill bg-[#1F6F8B]"
                      style={{ width: `${(t.count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-[#5B6675] text-right">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Defects */}
        <div className="card fade-in h-full">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Recent defects</h3>
          {defects.length === 0 ? (
            <p className="text-sm text-[#5B6675]">No defects found.</p>
          ) : (
            <div className="space-y-2">
              {defects.slice(0, 8).map((d) => (
                <div key={d.id} className="flex flex-col gap-1 p-2 border border-[#C9D0D8] rounded table-row-hover">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#1B2430]">{d.title}</span>
                    {getSeverityBadge(d.severity)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6675]">{d.id.slice(0, 8)}</span>
                    {getStatusBadge(d.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {defects.length > 8 && (
            <Link href="/defects" className="btn-link text-xs block mt-3">
              View all {defects.length} defects
            </Link>
          )}
        </div>
      </div>

      {/* Execution Trend & Defect Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card fade-in">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Execution trend</h3>
          {trend.length === 0 ? (
            <p className="text-sm text-[#5B6675]">No execution history available.</p>
          ) : (
            <div className="space-y-3">
              {trend.slice(-10).map((t) => {
                const total = t.passed + t.failed;
                return (
                  <div key={t.date} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-[#5B6675]">{t.date}</span>
                    <div className="flex-1 progress-bar">
                      <div
                        className="progress-bar-fill bg-[#0A8043]"
                        style={{ width: `${(t.passed / maxTrendCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-[#5B6675] text-right">{total}</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-[#5B6675] mt-3">
            Last 10 days. Pass: {passedCount} | Fail: {failedCount}
          </p>
        </div>

        <div className="card fade-in">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Defect lifecycle</h3>
          <div className="space-y-3">
            {lifecycle.map((l) => (
              <div key={l.status} className="flex items-center gap-3">
                <span className="w-24 text-xs text-[#5B6675] capitalize">{l.status.toLowerCase().replace("_", " ")}</span>
                <div className="flex-1 progress-bar">
                  <div
                    className="progress-bar-fill bg-[#1F6F8B]"
                    style={{ width: `${(l.count / maxLifecycleCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-[#5B6675] text-right">{l.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#5B6675] mt-3">Total defects: {defects.length}</p>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card fade-in">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-[28px] border border-[#C9D0D8] rounded bg-[#FAF8FD]">
              <p className="text-sm text-[#1B2430]">Add boundary tests for checkout total calculation</p>
              <p className="text-xs text-[#55398C] mt-1">Cites: TC-004, CI run #42</p>
              <div className="mt-2 flex gap-2">
                <button className="btn-primary text-xs">Accept</button>
                <button className="btn-outline text-xs px-3 py-1.5">Dismiss</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 card fade-in">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">AI assistant</h3>
          <div className="border border-[#C9D0D8] rounded p-3 h-48 overflow-y-auto text-sm text-[#5B6675] space-y-2">
            {messages.length === 0 && (
              <p>Ask about project quality metrics. The assistant never sends secrets to the model.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block rounded p-2 text-xs ${
                    m.role === "user"
                      ? "bg-[#E4F0F4] text-[#134F63]"
                      : "bg-[#EDF0F3] text-[#1B2430]"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question…"
              className="input flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={sending}
            />
            <button
              className="btn-primary px-3 py-2"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
          <p className="text-xs text-[#5B6675] mt-2">
            {totalCases} test cases, {totalExec} executions, {defects.length} defects. Pass rate: {passRate}%
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/reports" className="btn-link text-sm">
          View Allure reports
        </Link>
        <Link href="/test-cases" className="btn-link text-sm">
          Browse test cases
        </Link>
        <Link href="/ai-assistant" className="btn-link text-sm">
          AI test case generator
        </Link>
      </div>
    </div>
  );
}

