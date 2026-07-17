'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Interface representing a Job database record
export interface DbJob {
  id: string
  user_id: string
  platform: 'greenhouse' | 'lever' | 'workable' | 'wellfound'
  title: string
  company: string
  company_logo: string | null
  location: string | null
  salary: string | null
  job_type: string | null
  experience_level: string | null
  description: string | null
  tags: string[] | null
  match_score: number
  job_url: string
  source_url: string | null
  applied_status: boolean
  saved_status: boolean
  fetched_at: string
  created_at: string
}

// Interface for raw search results from Brave Search API
interface RawSearchResult {
  title: string
  url: string
  description: string
  platform: 'greenhouse' | 'lever' | 'workable' | 'wellfound'
}

// Fetch all jobs for the logged in user
export async function getJobs() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })

    if (error) {
      console.error('Error fetching jobs:', error.message)
      return { error: error.message }
    }

    return { success: true, jobs: data as DbJob[] }
  } catch (err: any) {
    console.error('Catch error in getJobs:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

// Toggle saved status of a job
export async function toggleSaveJob(jobId: string, savedStatus: boolean) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('jobs')
      .update({ saved_status: savedStatus })
      .eq('id', jobId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling save status:', error.message)
      return { error: error.message }
    }

    revalidatePath('/dashboard/jobs')
    return { success: true, job: data as DbJob }
  } catch (err: any) {
    console.error('Catch error in toggleSaveJob:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

// Toggle applied status of a job
export async function toggleAppliedJob(jobId: string, appliedStatus: boolean) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('jobs')
      .update({ applied_status: appliedStatus })
      .eq('id', jobId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling applied status:', error.message)
      return { error: error.message }
    }

    revalidatePath('/dashboard/jobs')
    return { success: true, job: data as DbJob }
  } catch (err: any) {
    console.error('Catch error in toggleAppliedJob:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

// Fetch jobs, handle caching, call Brave API, analyze with Gemini, and store in DB
export async function fetchAndStoreJobs(selectedPlatforms: string[], forceRefresh: boolean = false) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // 1. Get profile data to construct search terms
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    // 2. Check cached database jobs first
    const { data: existingJobs, error: fetchJobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)

    if (fetchJobsError) {
      console.error('Error querying existing jobs:', fetchJobsError.message)
    }

    const hasCachedJobs = existingJobs && existingJobs.length > 0
    let isCacheFresh = false
    let latestFetchedAt = 0

    if (hasCachedJobs) {
      latestFetchedAt = existingJobs.reduce((latest, job) => {
        const fetchedTime = new Date(job.fetched_at).getTime()
        return fetchedTime > latest ? fetchedTime : latest
      }, 0)

      const sixHoursInMs = 6 * 60 * 60 * 1000
      isCacheFresh = (Date.now() - latestFetchedAt) < sixHoursInMs
    }

    // If cache is fresh and we aren't forcing a refresh, return what we have
    if (hasCachedJobs && isCacheFresh && !forceRefresh) {
      console.log('Serving jobs from cache. Age:', Math.round((Date.now() - latestFetchedAt) / 60000), 'minutes')
      return { success: true, jobs: existingJobs as DbJob[], cached: true }
    }

    console.log('Cache stale or force refreshed. Fetching new jobs...')

    // 3. Extract search query components from profile
    const profileSkills = profile?.skills || []
    const profileExperience = profile?.experience || []
    const profileAddress = profile?.address || ''
    const profileSummary = profile?.summary || ''
    
    // Parse role: latest job title or fallback
    const role = profileExperience[0]?.title || 'Software Engineer'
    
    // Parse tech stack: top skills or fallback
    const techStack = profileSkills.length > 0 ? profileSkills.slice(0, 3).join(' ') : 'React TypeScript Node.js'
    
    // Parse location: address or fallback
    const location = profileAddress.trim() || 'Remote'
    
    // Parse job type: default to Remote/Full-time or scan summary/other details
    let jobType = 'Remote'
    if (profileSummary.toLowerCase().includes('hybrid')) {
      jobType = 'Hybrid'
    } else if (profileSummary.toLowerCase().includes('on-site') || profileSummary.toLowerCase().includes('onsite')) {
      jobType = 'On-site'
    }

    const searchQueryParams = `${techStack} ${role} ${jobType} ${location}`
    const platformsToSearch = selectedPlatforms.length > 0 ? selectedPlatforms : ['greenhouse', 'lever', 'workable', 'wellfound']
    
    const braveApiKey = process.env.BRAVE_API_KEY
    let jobsToSave: Omit<DbJob, 'id' | 'user_id' | 'applied_status' | 'saved_status' | 'fetched_at' | 'created_at'>[] = []
    let isMockFallback = false

    // 4. Fetch from Brave Search API or Mock fallback
    if (!braveApiKey) {
      console.warn('BRAVE_API_KEY is not defined in environment variables. Generating mock jobs based on profile.')
      isMockFallback = true
      jobsToSave = generateMockJobsForProfile(role, profileSkills, location, jobType, platformsToSearch)
    } else {
      try {
        const rawResults: RawSearchResult[] = []
        
        // Execute parallel requests for each selected platform
        await Promise.all(
          platformsToSearch.map(async (platform) => {
            const domain = getPlatformDomain(platform)
            const query = `site:${domain} ${searchQueryParams}`
            const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`

            try {
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'X-Subscription-Token': braveApiKey,
                },
                next: { revalidate: 0 } // Bypass standard fetch cache
              })

              if (!response.ok) {
                console.error(`Brave API error for platform ${platform}:`, response.statusText)
                return
              }

              const data = await response.json()
              const results = data.web?.results || []

              results.forEach((res: any) => {
                // Ensure URL contains the platform domain to filter out garbage results
                if (res.url && res.url.toLowerCase().includes(platform === 'wellfound' ? 'wellfound' : platform)) {
                  rawResults.push({
                    title: res.title,
                    url: res.url,
                    description: res.description || '',
                    platform: platform as 'greenhouse' | 'lever' | 'workable' | 'wellfound'
                  })
                }
              })
            } catch (platformErr) {
              console.error(`Error fetching for platform ${platform}:`, platformErr)
            }
          })
        )

        if (rawResults.length === 0) {
          console.warn('No search results returned from Brave Search API. Falling back to mock jobs.')
          isMockFallback = true
          jobsToSave = generateMockJobsForProfile(role, profileSkills, location, jobType, platformsToSearch)
        } else {
          // 5. Use Gemini to parse and normalize search results
          const geminiKey = process.env.GEMINI_API_KEY
          if (!geminiKey) {
            console.warn('GEMINI_API_KEY is missing. Using heuristic parser.')
            jobsToSave = parseResultsHeuristically(rawResults, profileSkills)
          } else {
            try {
              const parsedJobs = await parseResultsWithGemini(rawResults, profile, geminiKey)
              if (parsedJobs && parsedJobs.length > 0) {
                jobsToSave = parsedJobs
              } else {
                console.warn('Gemini parsing returned empty or invalid results. Using heuristic parser.')
                jobsToSave = parseResultsHeuristically(rawResults, profileSkills)
              }
            } catch (geminiErr) {
              console.error('Error parsing results with Gemini, falling back to heuristics:', geminiErr)
              jobsToSave = parseResultsHeuristically(rawResults, profileSkills)
            }
          }
        }
      } catch (searchErr) {
        console.error('Error during job search flow:', searchErr)
        isMockFallback = true
        jobsToSave = generateMockJobsForProfile(role, profileSkills, location, jobType, platformsToSearch)
      }
    }

    // 6. Update database: Delete old unsaved/unapplied jobs and insert new ones
    // First, verify which jobs are saved or applied to preserve them
    const savedOrAppliedJobs = existingJobs?.filter(job => job.saved_status || job.applied_status) || []
    
    // Clear out old unsaved/unapplied jobs
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('saved_status', false)
      .eq('applied_status', false)

    if (deleteError) {
      console.error('Error clearing old jobs:', deleteError.message)
    }

    // Insert new jobs
    if (jobsToSave.length > 0) {
      const recordsToInsert = jobsToSave.map(job => ({
        user_id: user.id,
        platform: job.platform,
        title: job.title,
        company: job.company,
        company_logo: job.company_logo || `https://logo.clearbit.com/${extractDomain(job.job_url)}`,
        location: job.location,
        salary: job.salary,
        job_type: job.job_type,
        experience_level: job.experience_level,
        description: job.description,
        tags: job.tags,
        match_score: job.match_score,
        job_url: job.job_url,
        source_url: job.job_url,
        applied_status: false,
        saved_status: false,
        fetched_at: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('jobs')
        .insert(recordsToInsert)

      if (insertError) {
        console.error('Error inserting new jobs:', insertError.message)
        return { error: `Failed to insert new jobs: ${insertError.message}` }
      }
    }

    // Fetch the updated list (combination of saved/applied jobs and newly fetched ones)
    const { data: finalJobs, error: finalError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })

    if (finalError) {
      console.error('Error fetching final jobs:', finalError.message)
      return { error: finalError.message }
    }

    revalidatePath('/dashboard/jobs')
    return {
      success: true,
      jobs: finalJobs as DbJob[],
      cached: false,
      isMock: isMockFallback
    }
  } catch (err: any) {
    console.error('Catch error in fetchAndStoreJobs:', err)
    return { error: err.message || 'Unknown error occurred' }
  }
}

// Get Brave Search domain for the platform
function getPlatformDomain(platform: string): string {
  switch (platform) {
    case 'greenhouse': return 'greenhouse.io/jobs'
    case 'lever': return 'lever.co/jobs'
    case 'workable': return 'workable.com/jobs'
    case 'wellfound': return 'wellfound.com/jobs'
    default: return 'greenhouse.io/jobs'
  }
}

// Heuristic domain extractor
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return 'company.com'
  }
}

// Call Gemini API to parse and match jobs
async function parseResultsWithGemini(
  rawResults: RawSearchResult[],
  profile: any,
  apiKey: string
): Promise<Omit<DbJob, 'id' | 'user_id' | 'applied_status' | 'saved_status' | 'fetched_at' | 'created_at'>[] | null> {
  const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-pro-latest']
  
  const systemInstruction = `You are a job parser AI.
Normalize the provided raw job search results into a clean list of job opportunity objects.
For each result, calculate a match score (0-100) based on how well the job requirements match the user's profile.
- Look at user's skills, experience titles, and summary.
- Compute a matching score: High matching skills and role titles should score > 85. Partially matching should score 60-84. Unrelated should score < 60.
- Extract details such as Company, Job Title, Location, Salary (if mentioned, otherwise null), Job Type (Remote, Hybrid, On-site, or null), Experience Level (Entry, Mid, Senior, Lead, or null), Description (short summaries), and Tags (list of technologies or skills required).

User Profile Details:
- Skills: ${JSON.stringify(profile?.skills || [])}
- Experience: ${JSON.stringify(profile?.experience || [])}
- Summary: ${profile?.summary || ''}
- Education: ${JSON.stringify(profile?.education || [])}

Input Search Results:
${JSON.stringify(rawResults)}

Ensure all items are output as valid JSON.
Do not include markdown tags (\`\`\`json blocks) or explanations. Output ONLY valid JSON array.`

  for (const model of models) {
    try {
      console.log(`Analyzing job search results with Gemini model: ${model}`)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      })

      if (response.ok) {
        const json = await response.json()
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return JSON.parse(text)
        }
      } else {
        const errText = await response.text()
        console.warn(`Gemini API error with model ${model}:`, errText)
      }
    } catch (e: any) {
      console.error(`Gemini Model ${model} failed:`, e.message)
    }
  }
  return null
}

