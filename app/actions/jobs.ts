'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Interface representing a Job database record
export interface DbJob {
  id: string
  user_id: string
  platform: 'Greenhouse' | 'Lever' | 'Workable'
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

// Normalized Job interface as per requirement
export interface Job {
  id: string
  title: string
  company: string
  location?: string
  platform: 'Greenhouse' | 'Lever' | 'Workable'
  url: string
  snippet?: string
  sourceDomain: string
}

// Interface for Serper API Organic results
interface SerperOrganicResult {
  title: string
  link: string
  snippet?: string
  position?: number
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

// Helper to extract company name from search result details
function extractCompanyName(title: string, url: string): string {
  // 1. Try to extract from title patterns
  if (title.includes(' at ')) {
    const parts = title.split(' at ')
    return cleanCompanySlug(parts[parts.length - 1])
  }
  if (title.includes(' - ')) {
    const parts = title.split(' - ')
    if (url.toLowerCase().includes(parts[0].toLowerCase().replace(/[^a-z0-9]/g, ''))) {
      return parts[0].trim()
    }
    return cleanCompanySlug(parts[parts.length - 1])
  }
  if (title.includes(' | ')) {
    const parts = title.split(' | ')
    return cleanCompanySlug(parts[0])
  }

  // 2. Fallback to URL path segment (which represents the company slug on Greenhouse, Lever, Workable)
  try {
    const parsed = new URL(url)
    const pathSegments = parsed.pathname.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      return cleanCompanySlug(pathSegments[0])
    }
  } catch {}

  return 'Tech Company'
}

// Helper to clean slug to title case (e.g. "stripe-payments" -> "Stripe Payments")
function cleanCompanySlug(slug: string): string {
  let cleaned = slug.split(/[|:-]/)[0].trim()
  cleaned = cleaned.replace(/[-_]/g, ' ')
  // Remove file endings if any
  cleaned = cleaned.replace(/\.(com|co|io|net|org)$/i, '')
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to extract location from title or snippet
function extractLocation(title: string, snippet: string): string {
  const text = `${title} ${snippet}`.toLowerCase()
  
  if (text.includes('remote') || text.includes('anywhere') || text.includes('work from home')) {
    return 'Remote'
  }
  
  // Basic location matchers
  const locations = [
    { name: 'San Francisco, CA', keywords: ['san francisco', 'sf '] },
    { name: 'New York, NY', keywords: ['new york', 'nyc', 'ny '] },
    { name: 'London, UK', keywords: ['london', ' uk '] },
    { name: 'Seattle, WA', keywords: ['seattle'] },
    { name: 'Boston, MA', keywords: ['boston'] },
    { name: 'Austin, TX', keywords: ['austin'] },
    { name: 'Toronto, ON', keywords: ['toronto', 'canada'] },
    { name: 'Berlin, DE', keywords: ['berlin', 'germany'] }
  ]

  for (const loc of locations) {
    if (loc.keywords.some(kw => text.includes(kw))) {
      return loc.name
    }
  }

  return 'Remote / US'
}

// Helper to extract tags/skills from title or snippet
function extractTags(title: string, snippet: string, profileSkills: string[]): string[] {
  const text = `${title} ${snippet}`.toLowerCase()
  const matched = profileSkills.filter(skill => text.includes(skill.toLowerCase()))
  
  // Defaults if no profile skills match
  if (matched.length === 0) {
    const common = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'API', 'Frontend', 'Backend']
    const defaults = common.filter(c => text.includes(c.toLowerCase()))
    return defaults.length > 0 ? defaults : ['Software Engineering']
  }

  return matched
}

// Generate high quality mock data tailored to the user profile using Serper specifications
function generateMockJobsForProfile(
  role: string,
  skills: string[],
  location: string,
  limit: number = 30
): Job[] {
  const mockCompanies = [
    'Stripe', 'Vercel', 'Linear', 'Supabase', 'Figma', 'Retool', 'Slack', 'Zoom',
    'PostHog', 'Airtable', 'Notion', 'Webflow', 'HashiCorp', 'GitLab', 'GitHub',
    'Brex', 'Ramp', 'Gusto', 'Plaid', 'Flexport', 'Bolt', 'Deel', 'Replit',
    'Clerk', 'Resend', 'Neon', 'Upstash', 'Inngest', 'Turborepo', 'Sentry'
  ]
  const platforms: ('Greenhouse' | 'Lever' | 'Workable')[] = ['Greenhouse', 'Lever', 'Workable']
  
  return mockCompanies.slice(0, limit).map((company, i) => {
    const platform = platforms[i % platforms.length]
    const title = i === 0 ? `Senior ${role}` : i === 1 ? `Staff ${role}` : `${role} Developer`
    const slug = company.toLowerCase()
    
    let url = ''
    let sourceDomain = ''
    if (platform === 'Greenhouse') {
      url = `https://boards.greenhouse.io/${slug}/jobs/${100000 + i}`
      sourceDomain = 'boards.greenhouse.io'
    } else if (platform === 'Lever') {
      url = `https://jobs.lever.co/${slug}/${100000 + i}`
      sourceDomain = 'jobs.lever.co'
    } else {
      url = `https://apply.workable.com/${slug}/j/${100000 + i}`
      sourceDomain = 'apply.workable.com'
    }

    return {
      id: `mock-${i}`,
      title,
      company,
      location: i % 2 === 0 ? location : 'Remote',
      platform,
      url,
      snippet: `Join ${company} as a ${title}. We are seeking a developer skilled in ${skills.slice(0, 3).join(', ') || 'software engineering'} to join our core product team.`,
      sourceDomain
    }
  })
}

// Helper function to query Serper API with query fallback for free accounts
async function querySerper(apiKey: string, query: string, numResults: number) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      num: numResults
    }),
    next: { revalidate: 0 }
  })

  if (!response.ok) {
    const errText = await response.text()
    if (response.status === 400 && errText.toLowerCase().includes('query pattern not allowed')) {
      return { fallback: true, organic: [] }
    }
    throw new Error(`Serper API error: ${response.statusText} - ${errText}`)
  }

  const data = await response.json()
  return { success: true, fallback: false, organic: data.organic || [] }
}

