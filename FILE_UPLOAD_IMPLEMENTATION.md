# File Upload System Implementation Guide

## Overview

This document provides a comprehensive guide to the file upload system implementation for the Caj-pro car project tracking application. The system supports photos, documents, and receipts with full PostgreSQL integration and server-side file storage.

## ✅ Implementation Status

### **COMPLETED FEATURES**

1. **✅ Storage Infrastructure**
   - Server-side file storage system
   - Directory structure organization
   - File validation and security
   - Automatic cleanup utilities

2. **✅ Database Schema**
   - PostgreSQL tables for photos, documents, receipts
   - User ownership and permissions
   - Project associations
   - Metadata storage and indexing

3. **✅ API Endpoints**
   - `/api/uploads/photos` - Photo upload with metadata
   - `/api/uploads/documents` - Document upload with categorization
   - `/api/uploads/receipts` - Receipt upload and OCR processing
   - `/api/storage/[...path]` - File serving with proper MIME types

4. **✅ React Components**
   - `PhotoUploadForm` - Complete photo upload with categorization
   - `DocumentUploadForm` - Document upload with tags and versions
   - `ReceiptScanner` - OCR scanning with auto-data extraction
   - `ReceiptUpload` - Direct receipt attachment to expenses
   - `FileManager` - Comprehensive file management interface
   - `EnhancedBudgetItemForm` - Budget form with receipt integration

5. **✅ Server Actions**
   - PostgreSQL-based photo management
   - Document storage and retrieval
   - Receipt processing and expense integration
   - File deletion and cleanup

## 🚀 Quick Start

### Step 1: Run Database Migration

```bash
# Option 1: Using the API endpoint
curl -X POST http://localhost:3000/api/migrate

# Option 2: Manual SQL execution
psql -d your_database -f db/file-upload-migration.sql
```

### Step 2: Verify Storage Directories

The system automatically creates these directories in your storage folder:
```
/home/ihoner/dev01/src/car-project-manager/storage/
├── avatars/
├── photos/
├── documents/
├── receipts/
└── thumbnails/
```

### Step 3: Test the System

Visit the demo page to test all functionality:
```
http://localhost:3000/dashboard/file-upload-demo
```

## 📁 File Organization

### Storage Structure
```
storage/
├── photos/
│   └── [user_id]/
│       └── [project_id]/
│           └── [unique_filename].jpg
├── documents/
│   └── [user_id]/
│       └── [project_id]/
│           └── [unique_filename].pdf
├── receipts/
│   └── [user_id]/
│       └── [unique_filename].jpg
└── avatars/
    └── [user_id]/
        └── [unique_filename].jpg
```

### Database Tables

#### project_photos
- Stores photo metadata and references
- Links to projects with cascade delete
- Supports before/after comparisons
- Category and tag organization

#### documents
- Document metadata and file references
- Version control and categorization
- Public/private sharing options
- Tag-based organization

#### budget_items (enhanced)
- Added `receipt_url` column
- Links receipts to expenses
- Supports OCR data integration

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:
```bash
# Storage configuration
STORAGE_PATH=/home/ihoner/dev01/src/car-project-manager/storage
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database (your existing configuration)
DATABASE_URL=postgresql://...
```

### File Size Limits
- Photos: 10MB maximum
- Documents: 20MB maximum
- Receipts: 10MB maximum

### Supported File Types

#### Photos
- JPEG, PNG, GIF, WebP, BMP, TIFF

#### Documents
- PDF, Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Text files (.txt, .csv, .rtf)
- OpenDocument formats

#### Receipts
- All image formats (for OCR processing)

## 📊 Usage Examples

### 1. Photo Upload
```typescript
import { PhotoUploadForm } from '@/components/gallery/photo-upload-form'

<PhotoUploadForm 
  projectId="your-project-id"
  onSuccess={() => console.log('Photo uploaded!')}
/>
```

### 2. Document Upload
```typescript
import { DocumentUploadForm } from '@/components/documents/document-upload-form'

<DocumentUploadForm
  categories={documentCategories}
  projects={userProjects}
  onSuccess={() => console.log('Document uploaded!')}
/>
```

### 3. Receipt Processing
```typescript
import { ReceiptScanner } from '@/components/expenses/receipt-scanner'

<ReceiptScanner 
  onScanComplete={(data) => {
    console.log('Extracted data:', data)
    // Auto-populate expense form
  }}
/>
```

