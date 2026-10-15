export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F7F9] px-6">
      {/* Sign in card */}
      <div className="w-full max-w-2xl bg-white border border-[#C9D0D8] rounded-lg shadow-sm flex flex-col md:flex-row">
        <form className="w-full md:w-1/2 p-8 space-y-5">
          <h2 className="text-xl font-semibold text-[#1B2430]">Sign in</h2>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1B2430]">Email</label>
            <input
              type="email"
              className="w-full border border-[#C9D0D8] rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#1F6F8B] outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1B2430]">Password</label>
            <input
              type="password"
              className="w-full border border-[#C9D0D8] rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#1F6F8B] outline-none"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-[#5B6675]">
              <input type="checkbox" className="accent-[#1F6F8B]" />
              Keep me signed in
            </label>
            <a href="#" className="text-[#1F6F8B] hover:underline">Forgot password?</a>
          </div>
          <button type="submit" className="w-full bg-[#1F6F8B] text-white py-2 rounded text-sm font-medium hover:bg-[#134F63]">
            Sign in
          </button>
          <hr className="border-[#C9D0D8] my-1" />
          <button type="button" className="w-full border border-[#C9D0D8] text-[#1F6F8B] py-2 rounded text-sm font-medium hover:bg-[#E4F0F4] flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8m1 3.8v-3a2 2 0 00-2-2.197V9H6v12.197c0 1.195.643 2.196 1.767 2.368z" />
            </svg>
            Continue with GitHub
          </button>
          <p className="text-center text-sm text-[#5B6675]">
            Don't have an account?{" "}
            <a href="#" className="text-[#1F6F8B] font-medium hover:underline">Create account</a>
          </p>
        </form>
        {/* Right info panel */}
        <div className="w-full md:w-1/2 bg-[#E4F0F4] p-8 flex flex-col justify-between border-l border-[#C9D0D8] md:border-l md:border-t-0 md:border-b-0 rounded-none md:rounded-r-lg">
          <div>
            <h3 className="text-lg font-semibold text-[#134F63]">One source of truth for test evidence</h3>
            <p className="text-[#1B2430] mt-2 text-sm leading-relaxed">
              TestHub brings manual testing, automation, CI/CD results, defects and AI insights into one workspace.
              Built for individual testers and QA teams.
            </p>
            <div className="mt-6 space-y-3 text-xs text-[#134F63]">
              <div className="flex items-start gap-2">
                <span className="text-[#1F6F8B]">•</span>
                <span>Role-based permissions: Owner, Admin, QA Lead, Tester, Developer, Read-only</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#1F6F8B]">•</span>
                <span>Tenant isolation — users never access another organisation's records</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#1F6F8B]">•</span>
                <span>Audit history for important workflow changes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
