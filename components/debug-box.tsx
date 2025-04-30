"use client"

import { useState } from "react"

export function DebugBox() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-md z-50 text-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Debug Info</span>
        <button onClick={() => setVisible(false)} className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded">
          Close
        </button>
      </div>
      <div>
        <p>Canvas rendered: {document.querySelectorAll("canvas").length > 0 ? "Yes" : "No"}</p>
        <p>Window size: {typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "Unknown"}</p>
      </div>
    </div>
  )
}