// Fetch organic jobs from one specific platform domain with fallback for free tier
async function searchForPlatform(
  apiKey: string,
  cleanKeyword: string,
  platformName: 'Greenhouse' | 'Lever' | 'Workable',
  domain: string,
  numResults: number
): Promise<{ platform: 'Greenhouse' | 'Lever' | 'Workable'; organic: SerperOrganicResult[] }> {
  // Try standard site: operator search
  const siteQuery = `${cleanKeyword} site:${domain}`
  try {
    const res = await querySerper(apiKey, siteQuery, numResults)
    if (res.fallback) {
      // Free accounts fallback: use plain keyword without "site:" prefix
      console.warn(`Serper blocked site: query for ${domain} on free tier. Retrying with plain text keyword...`)
      const fallbackQuery = `${cleanKeyword} ${domain}`
      const fallbackRes = await querySerper(apiKey, fallbackQuery, numResults)
      return { platform: platformName, organic: fallbackRes.organic }
    }
    return { platform: platformName, organic: res.organic }
  } catch (err) {
    console.error(`Error querying Serper for ${platformName} (${siteQuery}):`, err)
    // Attempt absolute fallback with plain domain term
    try {
      const fallbackQuery = `${cleanKeyword} ${domain}`
      const fallbackRes = await querySerper(apiKey, fallbackQuery, numResults)
      return { platform: platformName, organic: fallbackRes.organic }
    } catch {
      return { platform: platformName, organic: [] }
    }
  }
}

