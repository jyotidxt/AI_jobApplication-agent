import { createClient } from '@/lib/supabase/server'
import { ApplicationsDashboardView } from '@/components/applications-dashboard-view'
import { DbJob } from '@/app/actions/jobs'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let initialJobs: DbJob[] = []
  
  if (user) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('fetched_at', { ascending: false })
      
    if (data) {
      initialJobs = data as DbJob[]
    }
  }

  return (
    <ApplicationsDashboardView 
      initialJobs={initialJobs} 
      userId={user?.id || ''} 
    />
  )
}
