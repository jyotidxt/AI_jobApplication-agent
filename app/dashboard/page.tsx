import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const mockStats = [
    {
      title: 'Active Applications',
      value: '0',
      description: 'Jobs currently tracked',
      icon: (
        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'Resumes Tailored',
      value: '0',
      description: 'Versions built with AI',
      icon: (
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Success Rate',
      value: '0%',
      description: 'Interview callback rate',
      icon: (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-purple-900/10 blur-[90px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome to AIJobBuddy
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl">
            Here's an overview of your job application activities. Select any tab in the sidebar to get started.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold relative z-10">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
          Active Agent Session
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat) => (
          <Card key={stat.title} className="border-zinc-900 bg-zinc-950/40 text-zinc-100 shadow-xl backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-zinc-400">{stat.title}</CardTitle>
              <div className="p-2 bg-zinc-900/80 rounded-lg">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview/Guide Card */}
      <Card className="border-zinc-900 bg-zinc-950/20 text-zinc-100 shadow-xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Getting Started with your AI Job Assistant</CardTitle>
          <CardDescription className="text-zinc-500">How to maximize your application success with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900 space-y-2">
              <h4 className="font-semibold text-sm text-purple-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 text-xs text-purple-400 font-bold">1</span>
                Track Jobs
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add job opportunities in the <strong>Jobs</strong> page to track application deadlines, interview dates, and custom notes.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900 space-y-2">
              <h4 className="font-semibold text-sm text-indigo-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-400 font-bold">2</span>
                Tailor Resumes
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload your master resume in the <strong>Resume</strong> builder. The AI agent will auto-optimize your experience for targeted roles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
