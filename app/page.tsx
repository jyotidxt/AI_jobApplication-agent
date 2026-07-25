import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (err) {
    // If Supabase keys are not set up or invalid, degrade gracefully
    console.error('Supabase initialization error on landing page:', err)
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4 overflow-hidden font-sans">
      {/* Background glow orbs */}
      <div className="absolute top-[-30%] left-[-20%] h-[700px] w-[700px] rounded-full bg-purple-900/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] h-[700px] w-[700px] rounded-full bg-indigo-900/10 blur-[140px] pointer-events-none" />

      <main className="relative z-10 max-w-2xl text-center space-y-8 py-20">
        {/* Logo Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-xl shadow-purple-500/10">
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-zinc-950 text-white font-extrabold text-2xl">
            AI
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            AI Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Application Agent</span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-lg mx-auto font-medium leading-relaxed">
            Your automated career assistant. Manage, track, and optimize your job applications powered by intelligent AI models.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col items-center justify-center gap-6 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-14 px-10 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200 text-base md:text-lg gap-2"
              >
                ⚡ Enter Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto h-14 px-10 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200 text-base md:text-lg gap-2"
                >
                  🔑 Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto h-14 px-10 flex items-center justify-center border-2 border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:text-white text-zinc-200 font-extrabold rounded-2xl active:scale-[0.98] transition-all duration-200 text-base md:text-lg gap-2"
                >
                  ✨ Create Account
                </Link>
              </>
            )}
          </div>

          {/* Cute 3D Portfolio Access Button */}
          <div className="w-full flex justify-center pt-2">
            <Link
              href="https://github.com/jyotidxt"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group w-full sm:w-auto h-16 px-12 flex items-center justify-center bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-zinc-950 font-black rounded-3xl shadow-2xl hover:shadow-emerald-500/30 active:scale-[0.97] transition-all duration-300 text-lg md:text-xl gap-3 cursor-pointer overflow-hidden border border-emerald-400/20"
            >
              {/* Inner ambient shine animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
              
              <span>🎮</span>
              <span>See 3D Portfolio Directly</span>
              <span>🚀</span>

              {/* Notification ping badge */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
              </span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-6 text-zinc-600 text-xs tracking-wider uppercase font-semibold">
        Protected with Supabase JWT & Next.js Middleware
      </footer>
    </div>
  )
}
