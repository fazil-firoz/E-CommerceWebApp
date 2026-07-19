-- SQL Schema Script for Toy Shop E-Commerce Database (PostgreSQL)

-- Drop tables if they exist (for easy re-run, but drop in reverse order of FK dependency)
DROP TABLE IF EXISTS "Payments" CASCADE;
DROP TABLE IF EXISTS "OrderItems" CASCADE;
DROP TABLE IF EXISTS "Orders" CASCADE;
DROP TABLE IF EXISTS "Addresses" CASCADE;
DROP TABLE IF EXISTS "Customers" CASCADE;
DROP TABLE IF EXISTS "ProductImages" CASCADE;
DROP TABLE IF EXISTS "Products" CASCADE;
DROP TABLE IF EXISTS "Categories" CASCADE;

-- Categories Table
CREATE TABLE "Categories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" TEXT NULL,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Products Table
CREATE TABLE "Products" (
    "Id" SERIAL PRIMARY KEY,
    "CategoryId" INT NOT NULL REFERENCES "Categories"("Id") ON DELETE CASCADE,
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT NULL,
    "Price" DECIMAL(18, 2) NOT NULL,
    "StockQuantity" INT NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- ProductImages Table
CREATE TABLE "ProductImages" (
    "Id" SERIAL PRIMARY KEY,
    "ProductId" INT NOT NULL REFERENCES "Products"("Id") ON DELETE CASCADE,
    "ImageUrl" VARCHAR(1000) NOT NULL,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Customers Table
CREATE TABLE "Customers" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(150) NOT NULL,
    "PhoneNumber" VARCHAR(20) NOT NULL,
    "IsPhoneVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Addresses Table
CREATE TABLE "Addresses" (
    "Id" SERIAL PRIMARY KEY,
    "CustomerId" INT NOT NULL REFERENCES "Customers"("Id") ON DELETE CASCADE,
    "FullName" VARCHAR(100) NOT NULL,
    "PhoneNumber" VARCHAR(20) NOT NULL,
    "AddressLine1" VARCHAR(250) NOT NULL,
    "AddressLine2" VARCHAR(250) NULL,
    "City" VARCHAR(100) NOT NULL,
    "State" VARCHAR(100) NOT NULL,
    "Pincode" VARCHAR(10) NOT NULL,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Orders Table
CREATE TABLE "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "OrderNumber" VARCHAR(50) NOT NULL UNIQUE,
    "CustomerId" INT NOT NULL REFERENCES "Customers"("Id") ON DELETE CASCADE,
    "AddressId" INT NOT NULL REFERENCES "Addresses"("Id") ON DELETE RESTRICT,
    "OrderDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TotalAmount" DECIMAL(18, 2) NOT NULL,
    "OrderStatus" INT NOT NULL DEFAULT 0, -- OrderStatus Enum: 0 = Pending, 1 = Paid, 2 = Packed, 3 = Shipped, 4 = Delivered, 5 = Cancelled
    "PaymentStatus" INT NOT NULL DEFAULT 0, -- PaymentStatus Enum: 0 = Pending, 1 = Success, 2 = Failed
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- OrderItems Table
CREATE TABLE "OrderItems" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INT NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "ProductId" INT NOT NULL REFERENCES "Products"("Id") ON DELETE RESTRICT,
    "Quantity" INT NOT NULL,
    "UnitPrice" DECIMAL(18, 2) NOT NULL,
    "TotalPrice" DECIMAL(18, 2) NOT NULL,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Payments Table
CREATE TABLE "Payments" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INT NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "TransactionId" VARCHAR(100) NOT NULL,
    "PaymentGateway" VARCHAR(50) NOT NULL DEFAULT 'Razorpay',
    "Amount" DECIMAL(18, 2) NOT NULL,
    "PaymentStatus" INT NOT NULL DEFAULT 0, -- PaymentStatus Enum: 0 = Pending, 1 = Success, 2 = Failed
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Admin Users Table (For authentication, not explicitly in domain design but needed for dashboard)
CREATE TABLE "Admins" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(100) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(500) NOT NULL,
    "FullName" VARCHAR(100) NOT NULL,
    
    -- BaseEntity properties
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" VARCHAR(100) NULL,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE NULL,
    "UpdatedBy" VARCHAR(100) NULL,
    "DeletedDate" TIMESTAMP WITH TIME ZONE NULL,
    "DeletedBy" VARCHAR(100) NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX "IDX_Products_CategoryId" ON "Products"("CategoryId");
CREATE INDEX "IDX_ProductImages_ProductId" ON "ProductImages"("ProductId");
CREATE INDEX "IDX_Addresses_CustomerId" ON "Addresses"("CustomerId");
CREATE INDEX "IDX_Orders_CustomerId" ON "Orders"("CustomerId");
CREATE INDEX "IDX_OrderItems_OrderId" ON "OrderItems"("OrderId");
CREATE INDEX "IDX_Payments_OrderId" ON "Payments"("OrderId");
