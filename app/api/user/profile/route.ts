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
  const authToken = cookieStore.get('auth-token')?.value;
  
  console.log("Profile API: Looking for auth-token cookie:", !!authToken);
  
  if (!authToken) {
    console.log("Profile API: No auth token found in cookies");
    return null;
  }
  
  try {
    console.log("Profile API: Validating session with production auth service");
    const user = await authService.validateSession(authToken);
    if (!user) {
      console.log("Profile API: Invalid auth token");
      return null;
    }
    
    console.log("Profile API: Successfully authenticated user:", user.id);
    return user.id;
  } catch (error) {
    console.error("Profile API: Error getting current user ID:", error);
    return null;
  }
}

/**
 * GET /api/user/profile - Get user profile data
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Profile API: Starting GET request");
    
    // Get the user ID from query params
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    console.log("Profile API: Requested user ID:", requestedUserId);
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.log("Profile API: Authentication failed");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use the requested userId or current user ID
    const userId = requestedUserId || currentUserId;
    console.log("Profile API: Using user ID:", userId);
    
    // Security check: only allow access to own profile unless admin
    if (userId !== currentUserId && process.env.NODE_ENV !== 'development') {
      console.log("Profile API: Access denied - user mismatch");
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    console.log("Profile API: Querying database for profile");
    
    // First, let's check what tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%profile%'
    `);
    console.log("Profile API: Available profile tables:", tablesResult.rows);
    
    // Try the query with error handling
    let profileResult;
    try {
      profileResult = await db.query(
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
      console.log("Profile API: Query successful, rows found:", profileResult.rows.length);
    } catch (queryError) {
      console.error("Profile API: Database query failed:", queryError);
      
      // Try alternative table name
      try {
        profileResult = await db.query(
          `SELECT * FROM user_profiles WHERE user_id = $1`,
          [userId]
        );
        console.log("Profile API: Alternative query successful, rows found:", profileResult.rows.length);
      } catch (altError) {
        console.error("Profile API: Alternative query also failed:", altError);
        
        // Return a default profile if table doesn't exist
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
        
        console.log("Profile API: Returning default profile");
        return NextResponse.json({ profile: defaultProfile });
      }
    }
    
    if (profileResult.rows.length === 0) {
      console.log("Profile API: No profile found, returning default");
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
    console.log("Profile API: Found profile:", profile);
    
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
    
    console.log("Profile API: Returning successful response");
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile - Update user profile data
 */
export async function PUT(request: NextRequest) {
  try {
    console.log("Profile API: Starting PUT request");
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.log("Profile API: PUT authentication failed");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log("Profile API: PUT request body:", body);
    
    const {
      full_name,
      bio,
      location,
      website,
      expertise_level,
      social_links,
      phone
    } = body;
    
    console.log("Profile API: Attempting to update profile");
    
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
    console.log("Profile API: Successfully updated profile:", profile);
    
    return NextResponse.json({ 
      success: true, 
      profile 
    });
    
  } catch (error) {
    console.error('Profile API: PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}
