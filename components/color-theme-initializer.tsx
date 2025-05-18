'use client'

import { useEffect } from 'react'
import { initColorScheme } from '@/lib/color-theme'

export function ColorThemeInitializer() {
  useEffect(() => {
    // Initialize color scheme when the component mounts (client-side only)
    const savedScheme = initColorScheme()
    console.log('Initialized color scheme:', savedScheme)
  }, [])

  // This component doesn't render anything
  return null
}
