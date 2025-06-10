import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route handler for checking storage status
 * @param req - NextRequest object
 * @returns Next.js Response object with storage information
 */
export async function GET(req: NextRequest) {
  try {
    // Get the storage path from environment variable or use a default
    const storageDir = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    const avatarDir = path.join(storageDir, 'avatars');
    
    // Create directories if they don't exist
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    
    // Get list of files in avatar directory
    let avatarFiles: string[] = [];
    try {
      avatarFiles = fs.readdirSync(avatarDir);
    } catch (error) {
      console.error('Error reading avatar directory:', error);
    }
    
    // Check if placeholder avatar exists
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-user.jpg');
    const placeholderExists = fs.existsSync(placeholderPath);
    
    // Create storage info object
    const storageInfo = {
      storageDir,
      avatarDir,
      avatarFiles,
      storageDirExists: fs.existsSync(storageDir),
      avatarDirExists: fs.existsSync(avatarDir),
      placeholderPath,
      placeholderExists,
    };
    
    return NextResponse.json({ success: true, storageInfo });
  } catch (error) {
    console.error('Error checking storage status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
