// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import authService from '@/lib/auth/production-auth-service';
import db from '@/lib/db';

/**
 * Get the current user ID from the session
 */
async function getCurrentUserId() {
  const cookieStore = cookies();
  // Use the same cookie name as the auth/user endpoint
  const authToken = cookieStore.get('auth-token')?.value;
  
  if (!authToken) {
    console.log("No auth token found in cookies");
    return null;
  }
  
  try {
    // Use the production auth service to validate the session
    const user = await authService.validateSession(authToken);
    if (!user) {
      console.log("Invalid auth token");
      return null;
    }
    
    return user.id;
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
      `SELECT 
        id,
        user_id,
        full_name,
        bio,
        location,
        website,
        expertise_level,
        social_links,
        phone,
        avatar_url,
        created_at,
        updated_at
      FROM profiles WHERE user_id = $1`,
      [userId]
    );
    
    if (profileResult.rows.length === 0) {
      // Profile doesn't exist yet, return default values
      const defaultProfile = {
        id: null,
        user_id: userId,
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

/**
 * PUT /api/user/profile - Update user profile data
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      full_name,
      bio,
      location,
      website,
      expertise_level,
      social_links,
      phone
    } = body;
    
    // Update or insert profile
    const result = await db.query(`
      INSERT INTO profiles (
        user_id, full_name, bio, location, website, 
        expertise_level, social_links, phone, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        bio = EXCLUDED.bio,
        location = EXCLUDED.location,
        website = EXCLUDED.website,
        expertise_level = EXCLUDED.expertise_level,
        social_links = EXCLUDED.social_links,
        phone = EXCLUDED.phone,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      currentUserId,
      full_name || '',
      bio || '',
      location || '',
      website || '',
      expertise_level || 'beginner',
      social_links || {},
      phone || ''
    ]);
    
    const profile = result.rows[0];
    
    return NextResponse.json({ 
      success: true, 
      profile 
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
