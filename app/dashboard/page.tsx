import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden font-sans">
      {/* Background glow orbs */}
      <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-md shadow-purple-500/10">
              <div className="flex h-full w-full items-center justify-center rounded-md bg-zinc-950 text-white font-bold text-sm">
                AI
              </div>
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">AI Job Agent Console</span>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back,
            </h1>
            <p className="text-purple-400 font-medium text-lg md:text-xl truncate max-w-md lg:max-w-xl">
              {user.email}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            Session Active
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Identity */}
          <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl text-zinc-100 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Profile Details</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">Your registered account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">User ID</span>
                <p className="text-sm font-mono text-zinc-300 bg-zinc-950/50 p-2 rounded border border-zinc-800/40 break-all select-all">
                  {user.id}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Email</span>
                <p className="text-sm text-zinc-300 truncate">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Auth Provider */}
          <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl text-zinc-100 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Auth Provider</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">Security credentials & provider</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Method</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 capitalize border border-zinc-700">
                    {user.app_metadata?.provider || 'Email / Password'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Security status</span>
                <p className="text-sm text-zinc-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Verified Session
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Timeline */}
          <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl text-zinc-100 shadow-xl md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Timeline</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">Account history and status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Created At</span>
                <p className="text-sm text-zinc-300">{createdDate}</p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Last Sign In</span>
                <p className="text-sm text-zinc-300">{lastSignIn}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