// Main fetch and store action supporting Serper Search API
export async function fetchAndStoreJobs(
  selectedPlatforms: string[], 
  forceRefresh: boolean = false, 
  searchQueryText?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // 1. Get profile data to construct query fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const profileSkills = profile?.skills || []
    const profileExperience = profile?.experience || []
    const profileAddress = profile?.address || ''
    
    // Parse default role
    const role = profileExperience[0]?.title || 'Software Engineer'
    const locationDefault = profileAddress.trim() || 'Remote'

    // Determine query keyword
    const searchKeyword = searchQueryText?.trim() || role

    // 2. Check cached database jobs first (only if this is a default load without custom query and not forced)
    const isCustomQuery = !!searchQueryText?.trim()
    const { data: existingJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)

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

    // If cache is fresh and we aren't forced or using a custom search input, serve cache
    if (hasCachedJobs && isCacheFresh && !forceRefresh && !isCustomQuery) {
      console.log('Serving jobs from cache. Age:', Math.round((Date.now() - latestFetchedAt) / 60000), 'minutes')
      return { success: true, jobs: existingJobs as DbJob[], cached: true }
    }

    console.log(`Cache stale or search requested. Fetching up to 30 new jobs for "${searchKeyword}" from Serper...`)

    const serperApiKey = process.env.SERPER_API_KEY
    let rawJobsList: Job[] = []
    let isMockFallback = false

    if (!serperApiKey) {
      console.warn('SERPER_API_KEY is not defined in environment variables. Generating mock jobs.')
      isMockFallback = true
      rawJobsList = generateMockJobsForProfile(searchKeyword, profileSkills, locationDefault, 30)
    } else {
      try {
        // Remove special search chars that might crash Serper free accounts (like quotes or parentheses)
        const cleanKeyword = searchKeyword
          .replace(/[\"\'\(\)]/g, '')
          .trim()

        // 3. Define target domains separately to perform queries concurrently
        const platformsToSearch = [
          { name: 'Greenhouse' as const, domain: 'boards.greenhouse.io' },
          { name: 'Lever' as const, domain: 'jobs.lever.co' },
          { name: 'Workable' as const, domain: 'apply.workable.com' }
        ]

        // 4. Run multiple searches concurrently using Promise.all()
        // Request up to 15 results per platform to allow filters to reach the 30 unique job target
        const searchPromises = platformsToSearch.map(platform =>
          searchForPlatform(serperApiKey, cleanKeyword, platform.name, platform.domain, 20)
        )

        const searchResults = await Promise.all(searchPromises)

        // 5. Merge all returned results and normalize
        searchResults.forEach(({ platform, organic }) => {
          organic.forEach((res, index) => {
            const link = res.link || ''
            let matchedPlatform: 'Greenhouse' | 'Lever' | 'Workable' | null = null
            let sourceDomain = ''

            // Detect matching domains and normalize platform labels
            if (link.includes('boards.greenhouse.io') || link.includes('job-boards.greenhouse.io')) {
              matchedPlatform = 'Greenhouse'
              sourceDomain = 'boards.greenhouse.io'
            } else if (link.includes('jobs.lever.co')) {
              matchedPlatform = 'Lever'
              sourceDomain = 'jobs.lever.co'
            } else if (link.includes('apply.workable.com')) {
              matchedPlatform = 'Workable'
              sourceDomain = 'apply.workable.com'
            }

            if (matchedPlatform && sourceDomain) {
              rawJobsList.push({
                id: `serper-${matchedPlatform.toLowerCase()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
                title: res.title,
                company: extractCompanyName(res.title, link),
                location: extractLocation(res.title, res.snippet || ''),
                platform: matchedPlatform,
                url: link,
                snippet: res.snippet || '',
                sourceDomain
              })
            }
          })
        })

        if (rawJobsList.length === 0) {
          console.warn('Serper API returned zero matching platform results. Falling back to mock jobs.')
          isMockFallback = true
          rawJobsList = generateMockJobsForProfile(searchKeyword, profileSkills, locationDefault, 30)
        }
      } catch (serperErr: any) {
        console.error('Error during Serper API search:', serperErr)
        return { error: `Job search service failed: ${serperErr.message || 'Check network connection'}` }
      }
    }

    // 6. Deduplicate jobs based on URL
    const uniqueJobsMap = new Map<string, Job>()
    rawJobsList.forEach(job => {
      if (!uniqueJobsMap.has(job.url)) {
        uniqueJobsMap.set(job.url, job)
      }
    })
    const deduplicatedJobs = Array.from(uniqueJobsMap.values())

    // 7. Map deduplicated list to DB schema and slice to a MAXIMUM of 30 unique jobs
    const jobsToInsert = deduplicatedJobs.slice(0, 30).map(job => {
      const cleanTitle = job.title.toLowerCase()
      const cleanSnippet = (job.snippet || '').toLowerCase()
      const queryLower = searchKeyword.toLowerCase()

      let score = 50 // Base relevance score

      // Direct query match in title
      if (cleanTitle.includes(queryLower)) score += 25
      // Direct query match in snippet
      else if (cleanSnippet.includes(queryLower)) score += 10

      // Match profile skills
      const matchedSkills = profileSkills.filter((skill: string) => 
        cleanTitle.includes(skill.toLowerCase()) || 
        cleanSnippet.includes(skill.toLowerCase())
      )
      score += matchedSkills.length * 8

      // Cap relevance score between 45 and 98
      const finalScore = Math.max(45, Math.min(score, 98))
      const tags = extractTags(job.title, job.snippet || '', profileSkills)

      return {
        user_id: user.id,
        platform: job.platform,
        title: job.title,
        company: job.company,
        company_logo: `https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        location: job.location || 'Remote',
        salary: null,
        job_type: (job.snippet || '').toLowerCase().includes('hybrid') ? 'Hybrid' : ((job.snippet || '').toLowerCase().includes('on-site') ? 'On-site' : 'Remote'),
        experience_level: cleanTitle.includes('senior') ? 'Senior' : (cleanTitle.includes('lead') ? 'Lead' : (cleanTitle.includes('junior') ? 'Entry' : 'Mid')),
        description: job.snippet || '',
        tags,
        match_score: finalScore,
        job_url: job.url,
        source_url: job.sourceDomain,
        applied_status: false,
        saved_status: false,
        fetched_at: new Date().toISOString()
      }
    })

    // 8. Sort jobs by relevance match score descending
    jobsToInsert.sort((a, b) => b.match_score - a.match_score)

    // 9. Update Database: Clear old unsaved/unapplied jobs and insert new ones
    // Preserve saved/applied jobs
    const savedOrAppliedJobs = existingJobs?.filter(job => job.saved_status || job.applied_status) || []

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('saved_status', false)
      .eq('applied_status', false)

    if (deleteError) {
      console.error('Error clearing old jobs:', deleteError.message)
    }

    if (jobsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('jobs')
        .insert(jobsToInsert)

      if (insertError) {
        console.error('Error inserting new jobs:', insertError.message)
        return { error: `Failed to save job matches: ${insertError.message}` }
      }
    }

    // Retrieve final combined list from DB
    const { data: finalJobs, error: finalError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })

    if (finalError) {
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
