export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Profile Settings</h2>
        <p className="text-zinc-400 text-sm">
          Manage your personal information, skills, and target industries.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/10 text-pink-400 p-0.5 shadow-lg shadow-pink-500/5">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Configure your Profile</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          Complete your career profile with skills, experience level, and preferred titles to help the AI tailor your job hunting activities.
        </p>
        <button disabled className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-400 cursor-not-allowed">
          Edit Profile Details
        </button>
      </div>
    </div>
  )
}