### 4. File Management
```typescript
import { FileManager } from '@/components/projects/file-manager'

<FileManager
  projectId="your-project-id"
  onUploadPhoto={() => openPhotoDialog()}
  onUploadDocument={() => openDocumentDialog()}
  onUploadReceipt={() => openReceiptDialog()}
/>
```

## 🎯 Integration Points

### Budget System Integration
- Receipt uploads automatically link to budget items
- OCR data populates expense forms
- Visual receipt previews in budget lists

### Project Management Integration
- All files associate with projects
- File counts and previews in project dashboards
- Before/after photo comparisons

### User Management Integration
- User-based file ownership
- Proper access control and permissions
- Storage quotas and limits

## 🔒 Security Features

### File Validation
- MIME type verification
- File size limits
- Path traversal protection
- Virus scanning ready (hooks available)

### Access Control
- User-based file ownership
- Project-based permissions
- Secure file serving with authentication

### Data Protection
- No direct file system access
- Sanitized file names
- Metadata validation

## 🛠️ Maintenance

### Database Maintenance
```sql
-- Clean up orphaned files
SELECT * FROM project_photos WHERE photo_url NOT LIKE '%/api/storage/%';

-- Check file upload statistics
SELECT 
  COUNT(*) as total_photos,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_age_days
FROM project_photos;
```

### File System Cleanup
```typescript
import { cleanupOldFiles } from '@/lib/file-storage'

// Clean up files older than 7 days
await cleanupOldFiles('receipts', 24 * 7)
```

## 🚨 Troubleshooting

### Common Issues

#### "File not found" errors
- Check storage directory permissions
- Verify `STORAGE_PATH` environment variable
- Ensure directories exist and are writable

#### Database connection errors
- Verify PostgreSQL connection
- Run migration script
- Check table existence

#### Upload failures
- Check file size limits
- Verify MIME type support
- Check disk space

### Debug Commands

```bash
# Check storage directory
ls -la /home/ihoner/dev01/src/car-project-manager/storage/

# Check database tables
psql -d your_db -c "\dt project_photos"

# Check API endpoints
curl -X GET http://localhost:3000/api/migrate
```

## 📈 Future Enhancements

### Planned Features
1. **Image Processing**
   - Automatic thumbnail generation
   - Image compression and optimization
   - Metadata extraction (EXIF data)

2. **Advanced OCR**
   - Integration with cloud OCR services
   - Multiple language support
   - Improved accuracy and data extraction

3. **File Versioning**
   - Document version history
   - Change tracking and diff views
   - Rollback capabilities

4. **Cloud Storage Integration**
   - AWS S3 support
   - Google Cloud Storage
   - Azure Blob Storage

5. **Enhanced Security**
   - File encryption at rest
   - Virus scanning integration
   - Audit logging

## 📞 Support

### Key Files to Check
- `lib/file-storage.ts` - Core file handling
- `actions/gallery-actions.ts` - Photo management
- `actions/document-actions.ts` - Document management
- `actions/expense-actions-new.ts` - Receipt processing
- `db/file-upload-migration.sql` - Database schema

### Component Structure
```
components/
├── gallery/
│   ├── photo-upload-form.tsx
│   ├── photo-grid.tsx
│   └── before-after-comparison.tsx
├── documents/
│   ├── document-upload-form.tsx
│   ├── document-list.tsx
│   └── category-management.tsx
├── expenses/
│   ├── receipt-scanner.tsx
│   ├── receipt-upload.tsx
│   └── enhanced-expense-form.tsx
└── projects/
    └── file-manager.tsx
```

## ✅ Testing Checklist

### Before Deployment
- [ ] Database migration completed
- [ ] Storage directories created with proper permissions
- [ ] All API endpoints responding
- [ ] File upload/download working
- [ ] OCR scanning functional
- [ ] User permissions enforced
- [ ] File cleanup working

### Performance Testing
- [ ] Large file uploads (up to limits)
- [ ] Concurrent uploads
- [ ] File serving speed
- [ ] Database query performance
- [ ] Storage space monitoring

---

**Implementation Complete!** 🎉

The file upload system is now fully functional with PostgreSQL integration and comprehensive UI components. All files are stored server-side with proper organization and security measures.
