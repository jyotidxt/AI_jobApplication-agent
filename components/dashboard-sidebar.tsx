'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function DashboardSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const isExpanded = state === 'expanded'

  const navItems = [
    {
      title: 'Jobs',
      url: '/dashboard/jobs',
      icon: (
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Resume',
      url: '/dashboard/resume',
      icon: (
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Profile',
      url: '/dashboard/profile',
      icon: (
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: 'Application Status',
      url: '/dashboard/applications',
      icon: (
        <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-900 bg-zinc-950 text-zinc-300">
      {/* Sidebar Header */}
      <SidebarHeader className="h-16 flex items-center justify-between border-b border-zinc-900 px-4 py-2 bg-zinc-950">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-md shadow-purple-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-md bg-zinc-950 text-white font-black text-base">
              JB
            </div>
          </div>
          {isExpanded && (
            <span className="font-black text-lg tracking-tight text-white animate-fade-in truncate">
              AIJobBuddy
            </span>
          )}
        </div>
      </SidebarHeader>

      {/* Sidebar Content (Navigation) */}
      <SidebarContent className="py-6 px-3 bg-zinc-950">
        <SidebarMenu className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    'flex items-center gap-4 w-full h-12 px-3 rounded-xl text-sm font-semibold transition-all duration-250',
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-4 w-full h-full">
                    {item.icon}
                    {isExpanded && <span className="truncate text-[15px]">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}

          {/* Interactive Collapse Button inside the Sidebar list */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isExpanded ? 'Collapse Menu' : 'Expand Menu'}
              onClick={toggleSidebar}
              className="flex items-center gap-4 w-full h-12 px-3 rounded-xl text-sm font-semibold text-zinc-450 hover:text-white hover:bg-zinc-900/50"
            >
              <div className="flex items-center gap-4 w-full h-full text-left">
                <svg
                  className={cn('h-6 w-6 shrink-0 transition-transform duration-300', !isExpanded && 'rotate-180')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                {isExpanded && <span className="truncate text-[15px]">Collapse Sidebar</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-zinc-900 p-4 space-y-5 bg-zinc-950">
        {/* Billing/Credits Display (Set to 0 / Empty) */}
        <div className="rounded-xl bg-zinc-900/25 border border-zinc-900 p-3 space-y-2.5 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isExpanded && <span className="text-xs font-bold text-zinc-300">Credits</span>}
            </div>
            {isExpanded ? (
              <span className="text-xs font-black text-white">0 / 100</span>
            ) : (
              <span className="text-[10px] font-black text-white bg-purple-500/20 px-1.5 py-0.5 rounded">0</span>
            )}
          </div>
          {isExpanded && (
            <div className="space-y-2 animate-fade-in">
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: '0%' }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold">
                <span>0% remaining</span>
                <Link href="/dashboard/billing" className="text-purple-400 hover:text-purple-300 hover:underline">
                  Upgrade
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Settings and Logout */}
        <SidebarMenu className="space-y-2">
          {/* Billing Options for collapsed state */}
          {!isExpanded && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Billing / Credits" className="text-zinc-400 hover:text-white hover:bg-zinc-900/50 h-10 w-10">
                <Link href="/dashboard/billing" className="flex items-center justify-center w-full">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Profile settings */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Profile Settings"
              isActive={pathname === '/dashboard/profile'}
              className={cn(
                'flex items-center gap-4 w-full h-12 px-3 rounded-xl text-sm font-semibold transition-all duration-200',
                pathname === '/dashboard/profile'
                  ? 'bg-zinc-900 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              )}
            >
              <Link href="/dashboard/profile" className="flex items-center gap-4 w-full h-full">
                <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isExpanded && <span className="truncate text-[15px]">Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <form action={signOut} className="w-full">
              <SidebarMenuButton
                tooltip="Sign Out"
                className="flex items-center gap-4 w-full h-12 px-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              >
                <button type="submit" className="flex items-center gap-4 w-full h-full text-left">
                  <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isExpanded && <span className="truncate text-[15px]">Sign Out</span>}
                </button>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Summary profile info */}
        {isExpanded && userEmail && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-zinc-900/10 border border-zinc-900 truncate animate-fade-in">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shrink-0">
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 font-sans">
              <p className="text-xs font-bold text-white truncate">{userEmail}</p>
              <p className="text-[10px] text-zinc-550 font-bold">Free Tier</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
