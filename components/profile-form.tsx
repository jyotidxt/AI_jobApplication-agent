'use client'

import { useState } from 'react'
import { Profile, WorkExperience, Education, Project } from '@/lib/types'
import { saveProfile } from '@/app/actions/profile'
import { toast } from 'sonner'

interface ProfileFormProps {
  initialProfile: Profile | null
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  // Personal Info State
  const [fullName, setFullName] = useState(initialProfile?.full_name || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
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

  // --- Save Profile Handler ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await saveProfile({
        full_name: fullName,
        phone,
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

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* 1. Personal Information */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
          <span className="h-4 w-1 bg-purple-500 rounded" />
          Personal Information
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. Jane Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. +1 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Personal Website / Portfolio</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. https://janedoe.dev"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">GitHub Link</label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. https://github.com/janedoe"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">LinkedIn Profile</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. https://linkedin.com/in/janedoe"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Professional Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-y"
              placeholder="Write a brief professional summary..."
            />
          </div>
        </div>
      </div>

      {/* 2. Skills and Certifications */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
          <span className="h-4 w-1 bg-purple-500 rounded" />
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
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Type a skill (e.g. React) and press Enter"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.length === 0 ? (
                <span className="text-xs text-zinc-600">No skills added yet.</span>
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
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Type a certification (e.g. AWS Developer) and press Enter"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {certifications.length === 0 ? (
                <span className="text-xs text-zinc-600">No certifications added yet.</span>
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

      {/* 3. Work Experience */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="h-4 w-1 bg-purple-500 rounded" />
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
          <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-sm">
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
                    <span className="text-xs text-zinc-600 block">No bullet points added.</span>
                  ) : (
                    <div className="space-y-2">
                      {exp.responsibilities.map((resp, respIdx) => (
                        <div key={respIdx} className="flex gap-2 items-center">
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

      {/* 4. Education */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="h-4 w-1 bg-purple-500 rounded" />
            Education
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
          <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-sm">
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

      {/* 5. Projects */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="h-4 w-1 bg-purple-500 rounded" />
            Projects
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
          <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-sm">
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
                      rows={3}
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

      {/* 6. Other Details */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 space-y-4 shadow-xl backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
          <span className="h-4 w-1 bg-purple-500 rounded" />
          Other Information
        </h3>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Additional Resume Details</label>
          <textarea
            value={otherDetails}
            onChange={(e) => setOtherDetails(e.target.value)}
            rows={3}
            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-y"
            placeholder="Links, publications, hobbies, or additional notes..."
          />
        </div>
      </div>

      {/* Form Submission Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Saving Profile...
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
  )
}
