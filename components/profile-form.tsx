'use client'

import { useState, useEffect } from 'react'
import { Profile, WorkExperience, Education, Project } from '@/lib/types'
import { saveProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ProfileFormProps {
  initialProfile: Profile | null
  missingFields?: string[]
  missingJobInfo?: { company: string; title: string } | null
}

type TabType = 'personal' | 'experience' | 'education' | 'projects' | 'skills'

export function ProfileForm({ initialProfile, missingFields = [], missingJobInfo = null }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('personal')

  // Helper functions for highlighting missing fields
  const getTabForField = (field: string): TabType => {
    switch (field) {
      case 'full_name':
      case 'email':
      case 'phone':
      case 'address':
      case 'website':
      case 'github':
      case 'linkedin':
      case 'summary':
        return 'personal'
      case 'experience':
        return 'experience'
      case 'education':
        return 'education'
      case 'projects':
        return 'projects'
      case 'skills':
        return 'skills'
      default:
        return 'personal'
    }
  }

  const isFieldMissing = (field: string) => missingFields.includes(field)
  const isTabMissing = (tab: TabType) => missingFields.some(f => getTabForField(f) === tab)

  // Auto-switch to the tab that has the first missing field
  useEffect(() => {
    if (missingFields.length > 0) {
      const tab = getTabForField(missingFields[0])
      setActiveTab(tab)
    }
  }, [missingFields])

  // Personal Info State
  const [fullName, setFullName] = useState(initialProfile?.full_name || '')
  const [email, setEmail] = useState(initialProfile?.email || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
  const [address, setAddress] = useState(initialProfile?.address || '')
  const [website, setWebsite] = useState(initialProfile?.website || '')
  const [github, setGithub] = useState(initialProfile?.github || '')
  const [linkedin, setLinkedin] = useState(initialProfile?.linkedin || '')
  const [summary, setSummary] = useState(initialProfile?.summary || '')
  
  // Skills & Certifications State
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || [])
  const [certInput, setCertInput] = useState('')
  const [certifications, setCertifications] = useState<string[]>(initialProfile?.certifications || [])

  // Experience State
  const [experience, setExperience] = useState<WorkExperience[]>(initialProfile?.experience || [])
  // Education State
  const [education, setEducation] = useState<Education[]>(initialProfile?.education || [])
  // Projects State
  const [projects, setProjects] = useState<Project[]>(initialProfile?.projects || [])
  
  // Other details State
  const [otherDetails, setOtherDetails] = useState(initialProfile?.other_details || '')

  // --- Skills Handlers ---
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  // --- Certifications Handlers ---
  const handleAddCert = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && certInput.trim()) {
      e.preventDefault()
      if (!certifications.includes(certInput.trim())) {
        setCertifications([...certifications, certInput.trim()])
      }
      setCertInput('')
    }
  }

  const handleRemoveCert = (certToRemove: string) => {
    setCertifications(certifications.filter(c => c !== certToRemove))
  }

  // --- Experience Handlers ---
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { title: '', company: '', duration: '', responsibilities: [''] }
    ])
  }

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...experience]
    updated[index] = { ...updated[index], [field]: value }
    setExperience(updated)
  }

  const handleAddResponsibility = (expIndex: number) => {
    const updated = [...experience]
    updated[expIndex].responsibilities.push('')
    setExperience(updated)
  }

  const handleRemoveResponsibility = (expIndex: number, respIndex: number) => {
    const updated = [...experience]
    updated[expIndex].responsibilities = updated[expIndex].responsibilities.filter((_, i) => i !== respIndex)
    setExperience(updated)
  }

  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    const updated = [...experience]
    updated[expIndex].responsibilities[respIndex] = value
    setExperience(updated)
  }

  // --- Education Handlers ---
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: '', school: '', duration: '', details: '' }
    ])
  }

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    setEducation(updated)
  }

  // --- Projects Handlers ---
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { name: '', description: '', link: '' }
    ])
  }

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  const handleProjectChange = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects]
    updated[index] = { ...updated[index], [field]: value }
    setProjects(updated)
  }

  // --- Completeness Calculation ---
  const calculateCompleteness = () => {
    let score = 0
    if (fullName.trim()) score += 10
    if (email.trim()) score += 10
    if (phone.trim()) score += 10
    if (address.trim()) score += 10
    if (website.trim() || github.trim() || linkedin.trim()) score += 10
    if (summary.trim()) score += 10
    if (skills.length > 0) score += 10
    if (experience.length > 0) score += 20
    if (education.length > 0) score += 10
    return score
  }

  const getCompletenessLevel = (score: number) => {
    if (score < 40) return { label: 'Needs Detail', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    if (score < 80) return { label: 'Good Progress', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
    return { label: 'Profile Ready', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  }

  const getNextTip = () => {
    if (!fullName.trim()) return 'Add your Full Name'
    if (!email.trim()) return 'Add your Contact Email'
    if (!phone.trim()) return 'Add your Contact Phone'
    if (!address.trim()) return 'Add your Address / Location'
    if (!summary.trim()) return 'Add your Professional Summary'
    if (skills.length === 0) return 'Add at least one Skill tag'
    if (experience.length === 0) return 'Add a Work Experience entry'
    if (education.length === 0) return 'Add an Education degree entry'
    if (!website.trim() && !github.trim() && !linkedin.trim()) return 'Add your Portfolio or LinkedIn URL'
    return 'Your profile is highly complete! 🚀'
  }

  // --- Save Profile Handler ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await saveProfile({
        full_name: fullName,
        email,
        phone,
        address,
        website,
        github,
        linkedin,
        summary,
        skills,
        experience,
        education,
        projects,
        certifications,
        other_details: otherDetails,
      })

      if (result.error) {
        toast.error(`Error saving profile: ${result.error}`)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSaving(false)
    }
  }

  const score = calculateCompleteness()
  const status = getCompletenessLevel(score)
  const nextTip = getNextTip()

  // Circular progress ring parameters
  const radius = 38
  const stroke = 6
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="space-y-6 pb-12">

      {/* Warning alert banner for missing application fields */}
      {missingFields.length > 0 && missingJobInfo && (
        <div className="p-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 text-xs text-rose-300 font-semibold flex gap-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <h4 className="font-extrabold text-white text-sm">Action Required: Missing Application Profile Details</h4>
            <p className="text-zinc-400 leading-normal font-medium">
              Our AI agent scanned the form for <strong>{missingJobInfo.title}</strong> at <strong>{missingJobInfo.company}</strong> and requires the following missing fields to automatically apply. Please complete them and hit save below:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingFields.map((f, i) => (
                <Badge key={i} variant="outline" className="bg-rose-950/40 border-rose-900 text-rose-300 uppercase text-[9px] font-bold px-2.5 py-0.5">
                  {f.replace('_', ' ')}
                </Badge>
              ))}
              {missingFields.includes('resume') && (
                <Link href="/dashboard/resume" className="text-purple-400 hover:text-purple-300 underline font-bold uppercase text-[9px] px-2 py-0.5 ml-1">
                  Upload Resume Manager ↗
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL TAB MENU BAR (Professional top-tab UI) */}
      <div className="border-b border-zinc-900 pb-px">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none gap-2 md:gap-6">
          {/* 1. Personal Info Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer flex-shrink-0 focus:outline-none ${
              activeTab === 'personal'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Personal Info</span>
            {isTabMissing('personal') && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 absolute top-2 right-1 animate-pulse" />
            )}
          </button>

          {/* 2. Experience Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer flex-shrink-0 focus:outline-none ${
              activeTab === 'experience'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Experience</span>
            {isTabMissing('experience') && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 absolute top-2 right-1 animate-pulse" />
            )}
          </button>

          {/* 3. Education Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer flex-shrink-0 focus:outline-none ${
              activeTab === 'education'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
            </svg>
            <span>Education</span>
            {isTabMissing('education') && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 absolute top-2 right-1 animate-pulse" />
            )}
          </button>

          {/* 4. Projects Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer flex-shrink-0 focus:outline-none ${
              activeTab === 'projects'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Projects</span>
            {isTabMissing('projects') && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 absolute top-2 right-1 animate-pulse" />
            )}
          </button>

          {/* 5. Skills & Certs Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all relative border-b-2 cursor-pointer flex-shrink-0 focus:outline-none ${
              activeTab === 'skills'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>Skills & Certs</span>
            {isTabMissing('skills') && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 absolute top-2 right-1 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* COMPLETENESS CARD (order-1 makes it render first on mobile; lg:order-2 pins it to the right on desktops) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 order-1 lg:order-2">
          
          {/* Profile Completeness Circular Card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h4 className="text-sm font-extrabold tracking-wide uppercase text-zinc-400">Profile Status</h4>
              <span className={`px-2 py-0.5 rounded text-xxs font-extrabold border ${status.color} uppercase`}>
                {status.label}
              </span>
            </div>

            <div className="flex items-center gap-5">
              {/* SVG Circular Ring */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                  <circle
                    stroke="rgba(39, 39, 42, 0.4)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="#a855f7"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute text-sm font-black text-white">{score}%</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-400 leading-tight">Completeness Score</p>
                <p className="text-xl font-black text-white">{score}/100</p>
              </div>
            </div>

            {/* Quick Tip Bar */}
            <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded-xl">
              <span className="text-xxs font-bold text-purple-400 uppercase tracking-widest block mb-0.5">Next Tip</span>
              <p className="text-xs text-zinc-300 font-medium">{nextTip}</p>
            </div>
          </div>
        </div>

        {/* ACTIVE TAB PANEL FORM (order-2 on mobile, lg:order-1 on desktop) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          
          {/* PANEL 1: Personal Info */}
          {activeTab === 'personal' && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('full_name')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                  {isFieldMissing('full_name') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('email')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. jane.doe@example.com"
                    required
                  />
                  {isFieldMissing('email') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('phone')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. +1 555 123 4567"
                  />
                  {isFieldMissing('phone') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address / Location</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('address')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. San Francisco, CA"
                  />
                  {isFieldMissing('address') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Personal Website / Portfolio</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('website')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. https://janedoe.dev"
                  />
                  {isFieldMissing('website') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">GitHub Link</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('github')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. https://github.com/janedoe"
                  />
                  {isFieldMissing('github') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className={`w-full h-10 px-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors ${
                      isFieldMissing('linkedin')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="e.g. https://linkedin.com/in/janedoe"
                  />
                  {isFieldMissing('linkedin') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Professional Summary</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={6}
                    className={`w-full p-3 bg-zinc-950 border rounded-lg text-sm text-zinc-100 placeholder-zinc-655 focus:outline-none transition-colors resize-y ${
                      isFieldMissing('summary')
                        ? 'border-rose-500/80 focus:border-rose-500 shadow-sm shadow-rose-500/10'
                        : 'border-zinc-800 focus:border-purple-500'
                    }`}
                    placeholder="Write a brief professional summary..."
                  />
                  {isFieldMissing('summary') && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> Required for job application
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: Work Experience */}
          {activeTab === 'experience' && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Work Experience
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-purple-400 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-zinc-950/50 cursor-pointer"
                >
                  + Add Experience
                </button>
              </div>

              {experience.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-sm">
                  No work experience logged. Click "+ Add Experience" to get started.
                </div>
              ) : (
                <div className="space-y-8 divide-y divide-zinc-900/60">
                  {experience.map((exp, expIdx) => (
                    <div key={expIdx} className={`space-y-4 ${expIdx > 0 ? 'pt-6' : ''} relative group`}>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(expIdx)}
                        className="absolute top-0 right-0 p-1.5 text-zinc-500 hover:text-rose-400 transition-colors border border-transparent hover:border-zinc-800 hover:bg-zinc-950 rounded-lg mt-2 mr-2 cursor-pointer"
                        title="Remove this experience"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="grid gap-4 md:grid-cols-3 pr-10">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => handleExperienceChange(expIdx, 'title', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Senior Developer"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(expIdx, 'company', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Google"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(expIdx, 'duration', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Jan 2022 - Present"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pr-10">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Responsibilities / Bullet Points</label>
                          <button
                            type="button"
                            onClick={() => handleAddResponsibility(expIdx)}
                            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            + Add Bullet
                          </button>
                        </div>
                        
                        {exp.responsibilities.length === 0 ? (
                          <span className="text-xs text-zinc-650 block">No bullet points added.</span>
                        ) : (
                          <div className="space-y-2">
                            {exp.responsibilities.map((resp, respIdx) => (
                              <div key={respIdx} className="flex gap-2 items-center animate-in slide-in-from-top-1 duration-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={resp}
                                  onChange={(e) => handleResponsibilityChange(expIdx, respIdx, e.target.value)}
                                  className="flex-1 h-9 px-3 bg-zinc-950 border border-zinc-900 focus:border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none"
                                  placeholder="Describe a key achievement or task..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveResponsibility(expIdx, respIdx)}
                                  className="text-zinc-600 hover:text-rose-400 transition-colors text-sm p-1 cursor-pointer"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: Education */}
          {activeTab === 'education' && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Education History
                </h3>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-indigo-400 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-zinc-950/50 cursor-pointer"
                >
                  + Add Education
                </button>
              </div>

              {education.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-sm">
                  No education entries logged. Click "+ Add Education" to get started.
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-zinc-900/60">
                  {education.map((edu, eduIdx) => (
                    <div key={eduIdx} className={`space-y-4 ${eduIdx > 0 ? 'pt-6' : ''} relative group`}>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(eduIdx)}
                        className="absolute top-0 right-0 p-1.5 text-zinc-500 hover:text-rose-400 transition-colors border border-transparent hover:border-zinc-800 hover:bg-zinc-950 rounded-lg mt-2 mr-2 cursor-pointer"
                        title="Remove this education entry"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="grid gap-4 md:grid-cols-3 pr-10">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Degree / Qualification</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(eduIdx, 'degree', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. B.S. in Computer Science"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">School / Institution</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => handleEducationChange(eduIdx, 'school', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Stanford University"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Duration</label>
                          <input
                            type="text"
                            value={edu.duration}
                            onChange={(e) => handleEducationChange(eduIdx, 'duration', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. 2018 - 2022"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Details / GPA / Accomplishments</label>
                          <input
                            type="text"
                            value={edu.details || ''}
                            onChange={(e) => handleEducationChange(eduIdx, 'details', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. GPA: 3.9/4.0. Completed senior capstone project on AI agents."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 4: Projects */}
          {activeTab === 'projects' && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Personal & Professional Projects
                </h3>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-purple-400 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-zinc-950/50 cursor-pointer"
                >
                  + Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-sm">
                  No projects logged. Click "+ Add Project" to get started.
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-zinc-900/60">
                  {projects.map((proj, projIdx) => (
                    <div key={projIdx} className={`space-y-4 ${projIdx > 0 ? 'pt-6' : ''} relative group`}>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(projIdx)}
                        className="absolute top-0 right-0 p-1.5 text-zinc-500 hover:text-rose-400 transition-colors border border-transparent hover:border-zinc-800 hover:bg-zinc-950 rounded-lg mt-2 mr-2 cursor-pointer"
                        title="Remove this project"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="grid gap-4 md:grid-cols-2 pr-10">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Project Name</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) => handleProjectChange(projIdx, 'name', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. E-Commerce Backend"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Link / GitHub URL</label>
                          <input
                            type="url"
                            value={proj.link || ''}
                            onChange={(e) => handleProjectChange(projIdx, 'link', e.target.value)}
                            className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                            placeholder="e.g. https://github.com/username/project"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase">Project Description</label>
                          <textarea
                            value={proj.description}
                            onChange={(e) => handleProjectChange(projIdx, 'description', e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500 resize-y"
                            placeholder="Describe the project goal, tech stack, and achievements..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 5: Skills & Certifications */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Skills & Certifications
                </h3>

                <div className="space-y-6">
                  {/* Skills */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Skills (Press Enter to add)</label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Type a skill (e.g. React) and press Enter"
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.length === 0 ? (
                        <span className="text-xs text-zinc-500">No skills added yet.</span>
                      ) : (
                        skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 animate-in zoom-in-75 duration-200">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Certifications (Press Enter to add)</label>
                    <input
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={handleAddCert}
                      className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Type a certification (e.g. AWS Developer) and press Enter"
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {certifications.length === 0 ? (
                        <span className="text-xs text-zinc-500">No certifications added yet.</span>
                      ) : (
                        certifications.map((cert, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 animate-in zoom-in-75 duration-200">
                            {cert}
                            <button
                              type="button"
                              onClick={() => handleRemoveCert(cert)}
                              className="text-indigo-400 hover:text-indigo-200 transition-colors cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other details */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-4 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Other Information
                </h3>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Additional Details / Custom Sections</label>
                  <textarea
                    value={otherDetails}
                    onChange={(e) => setOtherDetails(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-y"
                    placeholder="Links, publications, hobbies, or additional notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
