"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Receipt, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { uploadReceiptForBudgetItem, removeReceiptFromBudgetItem } from "@/actions/expense-actions-new"

interface ReceiptUploadProps {
  budgetItemId?: string
  existingReceiptUrl?: string
  onUploadSuccess?: (receiptUrl: string) => void
  onRemoveSuccess?: () => void
  disabled?: boolean
  className?: string
}

export function ReceiptUpload({
  budgetItemId,
  existingReceiptUrl,
  onUploadSuccess,
  onRemoveSuccess,
  disabled = false,
  className = ""
}: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingReceiptUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !budgetItemId) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const result = await uploadReceiptForBudgetItem(budgetItemId, formData)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success && result.data) {
        setPreviewUrl(result.data.receipt_url)
        toast({
          title: "Receipt uploaded",
          description: "Receipt has been attached to this expense",
        })
        onUploadSuccess?.(result.data.receipt_url)
      }
    } catch (error) {
      console.error('Receipt upload error:', error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveReceipt = async () => {
    if (!budgetItemId) return

    setIsRemoving(true)

    try {
      const result = await removeReceiptFromBudgetItem(budgetItemId)

      if (result.error) {
        toast({
          title: "Remove failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setPreviewUrl(null)
        toast({
          title: "Receipt removed",
          description: "Receipt has been removed from this expense",
        })
        onRemoveSuccess?.()
      }
    } catch (error) {
      console.error('Receipt remove error:', error)
      toast({
        title: "Remove failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const handleViewReceipt = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        {previewUrl ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-md">
              <Receipt className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-700 font-medium">Receipt attached</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleViewReceipt}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveReceipt}
                disabled={disabled || isRemoving}
                className="flex-1"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors
                ${disabled || isUploading 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload receipt
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG or GIF up to 10MB
                  </p>
                </div>
              )}
            </div>

            {!disabled && !isUploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Receipt Image
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
