-- Migration: Add thumbnail_url column to photos table
-- Run in Supabase SQL Editor — 2026-05-29

ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Backfill existing Unsplash photos with optimized thumbnail URLs
UPDATE photos
SET thumbnail_url = url || CASE WHEN url LIKE '%?%' THEN '&' ELSE '?' END || 'w=400&q=60'
WHERE url LIKE '%unsplash.com%' AND thumbnail_url IS NULL;

-- Verify
SELECT id, title, thumbnail_url IS NOT NULL AS has_thumbnail FROM photos LIMIT 10;
