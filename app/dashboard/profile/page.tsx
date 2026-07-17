import { getUserProfile } from '@/app/actions/profile'
import { ProfileForm } from '@/components/profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-white">Profile Settings</h1>
        <p className="text-zinc-400 text-sm">
          Manage your personal information, skills, and work experience. This data is used to automatically tailor resumes and fill job applications.
        </p>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  )
}
