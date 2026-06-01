-- Migration: Add missing columns to cv_reviews table
-- Purpose: Support tracking which role was reviewed and link to jobs table

-- 1. Add role_applied column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='cv_reviews' AND column_name='role_applied'
  ) THEN
    ALTER TABLE cv_reviews ADD COLUMN role_applied TEXT;
  END IF;
END $$;

-- 2. Add job_id column if not exists (foreign key to jobs table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='cv_reviews' AND column_name='job_id'
  ) THEN
    ALTER TABLE cv_reviews ADD COLUMN job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for job_id if not exists
CREATE INDEX IF NOT EXISTS idx_cv_reviews_job_id ON cv_reviews(job_id);

-- 3. Verify columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='cv_reviews' AND column_name='role_applied'
  ) THEN
    RAISE NOTICE 'Column role_applied successfully added/verified on cv_reviews';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='cv_reviews' AND column_name='job_id'
  ) THEN
    RAISE NOTICE 'Column job_id successfully added/verified on cv_reviews';
  END IF;
END $$;
