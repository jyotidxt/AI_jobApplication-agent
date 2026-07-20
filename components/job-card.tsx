'use client'

import React, { useState } from 'react'
import { DbJob, toggleSaveJob } from '@/app/actions/jobs'
import { startAutoApply, setManualApplied } from '@/app/actions/automation'
import { MapPin, DollarSign, Calendar, Briefcase, Bookmark, ExternalLink, Sparkles, AlertCircle, CheckCircle2, Loader2, HelpCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface JobCardProps {
  job: DbJob
  onSaveToggle?: (jobId: string, isSaved: boolean) => void
}

export function JobCard({ job, onSaveToggle }: JobCardProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(job.saved_status)
  
  // Application automation states
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [appStatus, setAppStatus] = useState<string>(job.application_status || 'Saved')
  const [missingFields, setMissingFields] = useState<string[]>(job.missing_fields || [])
  const [sessId, setSessId] = useState<string | null>(job.browserbase_session_id || null)

  // Extract first letter of company name for the fallback avatar logo
  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'J'

  // Generate a consistent pastel gradient background color based on company name
  const getAvatarBgColor = (name: string) => {
    const colors = [
      'from-pink-500/20 to-rose-500/20 text-rose-400 border-rose-500/30',
      'from-purple-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'from-teal-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'from-orange-500/20 to-amber-500/20 text-amber-400 border-amber-500/30'
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Get platform specific badge styling
  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'greenhouse':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'lever':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'workable':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  // Determine progress bar and match text color based on match_score
  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getMatchProgressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500'
    if (score >= 70) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  // Toggle job saved state
  const handleSaveToggle = async () => {
    setIsSaving(true)
    const newSavedState = !saved
    
    try {
      const res = await toggleSaveJob(job.id, newSavedState)
      if (res.success) {
        setSaved(newSavedState)
        toast.success(newSavedState ? 'Job saved successfully!' : 'Job removed from saved list')
        if (onSaveToggle) {
          onSaveToggle(job.id, newSavedState)
        }
      } else {
        toast.error(res.error || 'Failed to update job status')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Action Handlers
  const handleApplyManually = async () => {
    setIsApplyDialogOpen(false)
    // Open URL in new window
    window.open(job.job_url, '_blank', 'noopener,noreferrer')
    
    try {
      const res = await setManualApplied(job.id)
      if (res.success) {
        setAppStatus('Applied')
        toast.success('Job marked as Applied manually!')
      }
    } catch (err) {
      console.error('Failed to set manual apply status:', err)
    }
  }

  const handleApplyAutomatically = async () => {
    setIsApplyDialogOpen(false)
    setIsApplying(true)
    setAppStatus('Checking Profile')
    setMissingFields([])
    
    try {
      const res = await startAutoApply(job.id)
      if (res.success) {
        toast.success('AI automation agent started! Redirecting to tracking pipeline...')
        router.push('/dashboard/applications')
      } else {
        setAppStatus(job.application_status || 'Saved')
        toast.error(res.error || 'Failed to launch AI automation.')
      }
    } catch (err: any) {
      setAppStatus(job.application_status || 'Saved')
      toast.error('An unexpected error occurred: ' + err.message)
    } finally {
      setIsApplying(false)
    }
  }

  const getStatusBadge = () => {
    switch (appStatus) {
      case 'Checking Profile':
        return (
          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse text-[10px] uppercase font-extrabold tracking-wider">
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            AI Checking Profile
          </Badge>
        )
      case 'Missing Profile Info':
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] uppercase font-extrabold tracking-wider">
            <AlertCircle className="h-3 w-3 mr-1.5" />
            Profile Incomplete
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
            AI Applying
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
            AI Apply Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="group rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/10 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Sparkle background element for high match score */}
      {job.match_score >= 88 && (
        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-purple-500/5 blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-300" />
      )}

      <div>
        {/* Header - Platform & Match Score & Status */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Badge className={`text-[10px] font-bold px-2.5 py-1 border uppercase tracking-wider bg-zinc-900 hover:bg-zinc-900 flex items-center gap-1.5 ${getPlatformStyle(job.platform)}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                job.platform.toLowerCase() === 'greenhouse'
                  ? '/platform/greenhouse.jpeg'
                  : job.platform.toLowerCase() === 'workable'
                  ? '/platform/workable.png'
                  : '/platform/lever.png'
              }
              alt={`${job.platform} logo`}
              className="h-3.5 w-3.5 rounded-sm object-contain bg-white/10"
            />
            <span>{job.platform}</span>
          </Badge>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                <span className={`text-xs font-extrabold tracking-tight ${getMatchScoreColor(job.match_score)}`}>
                  {job.match_score}% Match
                </span>
              </div>
              <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getMatchProgressColor(job.match_score)}`}
                  style={{ width: `${job.match_score}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Logo & Job Title */}
        <div className="flex gap-4 items-start mb-4">
          {job.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company_logo}
              alt={`${job.company} logo`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
              className="h-12 w-12 rounded-xl object-contain border border-zinc-800 bg-zinc-900/60 p-1 flex-shrink-0 shadow-inner"
            />
          ) : null}
          
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg border flex-shrink-0 shadow-inner bg-gradient-to-br ${getAvatarBgColor(job.company)}`}>
            {companyInitial}
          </div>

          <div className="space-y-0.5">
            <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-purple-400 transition-colors duration-200">
              {job.title}
            </h3>
            <p className="text-sm font-semibold text-zinc-400">
              {job.company}
            </p>
          </div>
        </div>

        {/* Description Snippet */}
        {job.description && (
          <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-3 font-normal">
            {job.description}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-[11px] text-zinc-400 font-medium">
          {job.location && (
            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              <span>{job.location}</span>
            </div>
          )}

          {job.job_type && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              <span>{job.job_type}</span>
            </div>
          )}

          {job.salary && (
            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <DollarSign className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              <span>{job.salary}</span>
            </div>
          )}

          {job.experience_level && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              <span>{job.experience_level}</span>
            </div>
          )}
        </div>

        {/* Tags Badges */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded-md hover:text-white hover:border-zinc-700 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Live status actions section (Missing profile fields warning or session viewer) */}
        {appStatus === 'Missing Profile Info' && (
          <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 font-semibold space-y-1.5">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
              <span>Missing Required Profile Fields:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {missingFields.map((f, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-900 text-rose-300">
                  {f.replace('_', ' ')}
                </span>
              ))}
            </div>
            <Link
              href={`/dashboard/profile?missingJobId=${job.id}`}
              className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 underline pt-1"
            >
              <span>Go to Profile to complete these fields</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {sessId && (
          <div className="mb-4 text-[10px] text-zinc-500 font-medium">
            <span>Browserbase Session: </span>
            {sessId.startsWith('mock') ? (
              <span className="text-zinc-400 font-mono italic">{sessId} (mock)</span>
            ) : (
              <a
                href={`https://www.browserbase.com/sessions/${sessId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline font-mono"
              >
                {sessId.substring(0, 12)}... [Debug Session ↗]
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-900/60">
        <button
          onClick={handleSaveToggle}
          disabled={isSaving}
          className={`h-9 px-3 rounded-lg border flex items-center justify-center transition-all duration-300 ${
            saved
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 hover:bg-purple-500/20'
              : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-transparent'
          } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
          title={saved ? 'Remove saved job' : 'Save job'}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-purple-400 text-purple-400' : ''}`} />
        </button>

        <button
          onClick={() => setIsApplyDialogOpen(true)}
          disabled={isApplying || appStatus === 'Applying'}
          className="flex-1 h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 hover:bg-purple-500/5 text-zinc-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300"
        >
          <span>{appStatus === 'Applied' ? 'Applied' : 'Apply Now'}</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Apply Options Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="border border-zinc-800 bg-zinc-950/90 text-zinc-200 shadow-2xl backdrop-blur-xl sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white">Apply to {job.title}</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Apply to <strong>{job.company}</strong> ({job.platform}) using one of the following methods:
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Option 1: Apply Manually */}
            <button
              onClick={handleApplyManually}
              className="flex items-start gap-4 p-4 rounded-xl border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 transition-all duration-300 text-left group"
            >
              <div className="mt-1 h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 border border-zinc-800 group-hover:border-purple-500/40 group-hover:text-purple-400 transition-all duration-300">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Apply Manually</h4>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  We will open the job board application page in a new browser tab so you can fill it out manually.
                </p>
              </div>
            </button>

            {/* Option 2: Apply Automatically */}
            <button
              onClick={handleApplyAutomatically}
              className="flex items-start gap-4 p-4 rounded-xl border border-purple-950/20 hover:border-purple-500/40 bg-purple-950/10 hover:bg-purple-950/20 transition-all duration-300 text-left group"
            >
              <div className="mt-1 h-8 w-8 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400 border border-purple-900/50 group-hover:border-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Sparkles className="h-4 w-4 fill-purple-400 group-hover:fill-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">Apply Automatically using AI</h4>
                <p className="text-purple-400/70 text-[11px] leading-relaxed">
                  Our background AI Agent will launch a Browserbase session, scan the form, validate your profile data, and automatically apply.
                </p>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsApplyDialogOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900 text-xs font-semibold"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
