'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile, Resume } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getUserProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user profile:', error.message)
      return null
    }

    return data as Profile | null
  } catch (err) {
    console.error('Catch error in getUserProfile:', err)
    return null
  }
}

export async function saveProfile(profileData: Omit<Profile, 'id'>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving profile:', error.message)
      return { error: error.message }
    }

    revalidatePath('/dashboard/profile')
    return { success: true, profile: data as Profile }
  } catch (err: any) {
    console.error('Catch error in saveProfile:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

export async function saveResumeRecord(fileName: string, fileUrl: string, parsedData: Profile) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_url: fileUrl,
        parsed_data: parsedData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving resume record:', error.message)
      return { error: error.message }
    }

    revalidatePath('/dashboard/resume')
    return { success: true, resume: data as Resume }
  } catch (err: any) {
    console.error('Catch error in saveResumeRecord:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

export async function getUserResumes() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user resumes:', error.message)
      return []
    }

    return data as Resume[]
  } catch (err) {
    console.error('Catch error in getUserResumes:', err)
    return []
  }
}

export async function deleteResume(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting resume:', error.message)
      return { error: error.message }
    }

    revalidatePath('/dashboard/resume')
    return { success: true }
  } catch (err: any) {
    console.error('Catch error in deleteResume:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}
