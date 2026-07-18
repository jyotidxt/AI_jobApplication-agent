-- SQL setup for AI Job Application Agent
-- Execute this script in your Supabase project SQL Editor to create tables, buckets, and policies.

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    github TEXT,
    linkedin TEXT,
    summary TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    projects JSONB,
    certifications TEXT[],
    other_details TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
CREATE POLICY "Users can select their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = id );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ( (SELECT auth.uid()) = id );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ( (SELECT auth.uid()) = id )
WITH CHECK ( (SELECT auth.uid()) = id );

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    parsed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can select their own resumes" ON public.resumes;
CREATE POLICY "Users can select their own resumes"
ON public.resumes FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
CREATE POLICY "Users can insert their own resumes"
ON public.resumes FOR INSERT
TO authenticated
WITH CHECK ( (SELECT auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
CREATE POLICY "Users can update their own resumes"
ON public.resumes FOR UPDATE
TO authenticated
USING ( (SELECT auth.uid()) = user_id )
WITH CHECK ( (SELECT auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
CREATE POLICY "Users can delete their own resumes"
ON public.resumes FOR DELETE
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

-- Setup Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
-- Allow users to upload files to their own folder
DROP POLICY IF EXISTS "Allow authenticated uploads to resumes bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to resumes bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resumes' AND (SELECT auth.uid())::text = (storage.foldername(name))[1] );

-- Allow users to select/download their own files
DROP POLICY IF EXISTS "Allow users to read their own resumes" ON storage.objects;
CREATE POLICY "Allow users to read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'resumes' AND (SELECT auth.uid())::text = (storage.foldername(name))[1] );

-- Allow users to update their own files
DROP POLICY IF EXISTS "Allow users to update their own resumes" ON storage.objects;
CREATE POLICY "Allow users to update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'resumes' AND (SELECT auth.uid())::text = (storage.foldername(name))[1] );

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Allow users to delete their own resumes" ON storage.objects;
CREATE POLICY "Allow users to delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'resumes' AND (SELECT auth.uid())::text = (storage.foldername(name))[1] );

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL, -- 'greenhouse', 'lever', 'workable', 'wellfound'
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_logo TEXT,
    location TEXT,
    salary TEXT,
    job_type TEXT,
    experience_level TEXT,
    description TEXT,
    tags JSONB,
    match_score INTEGER DEFAULT 0 NOT NULL,
    job_url TEXT NOT NULL,
    source_url TEXT,
    applied_status BOOLEAN DEFAULT false NOT NULL,
    saved_status BOOLEAN DEFAULT false NOT NULL,
    application_status TEXT DEFAULT 'Saved',
    required_fields JSONB DEFAULT '[]'::jsonb,
    missing_fields JSONB DEFAULT '[]'::jsonb,
    browserbase_session_id TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies for jobs
DROP POLICY IF EXISTS "Users can select their own jobs" ON public.jobs;
CREATE POLICY "Users can select their own jobs"
ON public.jobs FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
CREATE POLICY "Users can insert their own jobs"
ON public.jobs FOR INSERT
TO authenticated
WITH CHECK ( (SELECT auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
CREATE POLICY "Users can update their own jobs"
ON public.jobs FOR UPDATE
TO authenticated
USING ( (SELECT auth.uid()) = user_id )
WITH CHECK ( (SELECT auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;
CREATE POLICY "Users can delete their own jobs"
ON public.jobs FOR DELETE
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs(user_id);
