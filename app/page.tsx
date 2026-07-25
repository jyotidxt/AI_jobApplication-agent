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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto h-12 px-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/20 active:scale-[0.99] transition-all duration-200 text-sm"
            >
              Enter Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto h-12 px-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/20 active:scale-[0.99] transition-all duration-200 text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto h-12 px-8 flex items-center justify-center border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 hover:text-white text-zinc-300 font-medium rounded-xl transition-colors text-sm"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </main>

      <footer className="absolute bottom-6 text-zinc-600 text-xs tracking-wider uppercase font-semibold">
        Protected with Supabase JWT & Next.js Middleware
      </footer>
    </div>
  )
}
