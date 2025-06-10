// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import authService from '@/lib/auth/production-auth-service';
import db from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get the current user ID from the session
 */
async function getCurrentUserId() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  
  console.log("Avatar Upload API: Looking for auth-token cookie:", !!authToken);
  
  if (!authToken) {
    console.log("Avatar Upload API: No auth token found in cookies");
    return null;
  }
  
  try {
    console.log("Avatar Upload API: Validating session with production auth service");
    const user = await authService.validateSession(authToken);
    if (!user) {
      console.log("Avatar Upload API: Invalid auth token");
      return null;
    }
    
    console.log("Avatar Upload API: Successfully authenticated user:", user.id);
    return user.id;
  } catch (error) {
    console.error("Avatar Upload API: Error getting current user ID:", error);
    return null;
  }
}

/**
 * POST /api/uploads/avatars - Upload user avatar
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Avatar Upload API: Starting POST request");
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.log("Avatar Upload API: Authentication failed");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;
    const isRemove = formData.get('remove') === 'true';
    
    console.log("Avatar Upload API: File received:", avatarFile?.name, "Size:", avatarFile?.size);
    console.log("Avatar Upload API: Remove flag:", isRemove);
    
    if (isRemove) {
      // Handle avatar removal
      try {
        await db.query(
          `UPDATE profiles SET
            avatar_url = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1`,
          [currentUserId]
        );
        
        console.log("Avatar Upload API: Avatar removed successfully");
        return NextResponse.json({ 
          success: true, 
          avatarUrl: null,
          message: 'Avatar removed successfully'
        });
      } catch (dbError) {
        console.error("Avatar Upload API: Database error during removal:", dbError);
        return NextResponse.json(
          { error: 'Failed to remove avatar from database' },
          { status: 500 }
        );
      }
    }
    
    if (!avatarFile || avatarFile.size === 0) {
      console.log("Avatar Upload API: No file provided");
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!avatarFile.type.startsWith('image/')) {
      console.log("Avatar Upload API: Invalid file type:", avatarFile.type);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (avatarFile.size > maxSize) {
      console.log("Avatar Upload API: File too large:", avatarFile.size);
      return NextResponse.json(
        { error: 'File too large. Please upload an image smaller than 5MB.' },
        { status: 400 }
      );
    }
    
    // Ensure storage directory exists
    const storageDir = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    const avatarDir = path.join(storageDir, 'avatars');
    
    console.log("Avatar Upload API: Storage directory:", avatarDir);
    
    if (!fs.existsSync(avatarDir)) {
      console.log("Avatar Upload API: Creating avatar directory");
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    
    // Generate unique filename
    const fileExtension = path.extname(avatarFile.name) || '.jpg';
    const fileName = `avatar-${currentUserId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(avatarDir, fileName);
    
    console.log("Avatar Upload API: Saving file to:", filePath);
    
    try {
      // Read file buffer from form data
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      
      // Write file to storage
      fs.writeFileSync(filePath, buffer);
      
      console.log("Avatar Upload API: File saved successfully");
      
      // Generate URL using our API endpoint
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const publicUrl = `${baseUrl}/api/storage/avatars/${fileName}`;
      
      console.log("Avatar Upload API: Generated public URL:", publicUrl);
      
      // Update profile with avatar URL
      try {
        const updateResult = await db.query(
          `UPDATE profiles SET
            avatar_url = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2
          RETURNING avatar_url`,
          [publicUrl, currentUserId]
        );
        
        console.log("Avatar Upload API: Database updated successfully");
        
        // If no rows were updated, the profile doesn't exist yet, so create it
        if (updateResult.rows.length === 0) {
          console.log("Avatar Upload API: Profile doesn't exist, creating new one");
          await db.query(
            `INSERT INTO profiles (
              user_id, avatar_url, full_name, bio, location, website, 
              expertise_level, social_links, phone, created_at, updated_at
            ) VALUES ($1, $2, '', '', '', '', 'beginner', '{}', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [currentUserId, publicUrl]
          );
        }
        
        console.log("Avatar Upload API: Success");
        return NextResponse.json({ 
          success: true, 
          avatarUrl: publicUrl,
          message: 'Avatar uploaded successfully'
        });
        
      } catch (dbError) {
        console.error("Avatar Upload API: Database error:", dbError);
        
        // Clean up the uploaded file since DB update failed
        try {
          fs.unlinkSync(filePath);
          console.log("Avatar Upload API: Cleaned up uploaded file after DB error");
        } catch (cleanupError) {
          console.error("Avatar Upload API: Failed to cleanup file:", cleanupError);
        }
        
        return NextResponse.json(
          { error: 'Failed to update database' },
          { status: 500 }
        );
      }
      
    } catch (fileError) {
      console.error("Avatar Upload API: File operation error:", fileError);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Avatar Upload API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar', details: error.message },
      { status: 500 }
    );
  }
}
