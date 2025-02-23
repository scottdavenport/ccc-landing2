# Cloudinary Integration for Sponsor Logos

## Overview
This feature will add support for managing sponsor logos through Cloudinary, integrated with our Supabase sponsor management system.

## Current Status
- [x] Initial configuration setup
- [x] Environment variables defined
- [x] Basic image upload implementation
- [x] Sponsor table schema updates
- [x] Basic UI components for logo management
- [ ] Testing and validation
- [ ] Logo display in sponsor carousel

## Technical Requirements

### Cloudinary Setup
- Create a dedicated folder/collection in Cloudinary for sponsor logos
- Configure image transformation presets for:
  - Thumbnail versions (for admin table display)
  - Full-size versions (for website display)
- Set up secure upload configurations
- Implement proper error handling for upload failures

### Database Updates
- Add new fields to sponsors table:
  - `logo_url`: STRING (Cloudinary URL for full-size image)
  - `logo_thumbnail_url`: STRING (Cloudinary URL for thumbnail)
  - `logo_uploaded_at`: TIMESTAMP

## Implementation Progress

### Phase 1: Basic Setup 
1. Set up Cloudinary account and create sponsor logos folder
2. Create environment variables for Cloudinary configuration
3. Initialize Cloudinary configuration in the project

### Phase 2: Database Schema (Next)
1. Update Supabase sponsors table with new logo-related fields
2. Create migration scripts
3. Update type definitions
4. Add validation utilities for image URLs

### Phase 3: Upload Flow
1. Implement image upload staging mechanism
2. Create upload progress indicator
3. Handle Cloudinary callback with image URL
4. Implement rollback mechanism if either Cloudinary or Supabase operations fail

### Phase 4: Admin UI Updates
1. Add logo upload field to sponsor creation form
2. Update sponsors table to display logo thumbnails
3. Add logo replacement functionality in table
4. Implement image preview before upload

## Configuration
```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
```

## UI Testing Scenarios

### 1. Basic Upload Flow
- [ ] Upload valid image file through sponsor form
- [ ] Verify upload progress indicator appears
- [ ] Confirm success message after upload
- [ ] Check Cloudinary URL is saved in Supabase

### 2. Error Handling
- [ ] Try uploading invalid file type (e.g., .txt)
- [ ] Test file size limits
- [ ] Test with missing sponsor name
- [ ] Test with invalid sponsor level

### 3. Rollback Testing
- [ ] Force Supabase error by setting invalid UUID for sponsor level
- [ ] Verify image is removed from Cloudinary on Supabase failure
- [ ] Check error message appears in UI
- [ ] Verify form returns to initial state

### 4. Edge Cases
- [ ] Test with slow network connection
- [ ] Test with network interruption during upload
- [ ] Test concurrent uploads
- [ ] Test with very large image files

## Environment Variables
Required variables in `.env.development` and `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret