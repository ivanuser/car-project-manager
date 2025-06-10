'use client'

import { useEffect, createContext, useContext, ReactNode, useState } from 'react'
import { useTheme } from 'next-themes'

interface ColorSchemeContextType {
  colorScheme: string
  setColorScheme: (scheme: string) => void
}

const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: 'default',
  setColorScheme: () => {},
})

export const useColorScheme = () => useContext(ColorSchemeContext)

interface ColorSchemeProviderProps {
  children: ReactNode
  defaultColorScheme?: string
}

export function ColorSchemeProvider({
  children,
  defaultColorScheme = 'default',
}: ColorSchemeProviderProps) {
  const { theme } = useTheme()
  const [colorScheme, setColorScheme] = useState(defaultColorScheme)

  // Apply color scheme when it changes
  useEffect(() => {
    applyColorScheme(colorScheme)
  }, [colorScheme])

  // Apply color scheme function
  const applyColorScheme = (scheme: string) => {
    const root = document.documentElement
    
    // Reset all color schemes first
    root.classList.remove('color-blue', 'color-green', 'color-purple', 'color-orange')
    
    // Apply the selected color scheme
    if (scheme && scheme !== 'default') {
      root.classList.add(`color-${scheme}`)
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('caj-color-scheme', scheme)
  }
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedScheme = localStorage.getItem('caj-color-scheme')
    if (savedScheme) {
      setColorScheme(savedScheme)
    }
  }, [])

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}
