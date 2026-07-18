'use client'

import React, { useState, useEffect } from 'react'
import { DbJob, fetchAndStoreJobs } from '@/app/actions/jobs'
import { JobPlatformCards } from './job-platform-cards'
import { JobCard } from './job-card'
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Activity, 
  Briefcase, 
  HelpCircle,
  AlertCircle,
  Search,
  X
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface JobsDashboardViewProps {
  initialJobs: DbJob[]
  initialProfile: any
  initialIsMock: boolean
}

export function JobsDashboardView({ initialJobs, initialProfile, initialIsMock }: JobsDashboardViewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'greenhouse', 'lever', 'workable'
  ])
  const [jobs, setJobs] = useState<DbJob[]>(initialJobs)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(initialIsMock)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Greenhouse' | 'Lever' | 'Workable'>('All')

  // Compute profile completeness score
  const getProfileCompleteness = () => {
    let score = 0
    const missing: { name: string; bonus: number; field: string }[] = []

    if (!initialProfile) {
      return { 
        score: 0, 
        missing: [
          { name: 'Create profile details', bonus: 100, field: 'all' }
        ] 
      }
    }

    if (initialProfile.full_name?.trim()) score += 10
    else missing.push({ name: 'Full Name', bonus: 10, field: 'full_name' })

    if (initialProfile.email?.trim()) score += 10
    else missing.push({ name: 'Email Address', bonus: 10, field: 'email' })

    if (initialProfile.phone?.trim()) score += 10
    else missing.push({ name: 'Phone Number', bonus: 10, field: 'phone' })

    if (initialProfile.address?.trim()) score += 15
    else missing.push({ name: 'Address / Location', bonus: 15, field: 'address' })

    if (initialProfile.summary?.trim()) score += 15
    else missing.push({ name: 'Professional Summary', bonus: 15, field: 'summary' })

    if (initialProfile.skills && initialProfile.skills.length > 0) score += 15
    else missing.push({ name: 'Skills / Tech Stack', bonus: 15, field: 'skills' })

    if (initialProfile.experience && initialProfile.experience.length > 0) score += 15
    else missing.push({ name: 'Work Experience', bonus: 15, field: 'experience' })

    if (initialProfile.education && initialProfile.education.length > 0) score += 10
    else missing.push({ name: 'Education Details', bonus: 10, field: 'education' })

    return { score, missing }
  }

  const { score: completenessScore, missing: missingFields } = getProfileCompleteness()

  // Run the fetch operation
  const handleFetchJobs = async (force: boolean = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    
    setError(null)

    try {
      const res = await fetchAndStoreJobs(selectedPlatforms, force, searchQuery)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else if (res.success && res.jobs) {
        setJobs(res.jobs)
        setIsMock(!!res.isMock)
        if (force) {
          toast.success(res.isMock ? 'Mock jobs refreshed!' : 'Jobs updated successfully!')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during fetch.')
      toast.error('Failed to fetch job matches.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle toggling platform selection card
  const handleTogglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      const next = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
      
      // If at least one platform is selected, trigger search filter
      if (next.length === 0) {
        toast.warning('Please select at least one job platform')
        return prev
      }
      return next
    })
  }



  // Get active query terms used for visual helper
  const getSearchQueryTerms = () => {
    if (!initialProfile) return 'None'
    const skills = initialProfile.skills?.slice(0, 3).join(', ') || 'React, TypeScript'
    const role = initialProfile.experience?.[0]?.title || 'Software Engineer'
    const loc = initialProfile.address || 'Remote'
    return `${skills} • ${role} • ${loc}`
  }

  // Filter display jobs based on selected platform cards
  const displayedJobs = jobs.filter(job => {
    return selectedPlatforms.includes(job.platform.toLowerCase())
  })

  // Filter display jobs based on active platform tab filter (client-side only!)
  const filteredJobs = displayedJobs.filter(job => {
    if (platformFilter === 'All') return true
    return job.platform.toLowerCase() === platformFilter.toLowerCase()
  })

  // Saved and applied counters for activity feed
  const savedCount = jobs.filter(j => j.saved_status).length
  const appliedCount = jobs.filter(j => j.applied_status).length

  // Generate activities based on actual user profile and database states
  const getActivities = () => {
    const activities = []
    
    if (initialProfile?.updated_at) {
      activities.push({
        id: 'profile-update',
        title: 'Profile sync complete',
        desc: 'Skills and experience synchronized with AI parser.',
        time: new Date(initialProfile.updated_at).toLocaleDateString(),
        type: 'profile'
      })
    }

    if (jobs.length > 0) {
      activities.push({
        id: 'jobs-fetch',
        title: 'Job database updated',
        desc: `Retrieved ${jobs.length} relevant matches tailored to your profile.`,
        time: 'Today',
        type: 'fetch'
      })
    }

    if (savedCount > 0) {
      activities.push({
        id: 'saved-count',
        title: `${savedCount} jobs saved`,
        desc: 'Reviewing matches for tailored resume creation.',
        time: 'Recent',
        type: 'save'
      })
    }

    if (appliedCount > 0) {
      activities.push({
        id: 'applied-count',
        title: `Applied to ${appliedCount} jobs`,
        desc: 'Tracking active pipeline status.',
        time: 'Recent',
        type: 'apply'
      })
    }

    // Default activity if list is short
    if (activities.length === 0) {
      activities.push({
        id: 'welcome-activity',
        title: 'Session initialized',
        desc: 'Welcome to AIJobBuddy! Setup your profile to get matches.',
        time: 'Just now',
        type: 'system'
      })
    }

    return activities
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-purple-900/10 blur-[90px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, {initialProfile?.full_name?.split(' ')[0] || 'Applicant'}!
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl font-normal leading-relaxed">
            AI JobBuddy scans platform indexes using your skills, experience, and location preferences to fetch optimized career matches.
          </p>
        </div>
        <button
          onClick={() => handleFetchJobs(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-500/10 transition-all duration-300 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <RefreshCw className={`h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing Match Index...' : 'Force Refresh Matches'}</span>
        </button>
      </div>

      {/* Warning Alert if running on Mock Data Fallback */}
      {isMock && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-amber-400/90 text-xs shadow-md">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-extrabold block text-white text-sm">Brave Search API Key Missing</span>
            <p className="leading-relaxed">
              The environment variable <code>BRAVE_API_KEY</code> is not set. We have generated high-quality job matches mock-tailored to your actual profile (skills and experience) so you can interactively test save, apply, and platform filtering features!
            </p>
          </div>
        </div>
      )}

      {/* Target Job Platforms Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Select Platforms</h3>
          <p className="text-zinc-500 text-xs">
            Toggle platforms to filter listings. Refreshing will search active platforms.
          </p>
        </div>
        
        <JobPlatformCards
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={handleTogglePlatform}
        />
      </div>

      {/* Main Grid: Job Feed + Sidebar */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Job Matches Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Top Job Matches
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {filteredJobs.length} Found
                </Badge>
              </h3>
              <p className="text-zinc-500 text-xs mt-1 font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-lg">
                Query: <span className="text-zinc-400">{getSearchQueryTerms()}</span>
              </p>
            </div>
            
            <div className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-900 px-3 py-1.5 rounded-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Caching active (6 hour duration)</span>
            </div>
          </div>

          {/* Search Form (Requirement 17) */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleFetchJobs(true)
            }} 
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search any job title (e.g. React Developer, Python Backend, UI Designer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:bg-zinc-950 transition-all text-xs font-semibold shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    // Refetch with empty search query to load default profile matches
                    setTimeout(() => handleFetchJobs(true), 0)
                  }}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || refreshing}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>

          {/* Frontend Filters: All, Greenhouse, Lever, Workable (Requirement 13/14/15) */}
          <div className="flex border-b border-zinc-900 pb-px gap-2">
            {(['All', 'Greenhouse', 'Lever', 'Workable'] as const).map((tab) => {
              const isActive = platformFilter === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPlatformFilter(tab)}
                  className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                    isActive 
                      ? 'text-purple-400 border-b-2 border-purple-500' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Job feed container */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-zinc-900 bg-zinc-950/20 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-zinc-900" />
                    <Skeleton className="h-4 w-16 bg-zinc-900" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-12 w-12 rounded-xl bg-zinc-900" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 bg-zinc-900" />
                      <Skeleton className="h-3 w-1/2 bg-zinc-900" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full bg-zinc-900" />
                  <div className="flex gap-2 justify-between">
                    <Skeleton className="h-8 w-24 bg-zinc-900" />
                    <Skeleton className="h-8 w-24 bg-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-12 rounded-2xl border border-red-500/10 bg-red-500/5 max-w-full flex flex-col items-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
              <h4 className="text-base font-bold text-white">Failed to query jobs</h4>
              <p className="text-zinc-500 text-xs max-w-md mt-2 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => handleFetchJobs(true)}
                className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/10 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 mb-4 shadow-lg shadow-purple-500/5">
                <Briefcase className="h-7 w-7" />
              </div>
              <h4 className="text-lg font-bold text-white">No matches available</h4>
              <p className="mt-2 text-xs text-zinc-500 max-w-sm leading-relaxed">
                We couldn't find matches on the selected platforms using your current profile. Update your profile settings or add skills to query wider pools.
              </p>
              <div className="flex gap-3 mt-6">
                <Link
                  href="/dashboard/profile"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 px-4 text-xs font-bold text-white transition-colors"
                >
                  Edit Profile Settings
                </Link>
                <button
                  onClick={() => handleFetchJobs(true)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 text-xs font-bold text-zinc-400 transition-colors"
                >
                  Force Search
                </button>
              </div>
            </div>
          ) : displayedJobs.length === 0 || filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/10 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 mb-4 border border-zinc-800 shadow-md">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">No matches found</h4>
              <p className="mt-2 text-xs text-zinc-500 max-w-sm leading-relaxed">
                No jobs match your active filters or search term "{searchQuery}". Try adjusting your platform selections or clearing the search.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setPlatformFilter('All')
                  setSelectedPlatforms(['greenhouse', 'lever', 'workable'])
                  // Refetch
                  setTimeout(() => handleFetchJobs(true), 0)
                }}
                className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 px-4 text-xs font-bold text-white transition-colors"
              >
                Reset Filters & Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSaveToggle={(id, saved) => {
                    // Update state locally when save status toggles
                    setJobs(prev => prev.map(j => j.id === id ? { ...j, saved_status: saved } : j))
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Completeness Card */}
          <Card className="border-zinc-900 bg-zinc-950/40 shadow-xl backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                Profile Completeness
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                A completed profile enables highly accurate job matches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Circular Gauge and Info Header */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-zinc-900/10 border border-zinc-900/60 shadow-inner">
                {/* SVG Progress Circle */}
                <div className="relative h-20 w-20 flex-shrink-0">
                  <svg className="h-full w-full transform -rotate-90 origin-center" viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r={32}
                      className="stroke-zinc-800/80"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="40"
                      cy="40"
                      r={32}
                      className={`transition-all duration-1000 ease-out ${
                        completenessScore >= 80 ? 'stroke-emerald-500' : completenessScore >= 50 ? 'stroke-amber-500' : 'stroke-purple-500'
                      }`}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 - (completenessScore / 100) * (2 * Math.PI * 32)}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Score Label inside Circle */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-white leading-none">
                      {completenessScore}%
                    </span>
                    <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
                      score
                    </span>
                  </div>
                </div>

                {/* Subtitle details */}
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    completenessScore >= 80 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : completenessScore >= 50 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {completenessScore >= 80 ? 'Optimized' : completenessScore >= 50 ? 'In Progress' : 'Action Required'}
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-400 mt-2">
                    {completenessScore === 100 
                      ? 'Profile fully complete!' 
                      : `${missingFields.length} action items`}
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Complete your profile to unlock highly targeted 90%+ job matches.
                  </p>
                </div>
              </div>

              {missingFields.length > 0 ? (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Next Actions:</h5>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {missingFields.map((field) => (
                      <Link
                        key={field.field}
                        href="/dashboard/profile"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-900/80 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 text-xs font-semibold text-zinc-300 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-dashed border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:border-purple-400 group-hover:bg-purple-500/10 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/30 group-hover:bg-purple-400 transition-colors" />
                          </span>
                          <span className="group-hover:text-purple-300 transition-colors font-medium">Add {field.name}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600">
                          +{field.bonus}%
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs leading-relaxed font-medium">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span>Congratulations! Your profile is 100% complete and fully optimized.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-zinc-900 bg-zinc-950/40 shadow-xl backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                History of job matching events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flow-root">
                <ul className="relative border-l border-zinc-800 space-y-5 ml-1 pl-4">
                  {getActivities().map((activity) => (
                    <li key={activity.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 flex h-2 w-2 rounded-full bg-purple-500 ring-4 ring-zinc-950" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-white leading-none block">
                          {activity.title}
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          {activity.desc}
                        </p>
                        <span className="text-[10px] text-zinc-600 font-medium block">
                          {activity.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
