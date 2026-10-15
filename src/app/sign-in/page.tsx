export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F7F9] px-[28px]">
      <div className="w-full max-w-2xl bg-white border border-[#C9D0D8] rounded-lg shadow-sm flex flex-col md:flex-row">
        <form className="w-full md:w-1/2 p-[28px] space-y-5">
          <h2 className="text-2xl font-semibold text-[#1B2430]">Sign in</h2>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1B2430]">Email</label>
            <input
              type="email"
              className="input w-full"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1B2430]">Password</label>
            <input
              type="password"
              className="input w-full"
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
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
          <hr className="border-[#C9D0D8] my-[28px]" />
          <button type="button" className="btn-outline w-full flex items-center justify-center gap-2">
            Continue with GitHub
          </button>
          <p className="text-center text-sm text-[#5B6675]">
            Don't have an account?{" "}
            <a href="#" className="text-[#1F6F8B] font-medium hover:underline">Create account</a>
          </p>
        </form>
        <div className="w-full md:w-1/2 bg-[#E4F0F4] p-[28px] flex flex-col justify-between border-l border-[#C9D0D8] md:border-l md:border-t-0 md:border-b-0 rounded-none md:rounded-r-lg">
          <div>
            <h3 className="text-lg font-semibold text-[#134F63]">One source of truth for test evidence</h3>
            <p className="text-[#1B2430] mt-2 text-sm leading-relaxed">
              TestHub brings manual testing, automation, CI/CD results, defects and AI insights into one workspace.
              Built for individual testers and QA teams.
            </p>
            <ul className="mt-6 space-y-3 text-xs text-[#134F63] list-disc pl-4">
              <li>Role-based permissions: Owner, Admin, QA Lead, Tester, Developer, Read-only</li>
              <li>Tenant isolation — users never access another organisation's records</li>
              <li>Audit history for important workflow changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
