import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <DashboardSidebar userEmail={user?.email} />
      <SidebarInset className="flex flex-col flex-1 bg-zinc-950 text-zinc-100 border-l border-zinc-900">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-900 bg-zinc-950 px-6">
          <SidebarTrigger className="text-zinc-400 hover:text-white" />
          <div className="h-5 w-px bg-zinc-900" />
          <div className="flex-1">
            <span className="text-sm font-semibold tracking-tight text-zinc-400">AIJobBuddy Portal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Secure Session</span>
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-950">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