// Fallback rule-based parsing of search results if Gemini is unavailable
function parseResultsHeuristically(
  rawResults: RawSearchResult[],
  skills: string[]
): Omit<DbJob, 'id' | 'user_id' | 'applied_status' | 'saved_status' | 'fetched_at' | 'created_at'>[] {
  return rawResults.map(res => {
    let company = 'Unknown Company'
    let title = res.title

    if (res.title.includes(' at ')) {
      const parts = res.title.split(' at ')
      title = parts[0].trim()
      company = parts[1].split(/[-|]/)[0].trim()
    } else if (res.title.includes(' - ')) {
      const parts = res.title.split(' - ')
      company = parts[0].trim()
      title = parts[1].trim()
    } else if (res.title.includes(' | ')) {
      const parts = res.title.split(' | ')
      title = parts[0].trim()
      company = parts[1].trim()
    }

    // Location heuristics
    let location = 'Remote'
    if (res.description.toLowerCase().includes('london')) location = 'London, UK'
    else if (res.description.toLowerCase().includes('new york') || res.description.toLowerCase().includes('ny')) location = 'New York, NY'
    else if (res.description.toLowerCase().includes('san francisco') || res.description.toLowerCase().includes('sf')) location = 'San Francisco, CA'
    else if (res.description.toLowerCase().includes('seattle')) location = 'Seattle, WA'
    else if (res.description.toLowerCase().includes('boston')) location = 'Boston, MA'

    // Job Type
    let jobType = 'Remote'
    if (res.description.toLowerCase().includes('hybrid')) jobType = 'Hybrid'
    else if (res.description.toLowerCase().includes('on-site') || res.description.toLowerCase().includes('onsite')) jobType = 'On-site'

    // Experience level
    let expLevel = 'Senior'
    if (title.toLowerCase().includes('junior') || title.toLowerCase().includes('associate') || title.toLowerCase().includes('entry')) expLevel = 'Entry'
    else if (title.toLowerCase().includes('lead') || title.toLowerCase().includes('principal') || title.toLowerCase().includes('staff')) expLevel = 'Lead'
    else if (title.toLowerCase().includes('mid') || title.toLowerCase().includes('developer')) expLevel = 'Mid'

    // Match Score
    const matchedSkills = skills.filter(skill => 
      title.toLowerCase().includes(skill.toLowerCase()) || 
      res.description.toLowerCase().includes(skill.toLowerCase())
    )
    const matchScore = Math.min(65 + (matchedSkills.length * 10), 98)

    // Salary extraction
    let salary = null
    const salaryRegex = /(\$\d{2,3},?\d{3}|\$\d{2,3}k)/gi
    const salaryMatches = res.description.match(salaryRegex)
    if (salaryMatches && salaryMatches.length > 0) {
      salary = salaryMatches.slice(0, 2).join(' - ')
    }

    return {
      title,
      company,
      company_logo: null,
      location,
      salary,
      job_type: jobType,
      experience_level: expLevel,
      description: res.description.slice(0, 250) + (res.description.length > 250 ? '...' : ''),
      tags: matchedSkills.length > 0 ? matchedSkills : (skills.length > 0 ? skills.slice(0, 3) : ['Engineering']),
      match_score: matchScore,
      job_url: res.url,
      source_url: res.url,
      platform: res.platform
    }
  })
}

