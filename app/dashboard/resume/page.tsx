import { getUserResumes } from '@/app/actions/profile'
import { ResumeList } from '@/components/resume-list'
import { OnboardingModal } from '@/components/onboarding-modal'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const resumes = await getUserResumes()
  const hasUploaded = resumes.length > 0

  return (
    <div className="space-y-6 max-w-5xl relative min-h-[400px]">
      <OnboardingModal initialIsOnboarded={hasUploaded} />
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Resume Manager</h2>
        <p className="text-zinc-400 text-sm">
          Upload and manage your master resumes. The AI JobBuddy assistant will automatically optimize the experiences in these resumes to fit your targeted job applications.
        </p>
      </div>

      <ResumeList initialResumes={resumes} />
    </div>
  )
}
