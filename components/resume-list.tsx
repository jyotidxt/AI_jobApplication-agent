'use client'

import { useState } from 'react'
import { Resume } from '@/lib/types'
import { deleteResume, saveResumeRecord, saveProfile } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ResumeListProps {
  initialResumes: Resume[]
}

export function ResumeList({ initialResumes }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.')
      return
    }

    setIsUploading(true)
    setUploadProgress('Uploading to storage...')

    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Not authenticated. Please log in.')
      }

      // 1. Upload to storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

      // 2. Parse details
      setUploadProgress('AI parsing resume...')
      const formData = new FormData()
      formData.append('file', file)

      const parseResponse = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        throw new Error(errorData.error || 'Failed to parse resume.')
      }

      const parsedData = await parseResponse.json()

      // 3. Save profile & resume record
      setUploadProgress('Saving details...')
      
      // Update profile
      await saveProfile({
        full_name: parsedData.full_name || user.email?.split('@')[0] || 'User',
        email: parsedData.email || user.email || '',
        phone: parsedData.phone || '',
        address: parsedData.address || '',
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

      const resumeResult = await saveResumeRecord(file.name, publicUrl, parsedData)
      
      if (resumeResult.error) {
        throw new Error(resumeResult.error)
      }

      if (resumeResult.resume) {
        setResumes([resumeResult.resume, ...resumes])
      }

      toast.success('Resume uploaded and profile updated successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to process resume.')
    } finally {
      setIsUploading(false)
      setUploadProgress('')
      // Clear input
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    const promise = deleteResume(id)

    toast.promise(promise, {
      loading: 'Deleting resume...',
      success: () => {
        setResumes(resumes.filter(r => r.id !== id))
        return 'Resume deleted.'
      },
      error: (err) => err.message || 'Failed to delete resume.'
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-50%] right-[-10%] h-[200px] w-[200px] rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h3 className="text-lg font-bold text-white">Upload New Resume</h3>
          <p className="text-xs text-zinc-500 max-w-md">
            Upload another version of your resume. AI JobBuddy will auto-parse the details and update your current profile settings.
          </p>
        </div>

        <div className="relative z-10">
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <label
            htmlFor="resume-upload"
            className={`inline-flex h-11 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white px-5 cursor-pointer transition-all shadow-lg shadow-purple-900/20 active:scale-95 ${
              isUploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {uploadProgress}
              </span>
            ) : (
              'Upload Resume (PDF)'
            )}
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 shadow-xl backdrop-blur-xl space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-zinc-900 pb-3 flex items-center gap-2">
          <span className="h-4 w-1 bg-indigo-500 rounded" />
          Your Resumes
        </h3>

        {resumes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 mb-3 border border-zinc-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-400">No resumes uploaded yet</p>
            <p className="text-xs text-zinc-600 mt-1">Upload a resume above to start tracking your details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">File Name</th>
                  <th className="pb-3">Uploaded On</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-sm">
                {resumes.map((resume) => (
                  <tr key={resume.id} className="group hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 pl-2 font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate max-w-[240px] md:max-w-md" title={resume.file_name}>
                          {resume.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-zinc-400">
                      {formatDate(resume.created_at)}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="inline-flex gap-2">
                        <a
                          href={resume.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950 text-zinc-400 hover:text-white rounded-lg transition-colors"
                          title="View / Download PDF"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-rose-900/60 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Resume"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
