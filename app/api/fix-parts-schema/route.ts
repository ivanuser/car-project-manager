import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST() {
  try {
    console.log('Starting project_parts schema fix...')
    
    // Read the SQL fix script
    const sqlPath = join(process.cwd(), 'scripts', 'fix-parts-schema.sql')
    const sqlScript = await readFile(sqlPath, 'utf-8')
    
    // Execute the schema fix
    await db.query(sqlScript)
    
    console.log('Project_parts schema fix completed successfully')
    
    // Verify the fix by checking if the new columns exist
    const checkResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'project_parts' 
      ORDER BY ordinal_position
    `)
    
    // Check vendors table exists
    const vendorsTableResult = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'vendors'
    `)
    const vendorsTableExists = vendorsTableResult.rows.length > 0
    
    // Check vendor columns if table exists
    let vendorColumns = {}
    if (vendorsTableExists) {
      const vendorColumnsResult = await db.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'vendors'
      `)
      vendorColumns = {
        website: vendorColumnsResult.rows.some(col => col.column_name === 'website'),
        contact_email: vendorColumnsResult.rows.some(col => col.column_name === 'contact_email'),
        contact_phone: vendorColumnsResult.rows.some(col => col.column_name === 'contact_phone'),
        notes: vendorColumnsResult.rows.some(col => col.column_name === 'notes')
      }
    }
    
    const columns = checkResult.rows
    const hasRequiredColumns = {
      part_number: columns.some(col => col.column_name === 'part_number'),
      image_url: columns.some(col => col.column_name === 'image_url'),
      condition: columns.some(col => col.column_name === 'condition'),
      location: columns.some(col => col.column_name === 'location'),
      vendor_id: columns.some(col => col.column_name === 'vendor_id'),
      notes: columns.some(col => col.column_name === 'notes')
    }
    
    console.log('Schema verification:', { vendorsTableExists, vendorColumns, hasRequiredColumns })
    
    const missingColumns = []
    if (!vendorsTableExists) {
      missingColumns.push('vendors table')
    } else {
      // Check vendor columns
      if (!vendorColumns.website) missingColumns.push('vendors.website')
      if (!vendorColumns.contact_email) missingColumns.push('vendors.contact_email')
      if (!vendorColumns.contact_phone) missingColumns.push('vendors.contact_phone')
      if (!vendorColumns.notes) missingColumns.push('vendors.notes')
    }
    
    // Check parts columns
    if (!hasRequiredColumns.part_number) missingColumns.push('part_number')
    if (!hasRequiredColumns.image_url) missingColumns.push('image_url')
    if (!hasRequiredColumns.condition) missingColumns.push('condition')
    if (!hasRequiredColumns.location) missingColumns.push('location')
    if (!hasRequiredColumns.vendor_id) missingColumns.push('vendor_id')
    if (!hasRequiredColumns.notes) missingColumns.push('notes')
    
    if (missingColumns.length > 0) {
      throw new Error(`Schema fix did not complete properly - missing: ${missingColumns.join(', ')}`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Project parts schema has been updated successfully!',
      details: {
        vendorsTableCreated: vendorsTableExists,
        columnsAdded: ['part_number', 'image_url', 'condition', 'location', 'vendor_id', 'notes'],
        constraintsAdded: ['status check', 'vendor foreign key'],
        indexesAdded: ['project_id', 'status', 'part_number', 'vendor_id', 'condition', 'location'],
        verification: { vendorsTableExists, hasRequiredColumns }
      }
    })
  } catch (error) {
    console.error('Error fixing project_parts schema:', error)
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
      WHERE table_name = 'project_parts' 
      ORDER BY ordinal_position
    `)
    
    // Check vendors table exists
    const vendorsTableResult = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'vendors'
    `)
    const vendorsTableExists = vendorsTableResult.rows.length > 0
    
    // Check vendor columns if table exists
    let vendorColumns = {}
    if (vendorsTableExists) {
      const vendorColumnsResult = await db.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'vendors'
      `)
      vendorColumns = {
        website: vendorColumnsResult.rows.some(col => col.column_name === 'website'),
        contact_email: vendorColumnsResult.rows.some(col => col.column_name === 'contact_email'),
        contact_phone: vendorColumnsResult.rows.some(col => col.column_name === 'contact_phone'),
        notes: vendorColumnsResult.rows.some(col => col.column_name === 'notes')
      }
    }
    
    const columns = checkResult.rows
    const hasRequiredColumns = {
      id: columns.some(col => col.column_name === 'id'),
      name: columns.some(col => col.column_name === 'name'),
      description: columns.some(col => col.column_name === 'description'),
      part_number: columns.some(col => col.column_name === 'part_number'),
      price: columns.some(col => col.column_name === 'price'),
      quantity: columns.some(col => col.column_name === 'quantity'),
      status: columns.some(col => col.column_name === 'status'),
      condition: columns.some(col => col.column_name === 'condition'),
      location: columns.some(col => col.column_name === 'location'),
      vendor_id: columns.some(col => col.column_name === 'vendor_id'),
      notes: columns.some(col => col.column_name === 'notes'),
      image_url: columns.some(col => col.column_name === 'image_url'),
      project_id: columns.some(col => col.column_name === 'project_id'),
      purchase_date: columns.some(col => col.column_name === 'purchase_date'),
      purchase_url: columns.some(col => col.column_name === 'purchase_url'),
      created_at: columns.some(col => col.column_name === 'created_at'),
      updated_at: columns.some(col => col.column_name === 'updated_at')
    }
    
    // Check if fix is needed
    let needsFix = false
    if (!vendorsTableExists) {
      needsFix = true
    } else {
      // Check vendor columns
      if (!vendorColumns.website || !vendorColumns.contact_email || !vendorColumns.contact_phone || !vendorColumns.notes) {
        needsFix = true
      }
    }
    
    // Check parts columns
    if (!hasRequiredColumns.part_number || !hasRequiredColumns.image_url || !hasRequiredColumns.condition || !hasRequiredColumns.location || !hasRequiredColumns.vendor_id || !hasRequiredColumns.notes) {
      needsFix = true
    }
    
    return NextResponse.json({
      success: true,
      needsFix,
      vendorsTableExists,
      vendorColumns,
      currentSchema: hasRequiredColumns,
      allColumns: columns
    })
  } catch (error) {
    console.error('Error checking project_parts schema:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
