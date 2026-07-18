import { inngest } from './client'
import { createClient } from '@supabase/supabase-js'
import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// Initialize Supabase admin client for background operations using public variables (which have RLS enabled, but we bypass RLS for background workers if we can, or we use client JWT. In Next.js, we can use the user auth JWT if we pass it, but since we are running in the background, we can initialize Supabase using service role key, OR since we only have NEXT_PUBLIC_SUPABASE_ANON_KEY in env, we can use that. Note that RLS allows reading/writing jobs if authenticated. Since we run as a background task, wait, does the background task have the user's JWT? Yes, we can pass the user session or auth token in event.data or cookies. But wait! Let's pass the supabase user auth token or we can write to DB using a service client if service key exists, otherwise anon. Let's write it to handle both!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// Define fields mapping interface
interface FieldMapping {
  label: string
  name: string
  type: string
  required: boolean
  mappedProfileKey: string | null
  value: any
}

// Simple heuristic mapping as fallback
function mapFieldsSimple(fields: any[], profile: any, hasResume: boolean): { mappedFields: FieldMapping[], missingFields: string[] } {
  const mappedFields: FieldMapping[] = []
  const missingFields: string[] = []

  for (const field of fields) {
    const label = (field.label || '').toLowerCase()
    const name = (field.name || '').toLowerCase()
    let mappedProfileKey: string | null = null
    let value: any = null

    if (label.includes('first name') || name.includes('first_name') || label.includes('given name')) {
      mappedProfileKey = 'full_name'
      // If profile has full name, use first part
      value = profile?.full_name ? profile.full_name.split(' ')[0] : null
    } else if (label.includes('last name') || name.includes('last_name') || label.includes('family name')) {
      mappedProfileKey = 'full_name'
      // If profile has full name, use last part
      value = profile?.full_name ? profile.full_name.split(' ').slice(1).join(' ') : null
    } else if (label.includes('full name') || name.includes('fullname') || label.includes('name')) {
      mappedProfileKey = 'full_name'
      value = profile?.full_name || null
    } else if (label.includes('email')) {
      mappedProfileKey = 'email'
      value = profile?.email || null
    } else if (label.includes('phone') || label.includes('tel') || name.includes('phone') || name.includes('mobile')) {
      mappedProfileKey = 'phone'
      value = profile?.phone || null
    } else if (label.includes('linkedin') || name.includes('linkedin')) {
      mappedProfileKey = 'linkedin'
      value = profile?.linkedin || null
    } else if (label.includes('github') || name.includes('github')) {
      mappedProfileKey = 'github'
      value = profile?.github || null
    } else if (label.includes('website') || label.includes('portfolio') || name.includes('website') || name.includes('portfolio')) {
      mappedProfileKey = 'website'
      value = profile?.website || null
    } else if (label.includes('resume') || label.includes('cv') || name.includes('resume') || name.includes('cv')) {
      mappedProfileKey = 'resume'
      value = hasResume ? 'ATTACHED_RESUME' : null
    } else if (label.includes('address') || label.includes('location') || label.includes('city')) {
      mappedProfileKey = 'address'
      value = profile?.address || null
    } else if (label.includes('cover letter') || name.includes('cover_letter')) {
      mappedProfileKey = 'summary'
      value = profile?.summary || null
    }

    mappedFields.push({
      label: field.label,
      name: field.name || '',
      type: field.type || 'text',
      required: !!field.required,
      mappedProfileKey,
      value
    })

    if (field.required && mappedProfileKey && !value) {
      // It's required but the user profile doesn't have it
      missingFields.push(mappedProfileKey === 'resume' ? 'Master Resume PDF' : mappedProfileKey)
    }
  }

  return { mappedFields, missingFields }
}

