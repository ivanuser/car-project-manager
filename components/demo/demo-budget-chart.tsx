"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function DemoBudgetChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Engine", "Suspension", "Body Work", "Interior", "Electrical", "Wheels & Tires", "Other"],
        datasets: [
          {
            data: [3200, 1800, 2400, 1200, 800, 1500, 300],
            backgroundColor: [
              "rgba(234, 88, 12, 0.8)",
              "rgba(22, 163, 74, 0.8)",
              "rgba(37, 99, 235, 0.8)",
              "rgba(217, 70, 239, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(6, 182, 212, 0.8)",
              "rgba(107, 114, 128, 0.8)",
            ],
            borderColor: [
              "rgba(234, 88, 12, 1)",
              "rgba(22, 163, 74, 1)",
              "rgba(37, 99, 235, 1)",
              "rgba(217, 70, 239, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(6, 182, 212, 1)",
              "rgba(107, 114, 128, 1)",
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
            position: "right",
            labels: {
              boxWidth: 15,
              padding: 15,
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
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return <canvas ref={chartRef} />
}
