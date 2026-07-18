'use server'

import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'
import { revalidatePath } from 'next/cache'

// Start automatic application
export async function startAutoApply(jobId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Update job status to 'Checking Profile'
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        application_status: 'Checking Profile',
        missing_fields: [],
        required_fields: []
      })
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating job status:', updateError.message)
      return { error: updateError.message }
    }

    // Trigger Inngest background function
    await inngest.send({
      name: 'job/apply.start',
      data: {
        jobId,
        userId: user.id
      }
    })

    revalidatePath('/dashboard/jobs')
    revalidatePath('/dashboard/applications')
    return { success: true }
  } catch (err: any) {
    console.error('Catch error in startAutoApply:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

// Retry automatic application
export async function retryAutoApply(jobId: string) {
  return startAutoApply(jobId)
}

// Set manual application complete
export async function setManualApplied(jobId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        applied_status: true,
        application_status: 'Applied'
      })
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating job status for manual apply:', updateError.message)
      return { error: updateError.message }
    }

    revalidatePath('/dashboard/jobs')
    revalidatePath('/dashboard/applications')
    return { success: true }
  } catch (err: any) {
    console.error('Catch error in setManualApplied:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}
