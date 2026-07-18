export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  school: string;
  duration: string;
  details: string | null;
}

export interface Project {
  name: string;
  description: string;
  link: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  summary: string | null;
  skills: string[] | null;
  experience: WorkExperience[] | null;
  education: Education[] | null;
  projects: Project[] | null;
  certifications: string[] | null;
  other_details: string | null;
  updated_at?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  parsed_data: Profile | null;
  created_at: string;
}

export interface DbJob {
  id: string;
  user_id: string;
  platform: 'Greenhouse' | 'Lever' | 'Workable';
  title: string;
  company: string;
  company_logo: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  experience_level: string | null;
  description: string | null;
  tags: string[] | null;
  match_score: number;
  job_url: string;
  source_url: string | null;
  applied_status: boolean;
  saved_status: boolean;
  fetched_at: string;
  created_at: string;
}
