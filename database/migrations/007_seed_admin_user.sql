-- Migration: Seed sample admin user
-- Purpose: Add a sample admin user for testing admin features

-- Insert sample admin user (password: admin123)
-- This admin account is for testing/development purposes
-- In production, create admin users through a secure admin panel
INSERT INTO users (id, full_name, usernama, email, password_hash, role, status)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin',
  'admin@evalify.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/oed5IEFaZGEFiRK0W',  -- admin123 (same as evalify123 for now)
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Update existing demo user to have user role and active status
UPDATE users 
SET role = 'user', status = 'active'
WHERE email = 'demo@evalify.com';
