'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveProfile, saveResumeRecord } from '@/app/actions/profile'
import { Profile } from '@/lib/types'
import { toast } from 'sonner'

interface OnboardingModalProps {
  initialIsOnboarded: boolean
}

type OnboardingState = 'idle' | 'uploading' | 'parsing' | 'saving' | 'success' | 'error'

export function OnboardingModal({ initialIsOnboarded }: OnboardingModalProps) {
  const [isOnboarded, setIsOnboarded] = useState(initialIsOnboarded)
  const [state, setState] = useState<OnboardingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  if (isOnboarded) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported currently.')
      return
    }

    setFileName(file.name)
    setState('uploading')
    setErrorMessage('')

    try {
      const supabase = createClient()
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication error. Please log in again.')
      }

      // 1. Upload to Supabase Storage resumes bucket
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Failed to upload file to storage: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

      // 2. Parse the uploaded resume via API
      setState('parsing')
      const formData = new FormData()
      formData.append('file', file)

      const parseResponse = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        throw new Error(errorData.error || 'Failed to parse resume details.')
      }

      const parsedData = (await parseResponse.json()) as Profile

      // 3. Extract details and save to database
      setState('saving')
      
      // Save Profile Data
      const profileResult = await saveProfile({
        full_name: parsedData.full_name || user.email?.split('@')[0] || 'New User',
        phone: parsedData.phone || '',
        website: parsedData.website || '',
        github: parsedData.github || '',
        linkedin: parsedData.linkedin || '',
        summary: parsedData.summary || '',
        skills: parsedData.skills || [],
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || [],
        other_details: parsedData.other_details || '',
      })

      if (profileResult.error) {
        throw new Error(`Failed to save candidate profile: ${profileResult.error}`)
      }

      // Save Resume Record
      const resumeResult = await saveResumeRecord(file.name, publicUrl, parsedData)
      if (resumeResult.error) {
        throw new Error(`Failed to log resume details: ${resumeResult.error}`)
      }

      setState('success')
      toast.success('Resume parsed and profile populated successfully!')
      
      // Delay closing modal briefly for visual feedback
      setTimeout(() => {
        setIsOnboarded(true)
        router.refresh()
      }, 1500)

    } catch (err: any) {
      console.error(err)
      setState('error')
      setErrorMessage(err.message || 'An unexpected error occurred.')
      toast.error(err.message || 'Onboarding failed.')
    }
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl space-y-6 text-zinc-100 relative overflow-hidden">
        {/* Subtle purple radial glow */}
        <div className="absolute top-[-40%] left-[-20%] h-[250px] w-[250px] rounded-full bg-purple-500/10 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-40%] right-[-20%] h-[250px] w-[250px] rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />

        <div className="space-y-2 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Welcome to AIJobBuddy!
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Let's get your profile set up. Upload your master resume, and our AI will automatically structure your experience and populate your candidate dashboard.
          </p>
        </div>

        <div className="relative z-10">
          {state === 'idle' && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 min-h-[220px] ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 text-zinc-400 group-hover:text-purple-400 transition-colors shadow-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <p className="mt-4 text-sm font-semibold text-zinc-200">
                Drag and drop your resume file here
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Supports PDF format (Max 10MB)
              </p>
              <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-lg transition-all shadow-md shadow-purple-900/20 active:scale-95">
                Browse Files
              </button>
            </div>
          )}

          {state !== 'idle' && state !== 'error' && (
            <div className="flex flex-col items-center justify-center border border-zinc-800 bg-zinc-950/40 rounded-xl p-8 min-h-[220px] space-y-4">
              {state !== 'success' ? (
                <div className="relative flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <div className="absolute h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center text-xs text-purple-400 font-bold border border-zinc-800">
                    AI
                  </div>
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 animate-bounce">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-zinc-200">
                  {state === 'uploading' && 'Uploading resume to Supabase Storage...'}
                  {state === 'parsing' && 'AI extracting and structuring details...'}
                  {state === 'saving' && 'Saving candidate profile to database...'}
                  {state === 'success' && 'Setup Completed!'}
                </p>
                <p className="text-xs text-zinc-500 truncate max-w-xs mx-auto">
                  {fileName}
                </p>
              </div>

              {state !== 'success' && (
                <div className="w-full max-w-xs bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                    style={{
                      width: state === 'uploading' ? '30%' : state === 'parsing' ? '70%' : '90%'
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center justify-center border border-rose-950/20 bg-rose-950/5 rounded-xl p-8 min-h-[220px] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-rose-400">
                  Failed to parse resume
                </p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <button 
                onClick={() => setState('idle')}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 rounded-lg transition-all active:scale-95"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-xs text-zinc-500 relative z-10">
          <span>AI-Powered Onboarding</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            Connected to Supabase
          </span>
        </div>
      </div>
    </div>
  )
}
