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
 * Get available columns for a table
 */
async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return result.rows.map(row => row.column_name);
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error);
    return [];
  }
}

/**
 * Build a safe SELECT query with only existing columns
 */
function buildSafeSelectQuery(tableName: string, availableColumns: string[], desiredColumns: string[]): string {
  const safeColumns = desiredColumns.filter(col => availableColumns.includes(col));
  
  if (safeColumns.length === 0) {
    return `SELECT * FROM ${tableName}`;
  }
  
  return `SELECT ${safeColumns.join(', ')} FROM ${tableName}`;
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
    
    // Check if this is a debug request
    const isDebugRequest = searchParams.get('debug') === 'true';
    if (isDebugRequest) {
      console.log("Profile API: Debug request - skipping authentication");
      // For debug requests, just return table info
      const tablesResult = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%profile%'
      `);
      
      return NextResponse.json({ 
        debug: true,
        tables: tablesResult.rows,
        message: "Debug request processed"
      });
    }
    
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
      AND table_name IN ('profiles', 'user_profiles')
    `);
    console.log("Profile API: Available profile tables:", tablesResult.rows);
    
    // Define the columns we want
    const desiredColumns = [
      'id', 'user_id', 'full_name', 'bio', 'location', 'website', 
      'expertise_level', 'social_links', 'phone', 'avatar_url', 
      'created_at', 'updated_at'
    ];
    
    // Try the main profiles table first
    let profileResult;
    const profilesTableExists = tablesResult.rows.some(row => row.table_name === 'profiles');
    
    if (profilesTableExists) {
      try {
        console.log("Profile API: Trying profiles table");
        
        // Get available columns for profiles table
        const availableColumns = await getTableColumns('profiles');
        console.log("Profile API: Available columns in profiles table:", availableColumns);
        
        // Build safe query with only existing columns
        const selectQuery = buildSafeSelectQuery('profiles', availableColumns, desiredColumns);
        const fullQuery = `${selectQuery} WHERE user_id = $1`;
        
        console.log("Profile API: Executing query:", fullQuery);
        profileResult = await db.query(fullQuery, [userId]);
        console.log("Profile API: Query successful, rows found:", profileResult.rows.length);
        
      } catch (queryError) {
        console.error("Profile API: Database query failed:", queryError);
        
        // Try alternative table name
        const userProfilesExists = tablesResult.rows.some(row => row.table_name === 'user_profiles');
        if (userProfilesExists) {
          try {
            console.log("Profile API: Trying user_profiles table as fallback");
            const altColumns = await getTableColumns('user_profiles');
            const altQuery = buildSafeSelectQuery('user_profiles', altColumns, desiredColumns);
            const fullAltQuery = `${altQuery} WHERE user_id = $1`;
            
            profileResult = await db.query(fullAltQuery, [userId]);
            console.log("Profile API: Alternative query successful, rows found:", profileResult.rows.length);
          } catch (altError) {
            console.error("Profile API: Alternative query also failed:", altError);
            throw new Error(`Database query failed: ${queryError.message}`);
          }
        } else {
          throw new Error(`Database query failed: ${queryError.message}`);
        }
      }
    } else {
      console.log("Profile API: No profile tables found");
      throw new Error("Profile tables do not exist. Please run database migration.");
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
    
    // Ensure all expected fields exist with defaults
    const normalizedProfile = {
      id: profile.id || null,
      user_id: profile.user_id || userId,
      full_name: profile.full_name || "",
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
      expertise_level: profile.expertise_level || "beginner",
      social_links: profile.social_links || {},
      phone: profile.phone || "",
      avatar_url: profile.avatar_url || null,
      created_at: profile.created_at || new Date(),
      updated_at: profile.updated_at || new Date()
    };
    
    // Process avatar URL if it exists
    if (normalizedProfile.avatar_url) {
      // Check if this is an old Supabase URL that needs conversion
      if (
        normalizedProfile.avatar_url.includes("storage/avatars") || 
        normalizedProfile.avatar_url.includes("storage.googleapis.com") || 
        normalizedProfile.avatar_url.includes("supabase.co")
      ) {
        // Extract the filename from the URL
        const urlParts = normalizedProfile.avatar_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // Convert to our new API endpoint
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        normalizedProfile.avatar_url = `${baseUrl}/api/storage/avatars/${filename}`;
      }
    }
    
    console.log("Profile API: Returning successful response");
    return NextResponse.json({ profile: normalizedProfile });
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
    
    // Check if profiles table exists and get its columns
    const availableColumns = await getTableColumns('profiles');
    console.log("Profile API: Available columns for update:", availableColumns);
    
    if (availableColumns.length === 0) {
      throw new Error("Profiles table does not exist or has no columns. Please run database migration.");
    }
    
    // Build dynamic insert/update query based on available columns
    const updateFields = [];
    const values = [currentUserId]; // user_id is always first parameter
    let paramIndex = 2;
    
    const fieldMappings = {
      full_name: full_name || '',
      bio: bio || '',
      location: location || '',
      website: website || '',
      expertise_level: expertise_level || 'beginner',
      social_links: social_links || {},
      phone: phone || ''
    };
    
    // Only include fields that exist in the table
    for (const [fieldName, fieldValue] of Object.entries(fieldMappings)) {
      if (availableColumns.includes(fieldName)) {
        updateFields.push(`${fieldName} = $${paramIndex}`);
        values.push(fieldValue);
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      throw new Error("No valid columns found for profile update. Table may need migration.");
    }
    
    // Build the upsert query
    const insertColumns = ['user_id', ...Object.keys(fieldMappings).filter(col => availableColumns.includes(col))];
    const insertPlaceholders = insertColumns.map((_, index) => `$${index + 1}`);
    const insertValues = [currentUserId, ...Object.values(fieldMappings).filter((_, index) => 
      availableColumns.includes(Object.keys(fieldMappings)[index])
    )];
    
    // Add timestamps if columns exist
    if (availableColumns.includes('updated_at')) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
    }
    
    const query = `
      INSERT INTO profiles (${insertColumns.join(', ')}${availableColumns.includes('created_at') ? ', created_at' : ''}${availableColumns.includes('updated_at') ? ', updated_at' : ''})
      VALUES (${insertPlaceholders.join(', ')}${availableColumns.includes('created_at') ? ', CURRENT_TIMESTAMP' : ''}${availableColumns.includes('updated_at') ? ', CURRENT_TIMESTAMP' : ''})
      ON CONFLICT (user_id) 
      DO UPDATE SET ${updateFields.join(', ')}
      RETURNING *
    `;
    
    console.log("Profile API: Executing upsert query:", query);
    console.log("Profile API: Query values:", insertValues);
    
    const result = await db.query(query, insertValues);
    
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
