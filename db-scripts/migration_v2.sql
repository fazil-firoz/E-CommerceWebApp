-- =====================================================
-- ToyShop E-Commerce - Migration V2
-- Phase 2: Shipping Tracking + Guest Checkout Support
-- Run this against toy_shop_db
-- =====================================================

-- Add shipping tracking columns to Orders table
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "CourierName" TEXT NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "TrackingNumber" TEXT NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "ShippedDate" TIMESTAMPTZ NULL;

-- Add direct customer contact on Order for guest checkout tracking
-- (separate from Customers table - supports guest orders without account)
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "CustomerEmail" TEXT NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "CustomerPhone" TEXT NULL;

-- Future readiness: notification preference columns (do NOT implement yet)
-- ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "NotifyEmail" BOOLEAN NOT NULL DEFAULT FALSE;
-- ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "NotifyWhatsApp" BOOLEAN NOT NULL DEFAULT FALSE;
-- ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "NotifySms" BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Orders'
ORDER BY ordinal_position;
