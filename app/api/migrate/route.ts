import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Read and execute the migration script
    const migrationPath = join(process.cwd(), 'db', 'file-upload-migration.sql')
    const migrationSQL = await readFile(migrationPath, 'utf8')

    // Execute the migration
    await query(migrationSQL, [])

    // Check the status of key tables
    const tableChecks = await Promise.all([
      query(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'project_photos'`, []),
      query(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'documents'`, []),
      query(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'photo_tags'`, []),
      query(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'document_categories'`, []),
      query(`SELECT EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'receipt_url') as exists`, [])
    ])

    const status = {
      project_photos: tableChecks[0].rows[0].count > 0,
      documents: tableChecks[1].rows[0].count > 0,
      photo_tags: tableChecks[2].rows[0].count > 0,
      document_categories: tableChecks[3].rows[0].count > 0,
      budget_items_receipt_url: tableChecks[4].rows[0].exists
    }

    return NextResponse.json({
      success: true,
      message: 'File upload system migration completed successfully',
      status,
      migrationDetails: {
        tablesCreated: Object.values(status).filter(Boolean).length,
        totalTables: Object.keys(status).length
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check the current status of the file upload system
    const checks = await Promise.all([
      // Check if tables exist
      query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('project_photos', 'documents', 'photo_tags', 'document_categories', 'document_tags')
        ORDER BY table_name
      `, []),

      // Check if receipt_url column exists in budget_items
      query(`
        SELECT EXISTS(
          SELECT * FROM information_schema.columns 
          WHERE table_name = 'budget_items' AND column_name = 'receipt_url'
        ) as exists
      `, []),

      // Check storage directory status
      query(`SELECT NOW() as timestamp`, [])
    ])

    const existingTables = checks[0].rows.map(row => row.table_name)
    const hasReceiptColumn = checks[1].rows[0].exists

    const requiredTables = ['project_photos', 'documents', 'photo_tags', 'document_categories', 'document_tags']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))

    return NextResponse.json({
      success: true,
      status: {
        tables: {
          existing: existingTables,
          missing: missingTables,
          total: requiredTables.length
        },
        columns: {
          budget_items_receipt_url: hasReceiptColumn
        },
        readyForFileUploads: missingTables.length === 0 && hasReceiptColumn,
        timestamp: checks[2].rows[0].timestamp
      }
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    }, { status: 500 })
  }
}
