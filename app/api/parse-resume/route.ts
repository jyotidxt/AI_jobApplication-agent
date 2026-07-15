import { NextRequest, NextResponse } from 'next/server'
import { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Extract text from PDF
    let parsedText = ''
    try {
      // Dynamically import pdf-parse and cast as any to bypass TypeScript compilation error
      const pdfParseModule = (await import('pdf-parse')) as any
      const pdf = pdfParseModule.default || pdfParseModule
      const data = await pdf(buffer)
      parsedText = data.text
    } catch (err: any) {
      console.error('Error parsing PDF:', err)
      return NextResponse.json({ error: 'Failed to extract text from PDF: ' + err.message }, { status: 500 })
    }

    if (!parsedText || parsedText.trim().length === 0) {
      return NextResponse.json({ error: 'No text content found in PDF' }, { status: 400 })
    }

    // Call AI to parse and structure
    const geminiKey = process.env.GEMINI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    let parsedJson: Partial<Profile> | null = null

    if (geminiKey) {
      parsedJson = await parseWithGemini(parsedText, geminiKey)
    } else if (openaiKey) {
      parsedJson = await parseWithOpenAI(parsedText, openaiKey)
    } else {
      console.warn('No AI API key found. Falling back to mock parser.')
      parsedJson = generateMockProfile(parsedText)
    }

    if (!parsedJson) {
      return NextResponse.json({ error: 'AI failed to parse the resume structure' }, { status: 500 })
    }

    return NextResponse.json(parsedJson)
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

async function parseWithGemini(text: string, apiKey: string): Promise<Partial<Profile> | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  
  const systemInstruction = `You are an expert resume parsing AI.
Analyze the following resume text and extract all details in the exact JSON format specified below.
Ensure all fields are populated correctly from the resume content.
Do not include any explanation, markdown formatting (no \`\`\`json code blocks), or extra text. Output ONLY valid raw JSON.

JSON Schema:
{
  "full_name": "string or null",
  "phone": "string or null",
  "website": "string or null",
  "github": "string or null",
  "linkedin": "string or null",
  "summary": "string or null",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "responsibilities": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "duration": "string",
      "details": "string or null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "link": "string or null"
    }
  ],
  "certifications": ["string"],
  "other_details": "string or null"
}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemInstruction}\n\nResume Text:\n${text}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textResponse) return null

  return JSON.parse(textResponse)
}

async function parseWithOpenAI(text: string, apiKey: string): Promise<Partial<Profile> | null> {
  const url = 'https://api.openai.com/v1/chat/completions'
  
  const systemInstruction = `You are an expert resume parsing AI.
Analyze the following resume text and extract all details in the exact JSON format specified below.
Ensure all fields are populated correctly from the resume content.
Do not include any explanation, markdown formatting (no \`\`\`json code blocks), or extra text. Output ONLY valid raw JSON.

JSON Schema:
{
  "full_name": "string or null",
  "phone": "string or null",
  "website": "string or null",
  "github": "string or null",
  "linkedin": "string or null",
  "summary": "string or null",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "responsibilities": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "duration": "string",
      "details": "string or null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "link": "string or null"
    }
  ],
  "certifications": ["string"],
  "other_details": "string or null"
}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content
  if (!content) return null

  return JSON.parse(content)
}

function generateMockProfile(text: string): Partial<Profile> {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  
  const emailMatch = text.match(emailRegex)
  const phoneMatch = text.match(phoneRegex)

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const candidateName = lines[0] || 'Candidate Name'

  return {
    full_name: candidateName,
    phone: phoneMatch ? phoneMatch[0] : '+1-555-0199',
    website: 'https://portfolio.example.com',
    github: 'https://github.com/example',
    linkedin: 'https://linkedin.com/in/example',
    summary: 'A skilled professional with experience in software development and technical solutions, parsed via fallback system.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'HTML/CSS'],
    experience: [
      {
        title: 'Software Engineer',
        company: 'Innovate Solutions Inc.',
        duration: 'Jan 2024 - Present',
        responsibilities: [
          'Developed and optimized front-end interfaces using Next.js.',
          'Collaborated with database administrators to create optimized Postgres schemas.',
          'Configured CI/CD deployment pipelines on Vercel.'
        ]
      },
      {
        title: 'Junior Web Developer',
        company: 'WebCraft Studio',
        duration: 'Jun 2022 - Dec 2023',
        responsibilities: [
          'Maintained client web applications and added new responsive features.',
          'Assisted in integrating payment processors and standard auth APIs.'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'State Technical University',
        duration: '2018 - 2022',
        details: 'Graduated with Honors. Specialization in Web Technologies.'
      }
    ],
    projects: [
      {
        name: 'Task Management Application',
        description: 'A full-stack project planner featuring kanban cards and real-time updates.',
        link: 'https://github.com/example/task-manager'
      }
    ],
    certifications: ['AWS Certified Developer - Associate'],
    other_details: 'Mock extraction fallback triggered because neither GEMINI_API_KEY nor OPENAI_API_KEY was found in environment variables.'
  }
}
