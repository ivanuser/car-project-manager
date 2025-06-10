import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { cookies } from 'next/headers'
import jwtUtils from '@/lib/auth/jwt'
import { saveUploadedFile } from '@/lib/file-storage'
import { revalidatePath } from 'next/cache'

/**
 * Get the current user ID from the session
 * @returns User ID or null if not authenticated
 */
async function getCurrentUserId() {
  console.log('🔍 API getCurrentUserId called');
  const cookieStore = cookies()
  console.log('📌 Available cookies:', cookieStore.getAll().map(c => c.name));
  const authToken = cookieStore.get('auth-token')?.value
  console.log('🎩 Auth token found:', authToken ? 'YES' : 'NO');
  
  if (!authToken) {
    console.log('❌ No auth token found');
    return null
  }
  
  // Validate token and get user ID
  try {
    const payload = jwtUtils.verifyToken(authToken)
    if (!payload) {
      console.log('❌ Token verification failed');
      return null
    }
    
    // Extract user ID from the token
    const userId = payload.sub
    console.log('✅ Token verified, user ID:', userId);
    return userId
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 API POST /api/projects called');
  
  try {
    // Get the current user
    const userId = await getCurrentUserId()
    console.log('👤 Current user ID:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found, returning 401');
      return NextResponse.json(
        { error: "You must be logged in to create a project" },
        { status: 401 }
      )
    }
    
    // Parse the form data
    const formData = await request.formData()
    console.log('📋 FormData received:');
    for (const [key, value] of formData.entries()) {
      console.log(`   ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
    }
    
    // Extract form data
    const title = formData.get("title") as string
    const make = formData.get("make") as string
    const model = formData.get("model") as string
    const year = parseInt(formData.get("year") as string) || null
    const vin = (formData.get("vin") as string) || null
    const description = (formData.get("description") as string) || null
    const projectType = (formData.get("projectType") as string) || null
    const startDate = (formData.get("startDate") as string) || null
    const endDate = (formData.get("endDate") as string) || null
    const budget = formData.get("budget") ? parseFloat(formData.get("budget") as string) : null
    const status = (formData.get("status") as string) || "planning"
    
    // Handle thumbnail upload
    let thumbnailUrl = null
    const thumbnailFile = formData.get("thumbnail") as File
    
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log("Processing thumbnail upload for user:", userId)
      const uploadResult = await saveUploadedFile(thumbnailFile, 'thumbnails', userId)
      
      if (uploadResult.success) {
        thumbnailUrl = uploadResult.url
        console.log("Thumbnail uploaded successfully:", thumbnailUrl)
      } else {
        console.error("Thumbnail upload failed:", uploadResult.error)
        return NextResponse.json(
          { error: `Failed to upload thumbnail: ${uploadResult.error}` },
          { status: 400 }
        )
      }
    }
    
    console.log('💾 Attempting to insert project into database...');
    console.log('📋 Project data:', {
      title, make, model, year, vin, description, projectType,
      startDate, endDate, budget, status, userId, thumbnailUrl
    });
    
    // Insert the project
    const result = await db.query(
      `INSERT INTO vehicle_projects (
        title, make, model, year, vin, description, project_type, 
        start_date, end_date, budget, status, user_id, thumbnail_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title, make, model, year, vin, description, projectType,
        startDate, endDate, budget, status, userId, thumbnailUrl
      ]
    )
    
    console.log('✅ Project inserted successfully:', result.rows[0]);
    
    // Revalidate the projects page
    revalidatePath("/dashboard/projects")
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
    
  } catch (error) {
    console.error("Error creating vehicle project:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
