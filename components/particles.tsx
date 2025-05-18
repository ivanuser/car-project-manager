"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface ParticlesProps {
  className?: string
  quantity?: number
  speed?: number
}

export function Particles({ 
  className = "", 
  quantity = 50, 
  speed = 1 
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    // Call immediately and add resize listener
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    
    // Create particles
    const particles: {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }[] = []
    
    for (let i = 0; i < quantity; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5, // 0.5 to 2.5
        speedX: (Math.random() - 0.5) * speed * 0.5,
        speedY: (Math.random() - 0.5) * speed * 0.5,
        opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7
      })
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Move and draw particles
      for (const particle of particles) {
        // Move particle
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        // Use theme-appropriate color
        const color = isDarkTheme ? `rgba(255, 255, 255, ${particle.opacity})` : `rgba(59, 130, 246, ${particle.opacity})`
        ctx.fillStyle = color
        ctx.fill()
      }
      
      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            
            // Calculate opacity based on distance
            const opacity = 1 - distance / 100
            
            // Use theme-appropriate color
            const color = isDarkTheme 
              ? `rgba(255, 255, 255, ${opacity * 0.15})` 
              : `rgba(59, 130, 246, ${opacity * 0.15})`
              
            ctx.strokeStyle = color
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      
      // Continue animation
      requestAnimationFrame(animate)
    }
    
    // Start animation
    const animationId = requestAnimationFrame(animate)
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [quantity, speed, theme, isDarkTheme])
  
  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
