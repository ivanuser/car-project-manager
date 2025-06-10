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
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const categoryId = formData.get('category_id') as string || null
    const projectId = formData.get('project_id') as string || null
    const version = formData.get('version') as string || null
    const isPublic = formData.get('is_public') === 'true'
    const tags = formData.get('tags') as string || null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // If project_id is provided, verify project ownership
    if (projectId) {
      const projectCheck = await query(
        'SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2',
        [projectId, userId]
      )

      if (projectCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
    }

    // Save file
    const uploadResult = await saveUploadedFile(file, 'documents', userId, projectId || undefined)

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }

    // Save to database
    const result = await query(
      `INSERT INTO documents 
       (title, description, file_url, file_type, file_size, file_name, 
        category_id, project_id, user_id, is_public, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        description,
        uploadResult.url,
        uploadResult.mimeType,
        uploadResult.fileSize,
        uploadResult.fileName,
        categoryId,
        projectId,
        userId,
        isPublic,
        version
      ]
    )

    // Handle tags if provided
    if (tags) {
      const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      for (const tagName of tagNames) {
        // Create or get tag
        const tagResult = await query(
          `INSERT INTO document_tags (name, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName, userId]
        )

        // Create tag relation
        await query(
          'INSERT INTO document_tag_relations (document_id, tag_id) VALUES ($1, $2)',
          [result.rows[0].id, tagResult.rows[0].id]
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        file_url: result.rows[0].file_url,
        file_type: result.rows[0].file_type,
        file_size: result.rows[0].file_size
      }
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
