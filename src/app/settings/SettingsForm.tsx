"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { saveUserSettings } from "@/app/actions";
import { exportData } from "@/app/actions";
import { deleteWorkspace } from "@/app/actions";

interface UserSettings {
  userId: string;
  aiEnabled: boolean;
  autoComplete: string;
  confidenceThreshold: number;
  retentionDays: number;
  minPassRate: number;
  blockOnCriticalFailures: boolean;
  aiProvider?: string | null;
  aiModel?: string | null;
  integrationConfigs?: Record<string, unknown> | null;
}

interface SettingsFormProps {
  userId: string;
  settings: UserSettings | null;
}

export default function SettingsForm({ userId, settings }: SettingsFormProps) {
  const [aiEnabled, setAiEnabled] = useState(settings?.aiEnabled ?? true);
  const [autoComplete, setAutoComplete] = useState(settings?.autoComplete ?? "OFF");
  const [confidenceThreshold, setConfidenceThreshold] = useState(settings?.confidenceThreshold ?? 80);
  const [retentionDays, setRetentionDays] = useState(settings?.retentionDays ?? 90);
  const [minPassRate, setMinPassRate] = useState(settings?.minPassRate ?? 90);
  const [blockOnCriticalFailures, setBlockOnCriticalFailures] = useState(settings?.blockOnCriticalFailures ?? true);
  const [aiProvider, setAiProvider] = useState(settings?.aiProvider ?? "gemini");
  const [aiModel, setAiModel] = useState(settings?.aiModel ?? "gemini-flash-lite-latest");
  const [jiraEnabled, setJiraEnabled] = useState<boolean>(settings?.integrationConfigs?.jira ? true : false);
  const [jiraBaseUrl, setJiraBaseUrl] = useState<string>((settings?.integrationConfigs?.jira as { baseUrl?: string })?.baseUrl ?? "");
  const [jiraEmail, setJiraEmail] = useState<string>((settings?.integrationConfigs?.jira as { email?: string })?.email ?? "");
  const [jiraApiToken, setJiraApiToken] = useState<string>("");
  const [jiraProjectKey, setJiraProjectKey] = useState<string>((settings?.integrationConfigs?.jira as { projectKey?: string })?.projectKey ?? "");
  const [azureEnabled, setAzureEnabled] = useState<boolean>(settings?.integrationConfigs?.azure ? true : false);
  const [azureOrg, setAzureOrg] = useState<string>((settings?.integrationConfigs?.azure as { org?: string })?.org ?? "");
  const [azureProject, setAzureProject] = useState<string>((settings?.integrationConfigs?.azure as { project?: string })?.project ?? "");
  const [azurePersonalToken, setAzurePersonalToken] = useState<string>("");
  const [trelloEnabled, setTrelloEnabled] = useState<boolean>(settings?.integrationConfigs?.trello ? true : false);
  const [trelloBoardId, setTrelloBoardId] = useState<string>((settings?.integrationConfigs?.trello as { boardId?: string })?.boardId ?? "");
  const [trelloToken, setTrelloToken] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setAiEnabled(settings?.aiEnabled ?? true);
    setAutoComplete(settings?.autoComplete ?? "OFF");
    setConfidenceThreshold(settings?.confidenceThreshold ?? 80);
    setRetentionDays(settings?.retentionDays ?? 90);
    setMinPassRate(settings?.minPassRate ?? 90);
    setBlockOnCriticalFailures(settings?.blockOnCriticalFailures ?? true);
  }, [settings]);

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("aiEnabled", String(aiEnabled));
      formData.append("autoComplete", autoComplete);
      formData.append("confidenceThreshold", String(confidenceThreshold));
      formData.append("retentionDays", String(retentionDays));
      formData.append("minPassRate", String(minPassRate));
      formData.append("blockOnCriticalFailures", String(blockOnCriticalFailures));
      formData.append("aiProvider", aiProvider);
      formData.append("aiModel", aiModel);

      if (jiraEnabled) {
        formData.append("jiraEnabled", "on");
        formData.append("jiraBaseUrl", jiraBaseUrl);
        formData.append("jiraEmail", jiraEmail);
        formData.append("jiraApiToken", jiraApiToken);
        formData.append("jiraProjectKey", jiraProjectKey);
      }
  if (azureEnabled) {
        formData.append("azureEnabled", "on");
        formData.append("azureOrg", azureOrg);
        formData.append("azureProject", azureProject);
        formData.append("azurePersonalToken", azurePersonalToken);
      }
      if (trelloEnabled) {
        formData.append("trelloEnabled", "on");
        formData.append("trelloBoardId", trelloBoardId);
        formData.append("trelloToken", trelloToken);
      }

      await saveUserSettings(formData);

      setJiraApiToken("");
      setAzurePersonalToken("");
      setTrelloToken("");

      setMessage("Settings saved.");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setMessage("");
    setErrorMsg("");
    try {
      const data = await exportData(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `testhub-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Export completed.");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteWorkspace() {
    const projectId = window.prompt("Enter the project ID to delete permanently:");
    if (!projectId) return;
    if (!window.confirm(`Type the project ID "${projectId}" to confirm permanent deletion.`)) return;

    setDeleting(true);
    setErrorMsg("");
    try {
      await deleteWorkspace(userId, projectId);
      setMessage("Workspace deleted.");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to delete workspace.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Settings"
        title="Settings"
        description="Configure AI, quality gates and workspace options."
      />

      {message && (
        <div className="text-sm text-[#14633E] bg-[#E3F2EA] border border-[#C9D0D8] rounded px-3 py-2">
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="text-sm text-[#8F2A20] bg-[#FBE7E4] border border-[#C9D0D8] rounded px-3 py-2">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">AI and data use</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Enable AI features</p>
              <p className="text-xs text-[#5B6675]">AI suggestions use Neon AI Gateway when available.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={aiEnabled}
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] focus:ring-offset-2 ${
                aiEnabled ? "bg-[#1F6F8B]" : "bg-[#EDF0F3]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform bg-white transition-transform rounded-full ${
                  aiEnabled ? "translate-x-6" : "translate-x-1.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Auto-complete policy</p>
              <p className="text-xs text-[#5B6675]">Off by default — requires human approval.</p>
            </div>
            <select
              className="input w-48"
              value={autoComplete}
              onChange={(e) => setAutoComplete(e.target.value)}
            >
              <option value="OFF">Off (manual approval)</option>
              <option value="HIGH">On (auto-approve high confidence)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Confidence threshold</p>
              <p className="text-xs text-[#5B6675]">Minimum confidence for AI suggestions.</p>
            </div>
            <input
              type="number"
              className="input w-20"
              min="0"
              max="100"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value) || 80)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Retention days</p>
              <p className="text-xs text-[#5B6675]">How long AI interaction data is kept.</p>
            </div>
            <input
              type="number"
              className="input w-20"
              min="1"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value) || 90)}
            />
          </div>

          <p className="text-xs text-[#5B6675] italic">
            Confidence is a prioritisation signal, not proof of correctness.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#C9D0D8]">
            <div>
              <p className="text-sm text-[#1B2430]">AI provider</p>
              <p className="text-xs text-[#5B6675]">Choose your AI model provider.</p>
            </div>
            <select
              className="input w-48"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
            >
              <option value="gemini">Gemini (Google)</option>
              <option value="openai">OpenAI GPT</option>
              <option value="claude">Claude (Anthropic)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#C9D0D8]">
            <div>
              <p className="text-sm text-[#1B2430]">AI model</p>
              <p className="text-xs text-[#5B6675]">Free: gemini-flash-lite-latest, gpt-4o-mini, claude-3-haiku-20240307</p>
            </div>
            <input
              type="text"
              className="input w-48"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Third-party integrations</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#1B2430]">Jira</h3>
              <button
                type="button"
                role="switch"
                aria-checked={jiraEnabled}
                onClick={() => setJiraEnabled(!jiraEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] ${
                  jiraEnabled ? "bg-[#1F6F8B]" : "bg-[#EDF0F3]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                    jiraEnabled ? "translate-x-6" : "translate-x-1.5"
                  }`}
                />
              </button>
            </div>
            {jiraEnabled && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Base URL</label>
                  <input
                    type="url"
                    className="input w-full"
                    placeholder="https://your-domain.atlassian.net"
                    value={jiraBaseUrl}
                    onChange={(e) => setJiraBaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="you@company.com"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">API token</label>
                  <input
                    type="password"
                    className="input w-full"
                    placeholder="Atlassian API token"
                    value={jiraApiToken}
                    onChange={(e) => setJiraApiToken(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Project key</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="e.g. TST"
                    value={jiraProjectKey}
                    onChange={(e) => setJiraProjectKey(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#1B2430]">Azure DevOps</h3>
              <button
                type="button"
                role="switch"
                aria-checked={azureEnabled}
                onClick={() => setAzureEnabled(!azureEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] ${
                  azureEnabled ? "bg-[#1F6F8B]" : "bg-[#EDF0F3]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                    azureEnabled ? "translate-x-6" : "translate-x-1.5"
                  }`}
                />
              </button>
            </div>
            {azureEnabled && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Organization</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="e.g. your-org"
                    value={azureOrg}
                    onChange={(e) => setAzureOrg(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Project</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="e.g. MyProject"
                    value={azureProject}
                    onChange={(e) => setAzureProject(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Personal access token</label>
                  <input
                    type="password"
                    className="input w-full"
                    placeholder="Azure DevOps PAT"
                    value={azurePersonalToken}
                    onChange={(e) => setAzurePersonalToken(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#1B2430]">Trello</h3>
              <button
                type="button"
                role="switch"
                aria-checked={trelloEnabled}
                onClick={() => setTrelloEnabled(!trelloEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] ${
                  trelloEnabled ? "bg-[#1F6F8B]" : "bg-[#EDF0F3]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                    trelloEnabled ? "translate-x-6" : "translate-x-1.5"
                  }`}
                />
              </button>
            </div>
            {trelloEnabled && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Board ID</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Trello board ID"
                    value={trelloBoardId}
                    onChange={(e) => setTrelloBoardId(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Token</label>
                  <input
                    type="password"
                    className="input w-full"
                    placeholder="Trello API token"
                    value={trelloToken}
                    onChange={(e) => setTrelloToken(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px] fade-in">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Quality gates</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Minimum pass rate</p>
              <p className="text-xs text-[#5B6675]">Gate fails when pass rate drops below this.</p>
            </div>
            <input
              type="number"
              className="input w-20"
              min="0"
              max="100"
              value={minPassRate}
              onChange={(e) => setMinPassRate(parseInt(e.target.value) || 90)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">No critical failures</p>
              <p className="text-xs text-[#5B6675]">Block release on any critical test failure.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={blockOnCriticalFailures}
              onClick={() => setBlockOnCriticalFailures(!blockOnCriticalFailures)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] focus:ring-offset-2 ${
                blockOnCriticalFailures ? "bg-[#1F6F8B]" : "bg-[#EDF0F3]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform bg-white transition-colors rounded-full ${
                  blockOnCriticalFailures ? "translate-x-6" : "translate-x-1.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4 text-[#8F2A20]">Danger zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Export data</p>
              <p className="text-xs text-[#5B6675]">Download all test data as JSON.</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-[#1F6F8B] text-sm hover:underline"
            >
              {exporting ? "Exporting…" : "Export"}
            </button>
          </div>

          <div className="pt-4 border-t border-[#C9D0D8]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1B2430]">Delete workspace</p>
                <p className="text-xs text-[#5B6675]">Permanently delete all data. Cannot be undone.</p>
              </div>
              <button
                onClick={handleDeleteWorkspace}
                disabled={deleting}
                className="text-[#8F2A20] text-sm font-medium hover:underline"
              >
                {deleting ? "Deleting…" : "Delete workspace"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
