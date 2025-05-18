import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route handler for serving avatar images
 * @param req - NextRequest object
 * @param params - URL parameters containing the filename
 * @returns Next.js Response object with the image or error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Validate the filename to prevent directory traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }
    
    // Get the storage path from environment variable or use a default
    const storageDir = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    const avatarDir = path.join(storageDir, 'avatars');
    const filePath = path.join(avatarDir, filename);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Avatar file not found: ${filePath}`);
      
      // Return a default avatar placeholder
      const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-avatar.png');
      if (fs.existsSync(placeholderPath)) {
        const buffer = fs.readFileSync(placeholderPath);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
      
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const buffer = fs.readFileSync(filePath);
    
    // Determine the MIME type based on the file extension
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filename.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (filename.endsWith('.webp')) {
      contentType = 'image/webp';
    }
    
    // Return the file with the appropriate content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
