"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

const TYPE_COLORS = ["#1F6F8B", "#0A8043", "#8F2A20", "#F59E0B", "#6B46C1", "#D94E48", "#0EA5E9", "#6366F1"];

interface Overview {
  totalTestCases: number;
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  passRate: number;
  totalDefects: number;
  openDefects: number;
  ciRuns: number;
  allureReports: number;
}

interface Coverage {
  totalCases: number;
  typeCoverage: { type: string; count: number }[];
  planCoverage: { planId: string; planName: string; totalCases: number }[];
  allureSummary: { id: string; name: string; totalTests: number; passedTests: number; failedTests: number; passRate: number; createdAt: string }[];
}

interface TrendPoint {
  date: string;
  passed: number;
  failed: number;
  total: number;
}

interface TrendData {
  trend: TrendPoint[];
  ciRuns: { id: string; pipelineName: string; buildNumber: number; status: string; branch: string; createdAt: string; duration?: number }[];
  totalExecutions: number;
}

interface FlakyTest {
  key: string;
  title: string;
  passed: number;
  failed: number;
  executions: number;
  flakinessRate: number;
}

interface FlakyData {
  flakyTests: FlakyTest[];
  totalFlaky: number;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = (value: any, name: any) => [value, name];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [flakyData, setFlakyData] = useState<FlakyData | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ovRes, covRes, trendRes, flakyRes] = await Promise.all([
          fetch("/api/v1/analytics/overview"),
          fetch("/api/v1/analytics/coverage"),
          fetch("/api/v1/analytics/trends"),
          fetch("/api/v1/analytics/flaky-tests"),
        ]);
        const ov = await ovRes.json();
        const cov = await covRes.json();
        const trend = await trendRes.json();
        const flaky = await flakyRes.json();

        if (!mounted) return;

        setOverview(ov);
        setCoverage(cov);
        setTrendData(trend);
        setFlakyData(flaky);
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

  const trimmedHistory = messages.slice(-20);
    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationHistory: trimmedHistory }),
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

  const types = coverage?.typeCoverage.map((t) => ({
    type: t.type,
    count: t.count,
    label: TEST_TYPE_LABELS[t.type] || t.type,
  })) ?? [];

  const trend = trendData?.trend ?? [];
  const maxTrendCount = Math.max(...trend.map((t) => t.total), 1);

  const totalExec = overview?.totalExecutions ?? 0;
  const passedCount = overview?.passedExecutions ?? 0;
  const failedCount = overview?.failedExecutions ?? 0;
  const passRate = overview?.passRate ?? 0;
  const autoTestCases = types.filter((t) => t.type === "UI_AUTOMATION").reduce((sum, t) => sum + t.count, 0);
  const totalCases = overview?.totalTestCases ?? 0;

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
          <p className="text-2xl font-semibold text-[#1B2430]">{overview?.totalDefects ?? 0}</p>
          <p className="text-xs text-[#5B6675] mt-1">
            {overview?.openDefects ?? 0} open
          </p>
        </div>
      </div>

      {/* Pass/Fail Pie Chart */}
      {totalExec > 0 && (
        <div className="card fade-in">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Test results distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie
                data={[
                  { name: "Passed", value: passedCount },
                  { name: "Failed", value: failedCount },
                  { name: "Other", value: totalExec - passedCount - failedCount },
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? "N/A"} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
              >
                <Cell fill="#0A8043" />
                <Cell fill="#D94E48" />
                <Cell fill="#9CA3AF" />
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #C9D0D8" }}
                formatter={tooltipFormatter}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Type Distribution */}
        <div className="lg:col-span-2 card fade-in h-full">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Testing type breakdown</h3>
          {types.length === 0 ? (
            <p className="text-sm text-[#5B6675]">No test cases found. Add projects to get started.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={types} margin={{ top: 4, right: 24, left: 0, bottom: 24 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#5B6675", angle: -30, textAnchor: "end" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #C9D0D8" }}
                  formatter={tooltipFormatter}
                  labelStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {types.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent CI Runs */}
        <div className="card fade-in h-full">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Recent CI/CD Runs</h3>
          {trendData?.ciRuns.length === 0 ? (
            <p className="text-sm text-[#5B6675]">No CI/CD runs recorded.</p>
          ) : (
            <div className="space-y-2">
              {trendData?.ciRuns.slice(0, 8).map((r) => (
                <div key={r.id} className="flex flex-col gap-1 p-2 border border-[#C9D0D8] rounded table-row-hover">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#1B2430]">{r.pipelineName} #{r.buildNumber}</span>
                    <span className={`badge text-xs ${r.status === "PASSED" ? "status-pass" : r.status === "FAILED" ? "status-fail" : "status-neutral"}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6675]">{r.branch}</span>
                    <span className="text-xs text-[#5B6675]">{r.duration ? r.duration + "s" : "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {trendData && trendData.ciRuns.length > 8 && (
            <Link href="/ci-cd" className="btn-link text-xs block mt-3">
              View all {trendData.ciRuns.length} CI runs
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
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend.slice(-10)} margin={{ top: 4, right: 24, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#5B6675" }} />
                <YAxis hide domain={[0, maxTrendCount]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #C9D0D8" }}
                formatter={tooltipFormatter}
                  labelStyle={{ fontSize: 12 }}
                />
                <Legend verticalAlign="top" height={30} iconSize={10} />
                <Line type="monotone" dataKey="passed" stroke="#0A8043" name="Passed" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} />
                <Line type="monotone" dataKey="failed" stroke="#D94E48" name="Failed" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-[#5B6675] mt-3">
            Last 10 days. Pass: {passedCount} | Fail: {failedCount}
          </p>
        </div>

        <div className="card fade-in">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Allure Reports</h3>
          {coverage?.allureSummary.length === 0 ? (
            <p className="text-sm text-[#5B6675]">No Allure reports ingested.</p>
          ) : (
            <div className="space-y-3">
              {coverage?.allureSummary.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-[#5B6675] truncate">{r.name}</span>
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-bar-fill bg-[#1F6F8B]"
                      style={{ width: `${r.passRate}%` }}
                    />
                  </div>
                  <span className="w-16 text-xs text-[#5B6675] text-right">{r.passRate}%</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[#5B6675] mt-3">
            {overview?.allureReports ?? 0} report(s) ingested
          </p>
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
               maxLength={2000}
               value={input}
               onChange={(e) => setInput(e.target.value.slice(0, 2000))}
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
            {totalCases} test cases, {totalExec} executions, {overview?.totalDefects ?? 0} defects. Pass rate: {passRate}%
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

