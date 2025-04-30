"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Register Chart.js components
Chart.register(...registerables)

export function DemoBudgetChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Parts", "Tools", "Labor", "Miscellaneous", "Remaining"],
        datasets: [
          {
            data: [4500, 2800, 3200, 1500, 6000],
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)", // Parts - Blue
              "rgba(16, 185, 129, 0.8)", // Tools - Green
              "rgba(245, 158, 11, 0.8)", // Labor - Amber
              "rgba(139, 92, 246, 0.8)", // Misc - Purple
              "rgba(229, 231, 235, 0.8)", // Remaining - Gray
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(139, 92, 246,130,246,1)",
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(139, 92, 246, 1)",
              "rgba(229, 231, 235, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: $${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "65%",
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="h-80">
      <canvas ref={chartRef} />
    </div>
  )
}
