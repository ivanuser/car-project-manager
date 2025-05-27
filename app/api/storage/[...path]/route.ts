import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const STORAGE_BASE_PATH = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage')

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', 
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the file path from the dynamic segments
    const filePath = params.path.join('/')
    const fullPath = path.join(STORAGE_BASE_PATH, filePath)
    
    // Security check: ensure the file is within our storage directory
    const resolvedPath = path.resolve(fullPath)
    const resolvedStoragePath = path.resolve(STORAGE_BASE_PATH)
    
    if (!resolvedPath.startsWith(resolvedStoragePath)) {
      console.error('Security violation: Path traversal attempt:', filePath)
      return new NextResponse('Access denied', { status: 403 })
    }
    
    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.error('File not found:', resolvedPath)
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Get file stats
    const stats = fs.statSync(resolvedPath)
    if (!stats.isFile()) {
      console.error('Path is not a file:', resolvedPath)
      return new NextResponse('Not a file', { status: 400 })
    }
    
    // Determine MIME type
    const ext = path.extname(resolvedPath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
    
    // Read file
    const fileBuffer = fs.readFileSync(resolvedPath)
    
    // Set appropriate headers
    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Length': stats.size.toString(),
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': `\"${stats.mtime.getTime()}-${stats.size}\"`,
    })
    
    // Handle conditional requests
    const ifNoneMatch = request.headers.get('if-none-match')
    const etag = headers.get('ETag')
    
    if (ifNoneMatch && etag && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers })
    }
    
    // Return the file
    return new NextResponse(fileBuffer, { headers })
    
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
