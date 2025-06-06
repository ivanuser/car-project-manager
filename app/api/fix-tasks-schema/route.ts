import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST() {
  try {
    console.log('Starting project_tasks schema fix...')
    
    // Read the SQL fix script
    const sqlPath = join(process.cwd(), 'scripts', 'fix-tasks-schema.sql')
    const sqlScript = await readFile(sqlPath, 'utf-8')
    
    // Execute the schema fix
    await db.query(sqlScript)
    
    console.log('Project_tasks schema fix completed successfully')
    
    // Verify the fix by checking if the new columns exist
    const checkResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'project_tasks' 
      ORDER BY ordinal_position
    `)
    
    const columns = checkResult.rows
    const hasRequiredColumns = {
      priority: columns.some(col => col.column_name === 'priority'),
      build_stage: columns.some(col => col.column_name === 'build_stage'),
      estimated_hours: columns.some(col => col.column_name === 'estimated_hours')
    }
    
    console.log('Schema verification:', hasRequiredColumns)
    
    if (!hasRequiredColumns.priority || !hasRequiredColumns.build_stage || !hasRequiredColumns.estimated_hours) {
      throw new Error('Schema fix did not complete properly - some columns are still missing')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Project tasks schema has been updated successfully!',
      details: {
        columnsAdded: ['priority', 'build_stage', 'estimated_hours'],
        constraintsAdded: ['priority check', 'build_stage check', 'status check'],
        indexesAdded: ['priority', 'build_stage', 'status', 'due_date'],
        verification: hasRequiredColumns
      }
    })
  } catch (error) {
    console.error('Error fixing project_tasks schema:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// Also provide a GET endpoint to check current schema status
export async function GET() {
  try {
    const checkResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'project_tasks' 
      ORDER BY ordinal_position
    `)
    
    const columns = checkResult.rows
    const hasRequiredColumns = {
      id: columns.some(col => col.column_name === 'id'),
      title: columns.some(col => col.column_name === 'title'),
      description: columns.some(col => col.column_name === 'description'),
      status: columns.some(col => col.column_name === 'status'),
      priority: columns.some(col => col.column_name === 'priority'),
      build_stage: columns.some(col => col.column_name === 'build_stage'),
      estimated_hours: columns.some(col => col.column_name === 'estimated_hours'),
      due_date: columns.some(col => col.column_name === 'due_date'),
      project_id: columns.some(col => col.column_name === 'project_id'),
      created_at: columns.some(col => col.column_name === 'created_at'),
      updated_at: columns.some(col => col.column_name === 'updated_at')
    }
    
    const needsFix = !hasRequiredColumns.priority || !hasRequiredColumns.build_stage || !hasRequiredColumns.estimated_hours
    
    return NextResponse.json({
      success: true,
      needsFix,
      currentSchema: hasRequiredColumns,
      allColumns: columns
    })
  } catch (error) {
    console.error('Error checking project_tasks schema:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
