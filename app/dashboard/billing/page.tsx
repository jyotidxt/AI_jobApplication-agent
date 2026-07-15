export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Billing & Credits</h2>
        <p className="text-zinc-400 text-sm">
          Manage your subscription plan and purchase additional AI agent credits.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 p-0.5 shadow-lg shadow-amber-500/5">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Subscription Plans</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          You are currently on the <strong>Free Tier</strong> with 100 base monthly credits. Upgrade to access unlimited resumes and priority job search agent runs.
        </p>
        <button disabled className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-400 cursor-not-allowed">
          Upgrade to Premium ($15/mo)
        </button>
      </div>
    </div>
  )
}
