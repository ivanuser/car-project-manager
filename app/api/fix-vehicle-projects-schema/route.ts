import { NextResponse } from 'next/server'
import db from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    console.log('Starting vehicle_projects schema fix...')

    // Read the schema fix SQL file
    const schemaPath = path.join(process.cwd(), 'db', 'fix-vehicle-projects-schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      return NextResponse.json({ 
        error: 'Schema fix file not found' 
      }, { status: 500 })
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    console.log('Schema fix SQL loaded successfully')

    // Execute the complete SQL script
    const result = await db.query(schemaSQL)
    
    console.log('Schema fix executed successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'vehicle_projects schema fixed successfully',
      details: 'Added missing columns: vin, project_type, start_date, end_date, budget, build_stage'
    })
  } catch (error) {
    console.error('Error fixing vehicle_projects schema:', error)
    return NextResponse.json({ 
      error: 'Failed to fix schema',
      details: (error as Error).message
    }, { status: 500 })
  }
}

export async function POST() {
  // Same as GET for convenience
  return GET()
}
