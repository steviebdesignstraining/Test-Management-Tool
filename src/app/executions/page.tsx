export default function ExecutionsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Test Runs / Executions</h1>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          + New Execution
        </button>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <p className="text-sm text-zinc-500">No executions yet. Run a test case to see results here.</p>
      </div>
    </div>
  );
}
