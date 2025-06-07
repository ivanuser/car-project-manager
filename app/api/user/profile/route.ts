// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwtUtils from '@/lib/auth/jwt';
import db from '@/lib/db';

/**
 * Get the current user ID from the session
 */
async function getCurrentUserId() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('cajpro_auth_token')?.value;
  
  if (!authToken) {
    console.log("No auth token found in cookies");
    return null;
  }
  
  try {
    const payload = jwtUtils.verifyToken(authToken);
    if (!payload) {
      console.log("Invalid auth token");
      return null;
    }
    
    return payload.sub;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * GET /api/user/profile - Get user profile data
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from query params
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use the requested userId or current user ID
    const userId = requestedUserId || currentUserId;
    
    // Security check: only allow access to own profile unless admin
    if (userId !== currentUserId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Query the database for profile
    const profileResult = await db.query(
      `SELECT * FROM profiles WHERE id = $1`,
      [userId]
    );
    
    if (profileResult.rows.length === 0) {
      // Profile doesn't exist yet, return default values
      const defaultProfile = {
        id: userId,
        full_name: "",
        bio: "",
        location: "",
        website: "",
        expertise_level: "beginner",
        social_links: {},
        phone: "",
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      return NextResponse.json({ profile: defaultProfile });
    }
    
    const profile = profileResult.rows[0];
    
    // Process avatar URL if it exists
    if (profile.avatar_url) {
      // Check if this is an old Supabase URL that needs conversion
      if (
        profile.avatar_url.includes("storage/avatars") || 
        profile.avatar_url.includes("storage.googleapis.com") || 
        profile.avatar_url.includes("supabase.co")
      ) {
        // Extract the filename from the URL
        const urlParts = profile.avatar_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // Convert to our new API endpoint
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        profile.avatar_url = `${baseUrl}/api/storage/avatars/${filename}`;
      }
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
