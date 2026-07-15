export default function ResumePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Resume Builder</h2>
        <p className="text-zinc-400 text-sm">
          Optimize, customize, and edit your resumes for specific job descriptions.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 p-0.5 shadow-lg shadow-indigo-500/5">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No resumes uploaded</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          Upload your master resume so AI JobBuddy can automatically adapt it to match any job description you target.
        </p>
        <button disabled className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-400 cursor-not-allowed">
          Upload Master Resume
        </button>
      </div>
    </div>
  )
}
