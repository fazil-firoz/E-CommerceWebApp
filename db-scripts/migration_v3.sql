-- =====================================================
-- ToyShop E-Commerce - Migration V3
-- Phase 2: Product Image Card Flag & Card Zoom Settings
-- Run this against toy_shop_db
-- =====================================================

-- Add IsMain and ZoomScale columns to ProductImages table
ALTER TABLE "ProductImages" ADD COLUMN IF NOT EXISTS "IsMain" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "ProductImages" ADD COLUMN IF NOT EXISTS "ZoomScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ProductImages'
ORDER BY ordinal_position;
