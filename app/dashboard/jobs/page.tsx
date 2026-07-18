import { getUserProfile } from '@/app/actions/profile'
import { fetchAndStoreJobs } from '@/app/actions/jobs'
import { JobsDashboardView } from '@/components/jobs-dashboard-view'

export const dynamic = 'force-dynamic'

export default async function JobsPage() {
  const profile = await getUserProfile()
  const initialPlatforms = ['greenhouse', 'lever', 'workable']
  
  let initialJobs: any[] = []
  let initialIsMock = false
  
  if (profile) {
    const result = await fetchAndStoreJobs(initialPlatforms, false)
    if (result.success && result.jobs) {
      initialJobs = result.jobs
      initialIsMock = !!result.isMock
    }
  }

  return (
    <JobsDashboardView 
      initialJobs={initialJobs} 
      initialProfile={profile} 
      initialIsMock={initialIsMock} 
    />
  )
}
