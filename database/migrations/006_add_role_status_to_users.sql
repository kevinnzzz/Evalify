-- Migration: Add role and status columns to users table
-- Purpose: Support admin role management and user account status tracking
-- This migration adds the missing columns that are referenced in the auth.js code

-- 1. Add role column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' 
      CHECK (role IN ('user', 'admin'));
    RAISE NOTICE 'Column role successfully added to users table';
  END IF;
END $$;

-- 2. Add status column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='status'
  ) THEN
    ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'suspended'));
    RAISE NOTICE 'Column status successfully added to users table';
  END IF;
END $$;

-- 3. Create index on role for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Verify columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='role'
  ) THEN
    RAISE NOTICE 'Column role verified on users table';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='status'
  ) THEN
    RAISE NOTICE 'Column status verified on users table';
  END IF;
END $$;
