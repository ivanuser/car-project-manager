import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route handler for serving avatar images
 * @param req - NextRequest object
 * @returns Next.js Response object with the image or error
 */
export async function GET(req: NextRequest) {
  try {
    // Get the placeholder avatar image
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-user.jpg');
    
    // Check if the placeholder exists
    if (!fs.existsSync(placeholderPath)) {
      return NextResponse.json(
        { error: 'Placeholder avatar not found' },
        { status: 404 }
      );
    }
    
    // Read the placeholder image
    const buffer = fs.readFileSync(placeholderPath);
    
    // Return the image with the appropriate content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving placeholder avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
