export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#1B2430]">Settings</h1>

      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">AI and data use</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Enable AI features</p>
              <p className="text-xs text-[#5B6675]">AI suggestions use Neon AI Gateway when available.</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#EDF0F3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform translate-x-1.5 bg-white transition-transform rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Auto-complete policy</p>
              <p className="text-xs text-[#5B6675]">Off by default — requires human approval.</p>
            </div>
            <select className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white">
              <option>Off (manual approval)</option>
              <option>On (auto-approve high confidence)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Confidence threshold</p>
              <p className="text-xs text-[#5B6675]">Minimum confidence for AI suggestions.</p>
            </div>
            <input type="number" className="border border-[#C9D0D8] rounded px-3 py-2 text-sm w-20" min="0" max="100" value={80} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Retention days</p>
              <p className="text-xs text-[#5B6675]">How long AI interaction data is kept.</p>
            </div>
            <input type="number" className="border border-[#C9D0D8] rounded px-3 py-2 text-sm w-20" min="1" value={90} />
          </div>
          <p className="text-xs text-[#5B6675] italic">Confidence is a prioritisation signal, not proof of correctness.</p>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Quality gates</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Minimum pass rate</p>
              <p className="text-xs text-[#5B6675]">Gate fails when pass rate drops below this.</p>
            </div>
            <input type="number" className="border border-[#C9D0D8] rounded px-3 py-2 text-sm w-20" min="0" max="100" value={90} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">No critical failures</p>
              <p className="text-xs text-[#5B6675]">Block release on any critical test failure.</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#EDF0F3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform translate-x-1.5 bg-white transition-transform rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4 text-[#8F2A20]">Danger zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#1B2430]">Export data</p>
              <p className="text-xs text-[#5B6675]">Download all test data as JSON/CSV.</p>
            </div>
            <button className="text-[#1F6F8B] text-sm hover:underline">Export</button>
          </div>
          <div className="pt-4 border-t border-[#C9D0D8]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1B2430]">Delete workspace</p>
                <p className="text-xs text-[#5B6675]">Permanently delete all data. Cannot be undone.</p>
              </div>
              <button className="text-[#8F2A20] text-sm font-medium hover:underline">Delete workspace</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
