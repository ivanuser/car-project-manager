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
    const receipt = formData.get('receipt') as File
    const budgetItemId = formData.get('budget_item_id') as string || null
    const expenseId = formData.get('expense_id') as string || null

    if (!receipt) {
      return NextResponse.json({ error: 'No receipt image provided' }, { status: 400 })
    }

    // Save file
    const uploadResult = await saveUploadedFile(receipt, 'receipts', userId)

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }

    // Update budget item if provided
    if (budgetItemId) {
      // Verify budget item ownership through project
      const budgetItemCheck = await query(
        `SELECT bi.id FROM budget_items bi
         JOIN vehicle_projects vp ON bi.project_id = vp.id
         WHERE bi.id = $1 AND vp.user_id = $2`,
        [budgetItemId, userId]
      )

      if (budgetItemCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Budget item not found or access denied' }, { status: 404 })
      }

      // Update budget item with receipt URL
      await query(
        'UPDATE budget_items SET receipt_url = $1 WHERE id = $2',
        [uploadResult.url, budgetItemId]
      )
    }

    // TODO: Handle expense report receipts when that feature is implemented

    return NextResponse.json({
      success: true,
      data: {
        receipt_url: uploadResult.url,
        file_name: uploadResult.fileName,
        file_size: uploadResult.fileSize
      }
    })

  } catch (error) {
    console.error('Receipt upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OCR/Scanning endpoint
export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const receipt = formData.get('receipt') as File

    if (!receipt) {
      return NextResponse.json({ error: 'No receipt image provided' }, { status: 400 })
    }

    // Save file temporarily
    const uploadResult = await saveUploadedFile(receipt, 'receipts', userId)

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }

    // TODO: Implement OCR scanning using a service like AWS Textract, Google Vision API, or Azure Cognitive Services
    // For now, return mock data
    const mockScanResult = {
      vendor: 'AutoZone', // Detected from OCR
      date: new Date().toISOString().split('T')[0], // Detected date
      total: 45.99, // Detected total amount
      items: [
        { description: 'Oil Filter', amount: 12.99 },
        { description: 'Motor Oil 5W-30', amount: 28.99 },
        { description: 'Tax', amount: 4.01 }
      ],
      taxAmount: 4.01,
      receipt_url: uploadResult.url
    }

    return NextResponse.json({
      success: true,
      data: mockScanResult
    })

  } catch (error) {
    console.error('Receipt scanning error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
