import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

// Storage configuration
const STORAGE_BASE_PATH = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage')

/**
 * Ensure a directory exists, create it if it doesn't
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Get file extension from filename or mime type
 */
function getFileExtension(filename: string, mimeType?: string): string {
  // Try to get extension from filename first
  const ext = path.extname(filename).toLowerCase()
  if (ext) return ext

  // Fallback to mime type
  const mimeExtensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg', 
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff'
  }

  return mimeType ? mimeExtensions[mimeType.toLowerCase()] || '.jpg' : '.jpg'
}

/**
 * Save uploaded file to storage
 */
export async function saveUploadedFile(
  file: File,
  category: 'avatars' | 'thumbnails' | 'documents' | 'photos',
  userId?: string
): Promise<{ success: boolean; filePath?: string; url?: string; error?: string }> {
  try {
    // Validate file
    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided or file is empty' }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 10MB limit' }
    }

    // Validate file type for images
    if (category === 'avatars' || category === 'thumbnails' || category === 'photos') {
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' }
      }
    }

    // Create directory structure
    const categoryDir = path.join(STORAGE_BASE_PATH, category)
    const userDir = userId ? path.join(categoryDir, userId) : categoryDir
    
    ensureDirectoryExists(userDir)

    // Generate unique filename
    const fileId = randomUUID()
    const extension = getFileExtension(file.name, file.type)
    const filename = `${fileId}${extension}`
    const filePath = path.join(userDir, filename)

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Generate public URL
    const relativePath = userId ? `${category}/${userId}/${filename}` : `${category}/${filename}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const publicUrl = `${baseUrl}/api/storage/${relativePath}`

    return {
      success: true,
      filePath: relativePath,
      url: publicUrl
    }
  } catch (error) {
    console.error('Error saving uploaded file:', error)
    return {
      success: false,
      error: `Failed to save file: ${(error as Error).message}`
    }
  }
}

/**
 * Delete file from storage
 */
export async function deleteStoredFile(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fullPath = path.join(STORAGE_BASE_PATH, filePath)
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: `Failed to delete file: ${(error as Error).message}`
    }
  }
}

/**
 * Get file info from storage
 */
export async function getFileInfo(filePath: string): Promise<{
  exists: boolean
  size?: number
  mimeType?: string
  error?: string
}> {
  try {
    const fullPath = path.join(STORAGE_BASE_PATH, filePath)
    
    if (!fs.existsSync(fullPath)) {
      return { exists: false }
    }
    
    const stats = fs.statSync(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    
    // Basic mime type detection
    const extensionMimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff'
    }
    
    return {
      exists: true,
      size: stats.size,
      mimeType: extensionMimeTypes[ext] || 'application/octet-stream'
    }
  } catch (error) {
    console.error('Error getting file info:', error)
    return {
      exists: false,
      error: `Failed to get file info: ${(error as Error).message}`
    }
  }
}

/**
 * Clean up old files (utility function)
 */
export async function cleanupOldFiles(
  category: 'avatars' | 'thumbnails' | 'documents' | 'photos',
  maxAgeHours: number = 24 * 7 // 7 days default
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const categoryDir = path.join(STORAGE_BASE_PATH, category)
    
    if (!fs.existsSync(categoryDir)) {
      return { success: true, deletedCount: 0 }
    }
    
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000
    const cutoffTime = Date.now() - maxAgeMs
    let deletedCount = 0
    
    function cleanDirectory(dir: string) {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stats = fs.statSync(itemPath)
        
        if (stats.isDirectory()) {
          cleanDirectory(itemPath)
          // Remove empty directories
          try {
            const dirItems = fs.readdirSync(itemPath)
            if (dirItems.length === 0) {
              fs.rmdirSync(itemPath)
            }
          } catch (e) {
            // Directory might not be empty, ignore
          }
        } else if (stats.isFile() && stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(itemPath)
          deletedCount++
        }
      }
    }
    
    cleanDirectory(categoryDir)
    
    return { success: true, deletedCount }
  } catch (error) {
    console.error('Error cleaning up old files:', error)
    return {
      success: false,
      error: `Failed to cleanup files: ${(error as Error).message}`
    }
  }
}
