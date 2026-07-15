export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Application Status</h2>
        <p className="text-zinc-400 text-sm">
          Track and log stages of your active applications (applied, interviews, offers).
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 p-0.5 shadow-lg shadow-emerald-500/5">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Application Pipeline</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          No applications have entered the tracking pipeline yet. Once you add job applications, their status transitions will appear here.
        </p>
        <button disabled className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-400 cursor-not-allowed">
          View Pipeline Metrics
        </button>
      </div>
    </div>
  )
}
