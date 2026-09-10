-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they already exist (optional, uncomment if you want a clean slate)
-- DROP TABLE IF EXISTS "admin_users";
-- DROP TABLE IF EXISTS "messages";
-- DROP TABLE IF EXISTS "bookings";
-- DROP TABLE IF EXISTS "properties";

-- Create Properties Table
CREATE TABLE IF NOT EXISTS "properties" (
    "id" VARCHAR(100) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "price" DECIMAL(15, 2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'KES' NOT NULL,
    "propertyType" VARCHAR(50) NOT NULL, -- 'house', 'apartment', 'land', 'commercial', 'villa', 'townhouse'
    "listingType" VARCHAR(50) NOT NULL,  -- 'sale', 'rent'
    "status" VARCHAR(50) DEFAULT 'on-sale' NOT NULL, -- 'on-sale', 'sold', 'rented', 'pending'
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "size" DECIMAL(10, 2) NOT NULL,
    "sizeUnit" VARCHAR(20) DEFAULT 'sq ft' NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "featuredImage" VARCHAR(500) NOT NULL,
    "gallery" TEXT[] NOT NULL DEFAULT '{}',
    "amenities" TEXT[] NOT NULL DEFAULT '{}',
    "yearBuilt" INTEGER,
    "isFeatured" BOOLEAN DEFAULT FALSE NOT NULL,
    "agent" VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS "bookings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "propertyId" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "preferredDate" DATE NOT NULL,
    "preferredTime" VARCHAR(50) NOT NULL,
    "message" TEXT,
    "status" VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "propertyId" VARCHAR(100),
    "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE SET NULL
);

-- Create Admin Users Table
CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" VARCHAR(100) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL, -- Hashed password (bcrypt)
    "name" VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert a default admin user
-- Username: admin
-- Password: admin123 (hashed using bcrypt)
INSERT INTO "admin_users" ("username", "password", "name")
VALUES (
    'admin', 
    '$2a$10$E2Vf7y/4Xm35GZ4Xk.xT4O1p/qf7sLz5l77uU.946t4iGzT.5oRxe', 
    'Administrator'
) ON CONFLICT ("username") DO NOTHING;
