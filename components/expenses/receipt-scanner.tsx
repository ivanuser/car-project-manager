"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { scanReceipt } from "@/actions/expense-actions-new"

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void
}

export interface ReceiptData {
  vendor: string
  date: string
  total: number
  items?: Array<{
    description: string
    amount: number
  }>
  taxAmount?: number
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)

      // Reset any previous errors
      setScanError(null)
    }
  }

  const handleCapture = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setScanError(null)
  }

  const handleScan = async () => {
    if (!file) return

    setIsScanning(true)
    setScanError(null)

    try {
      const formData = new FormData()
      formData.append("receipt", file)

      const result = await scanReceipt(formData)

      if (result.error) {
        setScanError(result.error)
        toast({
          title: "Scanning failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.data) {
        toast({
          title: "Receipt scanned successfully",
          description: `Detected vendor: ${result.data.vendor}`,
        })
        onScanComplete(result.data)
      }
    } catch (error) {
      console.error("Receipt scanning error:", error)
      setScanError("An unexpected error occurred while scanning the receipt")
      toast({
        title: "Scanning failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Receipt Scanner</CardTitle>
        <CardDescription>Upload a receipt image to automatically extract expense information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            capture="environment"
          />

          {image ? (
            <div className="relative w-full max-w-md h-64 mb-4">
              <img
                src={image || "/placeholder.svg"}
                alt="Receipt"
                className="w-full h-full object-contain rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="w-full max-w-md h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center mb-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={handleCapture}
            >
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to capture or upload a receipt</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={handleCapture} className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>

            <Button
              type="button"
              onClick={handleScan}
              disabled={!image || isScanning}
              className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Scan Receipt
                </>
              )}
            </Button>
          </div>
        </div>

        {scanError && (
          <div className="flex items-center p-3 text-sm border rounded-md bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{scanError}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Supported formats: JPG, PNG, HEIC. For best results, ensure the receipt is well-lit and all text is clearly
          visible.
        </p>
      </CardFooter>
    </Card>
  )
}
