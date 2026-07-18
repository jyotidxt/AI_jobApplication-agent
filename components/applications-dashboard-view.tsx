'use client'

import React, { useState } from 'react'
import { DbJob } from '@/app/actions/jobs'
import { retryAutoApply, setManualApplied } from '@/app/actions/automation'
import { 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Activity, 
  ArrowRight,
  TrendingUp,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ApplicationsDashboardViewProps {
  initialJobs: DbJob[]
  userId: string
}

export function ApplicationsDashboardView({ initialJobs, userId }: ApplicationsDashboardViewProps) {
  const [jobs, setJobs] = useState<DbJob[]>(initialJobs)
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null)
  const router = useRouter()

  // Filter jobs that are in the application pipeline (status !== 'Saved' or applied_status is true)
  const activeApplications = jobs.filter(j => j.application_status !== 'Saved' || j.applied_status)

  // Compute metrics
  const totalCount = activeApplications.length
  const checkingCount = activeApplications.filter(j => j.application_status === 'Checking Profile' || j.application_status === 'Checking').length
  const missingInfoCount = activeApplications.filter(j => j.application_status === 'Missing Profile Info').length
  const applyingCount = activeApplications.filter(j => j.application_status === 'Applying').length
  const appliedCount = activeApplications.filter(j => j.application_status === 'Applied').length
  const failedCount = activeApplications.filter(j => j.application_status === 'Failed').length

  const handleRetryApply = async (jobId: string) => {
    setLoadingJobId(jobId)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, application_status: 'Checking Profile', missing_fields: [], required_fields: [] } : j))
    try {
      const res = await retryAutoApply(jobId)
      if (res.success) {
        toast.success('AI Apply process retried and queued!')
      } else {
        toast.error(res.error || 'Failed to retry apply.')
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred: ' + err.message)
    } finally {
      setLoadingJobId(null)
      router.refresh()
    }
  }

  const handleManualApply = async (jobId: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, application_status: 'Applied', applied_status: true } : j))
    try {
      const res = await setManualApplied(jobId)
      if (res.success) {
        toast.success('Job marked as Applied manually!')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Checking Profile':
      case 'Checking':
        return (
          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse text-[10px] uppercase font-extrabold tracking-wider">
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            Scanning Form
          </Badge>
        )
      case 'Missing Profile Info':
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] uppercase font-extrabold tracking-wider">
            <AlertCircle className="h-3 w-3 mr-1.5" />
            Missing Info
          </Badge>
        )
      case 'Ready to Apply':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-extrabold tracking-wider">
            Ready to Apply
          </Badge>
        )
      case 'Applying':
        return (
          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse text-[10px] uppercase font-extrabold tracking-wider">
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            Applying...
          </Badge>
        )
      case 'Applied':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-extrabold tracking-wider">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Applied
          </Badge>
        )
      case 'Failed':
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] uppercase font-extrabold tracking-wider">
            <XCircle className="h-3 w-3 mr-1.5" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] uppercase font-extrabold tracking-wider">
            {status}
          </Badge>
        )
    }
  }

  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'greenhouse':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'lever':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
      case 'workable':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Application Pipeline</h2>
          <p className="text-zinc-400 text-sm">
            Track and log stages of your active applications (checking profile, applying, and completed submissions).
          </p>
        </div>
        <Button 
          onClick={() => router.refresh()} 
          className="self-start inline-flex items-center gap-1.5 h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Statuses
        </Button>
      </div>

      {totalCount === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[380px] shadow-xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 p-0.5 shadow-lg shadow-emerald-500/5">
            <Briefcase className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">Application Pipeline</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm leading-relaxed">
            No applications have entered the tracking pipeline yet. Go to your Job Matcher and select "Apply" on a saved job to start the automation.
          </p>
          <Link href="/dashboard/jobs">
            <Button className="mt-6 h-10 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-5 shadow-lg shadow-purple-500/10">
              Browse Matching Jobs
            </Button>
          </Link>
        </div>
      ) : (
        /* Pipeline Content */
        <div className="space-y-6">
          {/* Metrics Panel */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-xl backdrop-blur-xl">
              <CardContent className="p-4 flex flex-col justify-between h-24">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Total Applications</span>
                <span className="text-3xl font-black text-white">{totalCount}</span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950/40 border-zinc-900 shadow-xl backdrop-blur-xl">
              <CardContent className="p-4 flex flex-col justify-between h-24">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Scanning / Checking</span>
                <span className="text-3xl font-black text-purple-400 flex items-center gap-1.5">
                  {checkingCount + applyingCount}
                  {(checkingCount + applyingCount > 0) && <Loader2 className="h-5 w-5 animate-spin text-purple-400" />}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950/40 border-zinc-900 shadow-xl backdrop-blur-xl">
              <CardContent className="p-4 flex flex-col justify-between h-24">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Action Required</span>
                <span className={`text-3xl font-black ${missingInfoCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>{missingInfoCount}</span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950/40 border-zinc-900 shadow-xl backdrop-blur-xl">
              <CardContent className="p-4 flex flex-col justify-between h-24">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Applied Successfully</span>
                <span className="text-3xl font-black text-emerald-400">{appliedCount}</span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950/40 border-zinc-900 shadow-xl backdrop-blur-xl">
              <CardContent className="p-4 flex flex-col justify-between h-24">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Failed / Errors</span>
                <span className={`text-3xl font-black ${failedCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>{failedCount}</span>
              </CardContent>
            </Card>
          </div>

          {/* Active Applications List */}
          <div className="space-y-4">
            {activeApplications.map((app) => (
              <Card key={app.id} className="bg-zinc-950/30 border-zinc-900/80 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  
                  {/* Left Column: Job info & Platform */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-white text-base leading-snug group-hover:text-purple-400 transition-colors">
                        {app.title}
                      </h4>
                      <span className="text-zinc-500">•</span>
                      <span className="text-sm font-semibold text-zinc-400">{app.company}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <Badge className={`text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wider bg-transparent ${getPlatformStyle(app.platform)}`}>
                        {app.platform}
                      </Badge>
                      {app.location && <span>{app.location}</span>}
                      {app.job_type && <span>• {app.job_type}</span>}
                      <span>• Match: <strong className="text-purple-400">{app.match_score}%</strong></span>
                    </div>
                  </div>

                  {/* Middle Column: Current application status info */}
                  <div className="flex flex-col gap-1.5 lg:items-end justify-center min-w-[150px]">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.application_status || 'Saved')}
                    </div>
                    {app.browserbase_session_id && (
                      <div className="text-[10px] text-zinc-500">
                        {app.browserbase_session_id.startsWith('mock') ? (
                          <span>Session: <span className="font-mono text-zinc-400">{app.browserbase_session_id} (mock)</span></span>
                        ) : (
                          <span>
                            Session:{' '}
                            <a
                              href={`https://www.browserbase.com/sessions/${app.browserbase_session_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 underline font-mono font-bold"
                            >
                              {app.browserbase_session_id.substring(0, 8)}... [↗]
                            </a>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                    {app.application_status === 'Missing Profile Info' && (
                      <Link href={`/dashboard/profile?missingJobId=${app.id}`}>
                        <Button className="h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 flex items-center gap-1">
                          Complete Profile
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}

                    {(app.application_status === 'Failed' || app.application_status === 'Missing Profile Info') && (
                      <Button
                        onClick={() => handleRetryApply(app.id)}
                        disabled={loadingJobId === app.id}
                        className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs px-4"
                      >
                        {loadingJobId === app.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : 'Retry Auto Apply'}
                      </Button>
                    )}

                    {app.application_status === 'Ready to Apply' && (
                      <Button
                        onClick={() => handleRetryApply(app.id)}
                        disabled={loadingJobId === app.id}
                        className="h-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4"
                      >
                        {loadingJobId === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : 'Submit Application'}
                      </Button>
                    )}

                    <Button
                      onClick={() => handleManualApply(app.id, app.job_url)}
                      variant="outline"
                      className="h-9 rounded-lg border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold text-xs px-4 flex items-center gap-1.5 bg-transparent"
                    >
                      <span>Apply Manually</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>

                </CardContent>

                {/* Sub-card warning panel for missing fields */}
                {app.application_status === 'Missing Profile Info' && app.missing_fields && app.missing_fields.length > 0 && (
                  <div className="border-t border-rose-950/30 bg-rose-500/5 px-5 py-3 text-xs text-rose-300 font-semibold flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                      <span>The AI agent requires additional details to proceed:</span>
                      <div className="flex flex-wrap gap-1 ml-2">
                        {app.missing_fields.map((f: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-rose-950/40 border-rose-900 text-rose-400 text-[9px] px-1.5 py-0">
                            {f.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
