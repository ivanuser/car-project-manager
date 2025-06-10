import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { saveUploadedFile } from '@/lib/file-storage'
import { getCurrentUserId } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const projectId = formData.get('project_id') as string
    const title = formData.get('title') as string || null
    const description = formData.get('description') as string || null
    const category = formData.get('category') as string || 'general'
    const isBeforePhoto = formData.get('is_before_photo') === 'true'
    const isAfterPhoto = formData.get('is_after_photo') === 'true'
    const isFeatured = formData.get('is_featured') === 'true'
    const takenAt = formData.get('taken_at') as string || null

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project ownership
    const projectCheck = await query(
      'SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    )

    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Save file
    const uploadResult = await saveUploadedFile(photo, 'photos', userId, projectId)

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }

    // Save to database
    const result = await query(
      `INSERT INTO project_photos 
       (project_id, photo_url, thumbnail_url, title, description, category, 
        is_before_photo, is_after_photo, is_featured, taken_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        projectId,
        uploadResult.url,
        uploadResult.url, // TODO: Generate actual thumbnail
        title,
        description,
        category,
        isBeforePhoto,
        isAfterPhoto,
        isFeatured,
        takenAt,
        JSON.stringify({
          originalFilename: uploadResult.fileName,
          size: uploadResult.fileSize,
          type: uploadResult.mimeType
        })
      ]
    )

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        photo_url: result.rows[0].photo_url,
        title: result.rows[0].title,
        category: result.rows[0].category
      }
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