// Generate high quality mock data tailored to the user profile
function generateMockJobsForProfile(
  role: string,
  skills: string[],
  location: string,
  jobType: string,
  platforms: string[]
): Omit<DbJob, 'id' | 'user_id' | 'applied_status' | 'saved_status' | 'fetched_at' | 'created_at'>[] {
  const mockCompanies = [
    { name: 'Stripe', logoDomain: 'stripe.com' },
    { name: 'Vercel', logoDomain: 'vercel.com' },
    { name: 'Linear', logoDomain: 'linear.app' },
    { name: 'Supabase', logoDomain: 'supabase.com' },
    { name: 'Figma', logoDomain: 'figma.com' },
    { name: 'Retool', logoDomain: 'retool.com' },
    { name: 'Notion', logoDomain: 'notion.so' },
    { name: 'Airbnb', logoDomain: 'airbnb.com' }
  ]

  const mockJobs: Omit<DbJob, 'id' | 'user_id' | 'applied_status' | 'saved_status' | 'fetched_at' | 'created_at'>[] = []
  
  const totalJobs = Math.max(4, platforms.length * 2)
  for (let i = 0; i < totalJobs; i++) {
    const platform = platforms[i % platforms.length] as 'greenhouse' | 'lever' | 'workable' | 'wellfound'
    const companyInfo = mockCompanies[i % mockCompanies.length]
    
    let finalTitle = role
    if (i === 0) finalTitle = `Senior ${role}`
    if (i === 1) finalTitle = `Staff ${role}`
    if (i === 2) finalTitle = `Full Stack ${role}`
    if (i === 3 && role.toLowerCase().includes('developer')) finalTitle = role.replace(/developer/i, 'Engineer')

    let score = 95 - (i * 6)
    if (score < 55) score = 55

    const jobTypes = ['Remote', 'Hybrid', 'On-site']
    const finalJobType = i % 3 === 0 ? jobType : jobTypes[i % 3]

    const locations = [location, 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Remote']
    const finalLocation = i === 0 ? location : locations[i % locations.length]

    const salaries = [
      '$140,000 - $180,000',
      '$130,000 - $160,000',
      '$150,000 - $190,000',
      '$110,000 - $145,000',
      null
    ]
    const finalSalary = salaries[i % salaries.length]

    const levels = ['Senior', 'Mid', 'Lead', 'Entry']
    const finalExpLevel = i === 1 ? 'Lead' : (i === 0 ? 'Senior' : levels[i % levels.length])

    const finalTags = [...skills]
    if (finalTags.length === 0) {
      finalTags.push('React', 'TypeScript', 'Node.js')
    }
    if (i % 2 === 0) finalTags.push('API Design')
    if (i % 3 === 0) finalTags.push('Next.js')

    const platformUrlSlug = companyInfo.name.toLowerCase().replace(/\s+/g, '-')
    const jobUrl = `https://${platform === 'greenhouse' ? 'boards.greenhouse.io' : (platform === 'lever' ? 'jobs.lever.co' : (platform === 'workable' ? 'apply.workable.com' : 'wellfound.com/company'))}/${platformUrlSlug}/jobs/${100000 + i}`

    mockJobs.push({
      title: finalTitle,
      company: companyInfo.name,
      company_logo: `https://logo.clearbit.com/${companyInfo.logoDomain}`,
      location: finalLocation,
      salary: finalSalary,
      job_type: finalJobType,
      experience_level: finalExpLevel,
      description: `Join ${companyInfo.name} as a ${finalTitle}. We are seeking a talented developer to work with our core product engineering team. You will build and scale high-performance user interfaces and backend integrations using ${finalTags.slice(0, 3).join(', ')}.`,
      tags: finalTags.slice(0, 4),
      match_score: score,
      job_url: jobUrl,
      source_url: jobUrl,
      platform
    })
  }

  return mockJobs
}
