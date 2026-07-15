export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Jobs Management</h2>
        <p className="text-zinc-400 text-sm">
          Track, organize, and view your targeted job applications.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 p-0.5 shadow-lg shadow-purple-500/5">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No jobs tracked yet</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          Click the add job button to start tracking your first job opportunity. AI JobBuddy will help you optimize your approach.
        </p>
        <button disabled className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-400 cursor-not-allowed">
          + Add Job Opportunity
        </button>
      </div>
    </div>
  )
}
