'use client'

/**
 * Color Theme Service
 * 
 * Provides functions to load and apply color themes from user preferences
 */

/**
 * Apply a color scheme to the document
 * @param colorScheme - The color scheme to apply ('default', 'blue', 'green', 'purple', 'orange')
 */
export function applyColorScheme(colorScheme: string) {
  const root = document.documentElement
  
  // Remove all existing color schemes
  root.classList.remove('color-blue', 'color-green', 'color-purple', 'color-orange')
  
  // Apply the new color scheme if it's not the default
  if (colorScheme && colorScheme !== 'default') {
    root.classList.add(`color-${colorScheme}`)
  }
  
  // Store the preference for next page load
  try {
    localStorage.setItem('caj-color-scheme', colorScheme)
    console.log(`Applied color scheme: ${colorScheme}`)
  } catch (error) {
    console.error('Failed to save color scheme preference:', error)
  }
}

/**
 * Load saved color scheme
 * @returns The saved color scheme or 'default' if none is saved
 */
export function loadColorScheme(): string {
  try {
    const savedScheme = localStorage.getItem('caj-color-scheme')
    return savedScheme || 'default'
  } catch (error) {
    console.error('Failed to load color scheme preference:', error)
    return 'default'
  }
}

/**
 * Initialize the color scheme on page load
 */
export function initColorScheme() {
  // This function should be called on the client side only
  if (typeof window === 'undefined') return
  
  // Load and apply the saved color scheme
  const savedScheme = loadColorScheme()
  applyColorScheme(savedScheme)
  
  return savedScheme
}
