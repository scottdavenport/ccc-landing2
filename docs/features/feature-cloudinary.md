# Cloudinary Integration for Sponsor Logos

## Overview
This feature will add support for managing sponsor logos through Cloudinary, integrated with our Supabase sponsor management system.

## Current Status
- [x] Initial configuration setup
- [x] Environment variables defined
- [x] Basic image upload implementation
- [x] Sponsor table schema updates
- [x] Basic UI components for logo management
- [x] Logo thumbnails in admin table
- [x] Logo upload dialog implementation
- [x] Connection status indicators
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
- Added new fields to sponsors table:
  - `image_url`: STRING (Cloudinary URL for full-size image)
  - `cloudinary_public_id`: STRING (Cloudinary public ID for the image)

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
1. ✅ Add logo upload field to sponsor creation form
2. ✅ Add logo thumbnails to sponsor table
3. ✅ Implement logo upload dialog with preview
4. ✅ Add drag-and-drop support for logo uploads
5. ✅ Update sponsors table to display logo thumbnails
6. ✅ Add logo replacement functionality in table
7. ✅ Implement image preview before upload
8. ✅ Add Cloudinary connection status indicator
9. ✅ Add Supabase connection status indicator

## Testing Strategy

### Unit Tests (Jest)
- Image validation functions
- URL transformation utilities
- Component rendering tests
- Error handling scenarios

### Integration Tests (Jest + Testing Library)
- Upload form submission flow
- Error state handling
- State management verification
- Database operations validation

### E2E Tests (Playwright)
- Complete upload workflow
- Image preview functionality
- Database state verification
- Error scenario handling
- Cross-browser compatibility testing

### Test Coverage Goals
- Critical path: 100% coverage
- Error handling: 90% coverage
- Edge cases: 80% coverage

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
Required variables in `.env.development`, `.env.preview`, and `.env.production`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Type Definitions

```typescript
// Return type for image uploads
interface UploadResult {
  url: string;      // The secure URL of the uploaded image
  publicId: string; // The Cloudinary public ID for the image
}

// Internal Cloudinary response type
interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  error?: {
    message: string;
  };
}
```

## API Functions

### uploadImage
Uploads an image file to Cloudinary using the configured upload preset.

```typescript
const uploadImage = async (file: File): Promise<UploadResult>
```

### verifyConfiguration
Verifies that the Cloudinary configuration is valid by attempting to ping the API.

```typescript
const verifyConfiguration = async (): Promise<boolean>
```

## Error Handling
The integration now includes comprehensive error handling:

1. Environment variable validation at startup
2. HTTP error detection during upload
3. Cloudinary-specific error message parsing
4. Type-safe error propagation

## Security Considerations
1. All uploads use HTTPS (secure: true)
2. Upload presets are used instead of API secrets in client-side code
3. Environment variables are properly segregated between client and server
4. Error messages are sanitized before display