// AI mapping using Gemini
async function mapFieldsWithAI(fields: any[], profile: any, hasResume: boolean, geminiApiKey: string): Promise<{ mappedFields: FieldMapping[], missingFields: string[] }> {
  try {
    const systemPrompt = `You are an AI assistant that maps form fields extracted from a job application to a candidate's profile.
Here is the candidate's profile data:
${JSON.stringify({
  full_name: profile?.full_name,
  email: profile?.email,
  phone: profile?.phone,
  address: profile?.address,
  website: profile?.website,
  github: profile?.github,
  linkedin: profile?.linkedin,
  summary: profile?.summary,
  has_resume: hasResume
}, null, 2)}

You will be given a list of form fields. For each field, you must decide which key in the profile it maps to, or if it doesn't map to any profile key.
Profile keys you can map to: "full_name", "email", "phone", "address", "website", "github", "linkedin", "summary" (cover letter), "resume".
For each field, return:
1. "label": The original label.
2. "name": The original name attribute.
3. "required": The original required flag.
4. "mappedProfileKey": One of the profile keys above, or null if it cannot be mapped.
5. "value": The corresponding value from the profile (or "ATTACHED_RESUME" if key is "resume" and has_resume is true, or null if no value is available).

Also identify if any required fields are missing in the candidate's profile.
Return a JSON object with this exact format (no markdown blocks, no comments):
{
  "mappedFields": [
    {
      "label": "string",
      "name": "string",
      "type": "string",
      "required": boolean,
      "mappedProfileKey": "string or null",
      "value": "any or null"
    }
  ],
  "missingFields": ["string"]
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nForm Fields to map:\n${JSON.stringify(fields, null, 2)}` }]
            }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    )

    if (response.ok) {
      const resData = await response.json()
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        const result = JSON.parse(text)
        return {
          mappedFields: result.mappedFields || [],
          missingFields: result.missingFields || []
        }
      }
    }
    console.warn('Gemini mapping response not OK, falling back to simple mapping.')
  } catch (err) {
    console.error('Error in AI field mapping:', err)
  }

  return mapFieldsSimple(fields, profile, hasResume)
}

// 1. Detect required fields from the job application form
export const detectRequiredFields = inngest.createFunction(
  { 
    id: 'detect-required-fields',
    concurrency: {
      limit: 1 // Execute one task at a time to avoid conflicts or rate-limit issues
    },
    triggers: [{ event: 'job/apply.start' }]
  },
  async ({ event, step }: { event: any, step: any }) => {
    const { jobId, userId } = event.data

    // Fetch job data from database
    const job = await step.run('fetch-job-from-db', async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      if (error) throw new Error(`Failed to fetch job: ${error.message}`)
      return data
    })

    // Fetch user profile data
    const profile = await step.run('fetch-profile-from-db', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      return data || null
    })

    // Fetch user resumes to see if they have one uploaded
    const hasResume = await step.run('check-resumes-in-db', async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
      return (data && data.length > 0) || false
    })

    const browserbaseApiKey = process.env.BROWSERBASE_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY

    // MOCK SIMULATION MODE (if BROWSERBASE_API_KEY is not set)
    if (!browserbaseApiKey) {
      return await step.run('mock-field-detection', async () => {
        console.log(`[MOCK MODE] Scanning job form for job URL: ${job.job_url}`)
        
        // Update status to Checking Profile
        await supabase
          .from('jobs')
          .update({ application_status: 'Checking Profile' })
          .eq('id', jobId)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Heuristics based on platform type
        let mockFormFields: any[] = []
        const platform = (job.platform || 'greenhouse').toLowerCase()

        if (platform === 'greenhouse') {
          mockFormFields = [
            { label: 'First Name', name: 'first_name', type: 'text', required: true },
            { label: 'Last Name', name: 'last_name', type: 'text', required: true },
            { label: 'Email', name: 'email', type: 'email', required: true },
            { label: 'Phone', name: 'phone', type: 'tel', required: true },
            { label: 'Resume/CV', name: 'resume', type: 'file', required: true },
            { label: 'LinkedIn Profile', name: 'linkedin', type: 'url', required: true },
            { label: 'GitHub URL', name: 'github', type: 'url', required: false }
          ]
        } else if (platform === 'lever') {
          mockFormFields = [
            { label: 'Full Name', name: 'name', type: 'text', required: true },
            { label: 'Email', name: 'email', type: 'email', required: true },
            { label: 'Phone', name: 'phone', type: 'tel', required: true },
            { label: 'Resume/CV', name: 'resume', type: 'file', required: true },
            { label: 'LinkedIn URL', name: 'linkedin', type: 'url', required: true }
          ]
        } else { // workable or generic
          mockFormFields = [
            { label: 'First Name', name: 'first_name', type: 'text', required: true },
            { label: 'Last Name', name: 'last_name', type: 'text', required: true },
            { label: 'Email', name: 'email', type: 'email', required: true },
            { label: 'Phone', name: 'phone', type: 'tel', required: true },
            { label: 'Resume', name: 'resume', type: 'file', required: true }
          ]
        }

        // Map and compare with profile
        const { mappedFields, missingFields } = mapFieldsSimple(mockFormFields, profile, hasResume)

        if (missingFields.length > 0) {
          // Update status as Missing Profile Info
          await supabase
            .from('jobs')
            .update({
              application_status: 'Missing Profile Info',
              required_fields: mappedFields,
              missing_fields: missingFields,
              browserbase_session_id: 'mock-session-scan-' + Math.random().toString(36).substring(7)
            })
            .eq('id', jobId)

          return { success: false, missingFields, status: 'Missing Profile Info' }
        } else {
          // Update status as Ready to Apply
          await supabase
            .from('jobs')
            .update({
              application_status: 'Ready to Apply',
              required_fields: mappedFields,
              missing_fields: []
            })
            .eq('id', jobId)

          // Auto-trigger submission in background
          await inngest.send({
            name: 'job/apply.submit',
            data: { jobId, userId }
          })

          return { success: true, status: 'Ready to Apply' }
        }
      })
    }

    // REAL BROWSERBASE STAGEHAND FLOW
    let stagehand: Stagehand | null = null
    try {
      const scanResult = await step.run('real-browserbase-scan', async () => {
        stagehand = new Stagehand({
          env: 'BROWSERBASE',
          apiKey: browserbaseApiKey,
          model: 'google/gemini-2.0-flash',
          verbose: 1
        })

        await stagehand.init()
        const page = stagehand.context.pages()[0] as any
        await page.goto(job.job_url)

        // Wait for page load
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Extract form elements via Stagehand page extraction on stagehand instance
        const schema = z.object({
          fields: z.array(z.object({
            label: z.string(),
            name: z.string(),
            type: z.string(),
            required: z.boolean()
          }))
        })
        const result = await stagehand.extract(
          'Extract all input elements in the main job application form. For each field, find its visual text label, its HTML input name or id attribute, the input type (text, email, tel, url, file, select, checkbox, textarea), and whether it is marked as required (look for labels containing "*" or "required" text or HTML required attributes). Only include fields related to applicant profile info, resume, or links.',
          schema
        )

        const sessionId = stagehand.browserbaseSessionID || 'unknown'
        await stagehand.close()
        
        return { fields: result.fields || [], sessionId }
      })

      // Run mapping
      const mappingResult = await step.run('map-form-fields', async () => {
        if (geminiApiKey) {
          return await mapFieldsWithAI(scanResult.fields, profile, hasResume, geminiApiKey)
        } else {
          return mapFieldsSimple(scanResult.fields, profile, hasResume)
        }
      })

      const { mappedFields, missingFields } = mappingResult

      // Update job state in DB
      await step.run('update-job-scan-results', async () => {
        const nextStatus = missingFields.length > 0 ? 'Missing Profile Info' : 'Ready to Apply'
        
        await supabase
          .from('jobs')
          .update({
            application_status: nextStatus,
            required_fields: mappedFields,
            missing_fields: missingFields,
            browserbase_session_id: scanResult.sessionId
          })
          .eq('id', jobId)
      })

      if (missingFields.length === 0) {
        // Automatically queue submission
        await inngest.send({
          name: 'job/apply.submit',
          data: { jobId, userId }
        })
      }

      return { success: missingFields.length === 0, missingFields, status: missingFields.length > 0 ? 'Missing Profile Info' : 'Ready to Apply' }

    } catch (err: any) {
      console.error('Error during Stagehand field detection:', err)
      if (stagehand) {
        try { await (stagehand as Stagehand).close() } catch {}
      }

      await step.run('handle-detect-error', async () => {
        await supabase
          .from('jobs')
          .update({
            application_status: 'Failed',
            required_fields: [],
            missing_fields: [],
            browserbase_session_id: stagehand ? (stagehand as Stagehand).browserbaseSessionID : null
          })
          .eq('id', jobId)
      })

      throw err
    }
  }
)

