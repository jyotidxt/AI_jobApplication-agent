import { getUserProfile } from '@/app/actions/profile'
import { ProfileForm } from '@/components/profile-form'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ missingJobId?: string }>
}) {
  const profile = await getUserProfile()
  const { missingJobId } = await searchParams
  
  let missingFields: string[] = []
  let missingJobInfo: { company: string; title: string } | null = null
  
  // Try to find the job that has missing fields
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      
    if (missingJobId) {
      query = query.eq('id', missingJobId)
    } else {
      query = query.eq('application_status', 'Missing Profile Info')
    }
    
    const { data } = await query.limit(1).maybeSingle()
    
    if (data && data.application_status === 'Missing Profile Info') {
      missingFields = data.missing_fields || []
      missingJobInfo = {
        company: data.company,
        title: data.title
      }
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-white">Profile Settings</h1>
        <p className="text-zinc-400 text-sm">
          Manage your personal information, skills, and work experience. This data is used to automatically tailor resumes and fill job applications.
        </p>
      </div>

      <ProfileForm 
        initialProfile={profile} 
        missingFields={missingFields}
        missingJobInfo={missingJobInfo}
      />
    </div>
  )
}