// 2. Submit the job application using profile data and resume
export const submitApplication = inngest.createFunction(
  {
    id: 'submit-job-application',
    concurrency: {
      limit: 1 // Execute one task at a time to avoid conflicts or rate-limit issues
    },
    triggers: [{ event: 'job/apply.submit' }]
  },
  async ({ event, step }: { event: any, step: any }) => {
    const { jobId, userId } = event.data

    // Fetch job data from database
    const job = await step.run('fetch-job-for-submit', async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      if (error) throw new Error(`Failed to fetch job: ${error.message}`)
      return data
    })

    // Fetch user profile data
    const profile = await step.run('fetch-profile-for-submit', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      return data || null
    })

    // Fetch user resumes
    const resumeRecord = await step.run('fetch-resume-file', async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data || null
    })

    const browserbaseApiKey = process.env.BROWSERBASE_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY

    // MOCK SIMULATION MODE (if BROWSERBASE_API_KEY is not set)
    if (!browserbaseApiKey) {
      return await step.run('mock-submit-flow', async () => {
        console.log(`[MOCK MODE] Submitting application for job URL: ${job.job_url}`)

        // Update status to Applying
        await supabase
          .from('jobs')
          .update({ application_status: 'Applying' })
          .eq('id', jobId)

        // Simulate form filling & upload delay
        await new Promise(resolve => setTimeout(resolve, 4000))

        // Check if resume was required and present
        const requiresResume = Array.isArray(job.required_fields) && job.required_fields.some((f: any) => f.mappedProfileKey === 'resume')
        if (requiresResume && !resumeRecord) {
          await supabase
            .from('jobs')
            .update({
              application_status: 'Missing Profile Info',
              missing_fields: ['Master Resume PDF']
            })
            .eq('id', jobId)
          return { success: false, error: 'Resume missing for submission' }
        }

        // Successfully submitted in Mock Mode
        await supabase
          .from('jobs')
          .update({
            application_status: 'Applied',
            applied_status: true,
            browserbase_session_id: job.browserbase_session_id || 'mock-session-submit-' + Math.random().toString(36).substring(7)
          })
          .eq('id', jobId)

        return { success: true, status: 'Applied' }
      })
    }

    // REAL BROWSERBASE STAGEHAND FLOW
    let stagehand: Stagehand | null = null
    let tempResumePath: string | null = null
    
    try {
      // 1. Download resume if exists and needed
      const hasFileField = Array.isArray(job.required_fields) && job.required_fields.some((f: any) => f.mappedProfileKey === 'resume')

      if (hasFileField && resumeRecord?.file_url) {
        tempResumePath = await step.run('download-resume-temp', async () => {
          console.log(`Downloading resume from: ${resumeRecord.file_url}`)
          const response = await fetch(resumeRecord.file_url)
          if (!response.ok) throw new Error('Failed to download resume file from storage')
          
          const buffer = Buffer.from(await response.arrayBuffer())
          
          // Write to a temporary file
          const tempDir = os.tmpdir()
          const safeFileName = `resume_${userId}_${Date.now()}.pdf`
          const filePath = path.join(tempDir, safeFileName)
          
          fs.writeFileSync(filePath, buffer)
          return filePath
        })
      }

      // 2. Run Stagehand submit browser session
      const submitResult = await step.run('real-browserbase-submit', async () => {
        // Update status to Applying
        await supabase
          .from('jobs')
          .update({ application_status: 'Applying' })
          .eq('id', jobId)

        stagehand = new Stagehand({
          env: 'BROWSERBASE',
          apiKey: browserbaseApiKey,
          model: 'google/gemini-2.0-flash',
          verbose: 1
        })

        await stagehand.init()
        const page = stagehand.context.pages()[0] as any
        
        await page.goto(job.job_url)
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Create instructions prompt for form filling using candidate profile
        const detailsPrompt = `Fill in the form fields with the following candidate details:
- Full Name: ${profile?.full_name || ''}
- Email: ${profile?.email || ''}
- Phone Number: ${profile?.phone || ''}
- Address/Location: ${profile?.address || ''}
- LinkedIn: ${profile?.linkedin || ''}
- GitHub: ${profile?.github || ''}
- Personal Website / Portfolio: ${profile?.website || ''}
- Cover Letter Summary: ${profile?.summary || ''}
`

        // Use Stagehand act on stagehand instance
        await stagehand.act(`Fill out the candidate profile details into the form inputs: ${detailsPrompt}. Do not click the submit button yet.`)

        // Upload resume file if required and downloaded
        if (tempResumePath && fs.existsSync(tempResumePath)) {
          console.log(`Attempting to upload resume from path: ${tempResumePath}`)
          
          // Try standard playwright locator for file inputs
          const fileInputs = page.locator('input[type="file"]')
          const fileInputCount = await fileInputs.count()
          
          if (fileInputCount > 0) {
            // Find the most appropriate resume input
            let uploaded = false
            for (let i = 0; i < fileInputCount; i++) {
              const input = fileInputs.nth(i)
              const nameAttr = (await input.getAttribute('name')) || ''
              const idAttr = (await input.getAttribute('id')) || ''
              
              if (nameAttr.includes('resume') || nameAttr.includes('cv') || idAttr.includes('resume') || idAttr.includes('cv')) {
                await input.setInputFiles(tempResumePath)
                uploaded = true
                break
              }
            }
            if (!uploaded) {
              await fileInputs.first().setInputFiles(tempResumePath)
            }
          } else {
            // fallback to Stagehand act on stagehand instance
            await stagehand.act(`Upload the resume file from local path: "${tempResumePath}" to the resume file upload area.`)
          }
        }

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Submit the form on stagehand instance
        await stagehand.act('Click the submit application button (usually labeled "Submit Application", "Submit", or "Apply Now" at the bottom of the form).')

        // Wait for page redirect or confirmation
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Verify success by checking URL or finding confirmation text
        const currentUrl = page.url()
        const bodyText = await page.evaluate(() => document.body.innerText)
        
        const successKeywords = ['thank you', 'submitted', 'success', 'application received', 'confirmation']
        const hasSuccessText = successKeywords.some(keyword => bodyText.toLowerCase().includes(keyword))
        const urlChanged = currentUrl !== job.job_url

        const isSuccess = urlChanged || hasSuccessText
        const finalSessionId = stagehand.browserbaseSessionID || 'unknown'

        await stagehand.close()
        return { success: isSuccess, sessionId: finalSessionId, currentUrl }
      })

      // Clean up temp file
      if (tempResumePath && fs.existsSync(tempResumePath)) {
        fs.unlinkSync(tempResumePath)
      }

      // Update status in DB
      await step.run('update-final-status', async () => {
        if (submitResult.success) {
          await supabase
            .from('jobs')
            .update({
              application_status: 'Applied',
              applied_status: true,
              browserbase_session_id: submitResult.sessionId
            })
            .eq('id', jobId)
        } else {
          await supabase
            .from('jobs')
            .update({
              application_status: 'Failed',
              browserbase_session_id: submitResult.sessionId
            })
            .eq('id', jobId)
        }
      })

      return { success: submitResult.success, status: submitResult.success ? 'Applied' : 'Failed' }

    } catch (err: any) {
      console.error('Error during Stagehand form submission:', err)
      
      // Clean up temp file
      if (tempResumePath && fs.existsSync(tempResumePath)) {
        try { fs.unlinkSync(tempResumePath) } catch {}
      }

      if (stagehand) {
        try { await (stagehand as Stagehand).close() } catch {}
      }

      await step.run('handle-submit-error', async () => {
        await supabase
          .from('jobs')
          .update({
            application_status: 'Failed',
            browserbase_session_id: stagehand ? (stagehand as Stagehand).browserbaseSessionID : null
          })
          .eq('id', jobId)
      })

      throw err
    }
  }
)
