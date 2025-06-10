"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { TimeTrackingData } from "@/utils/report-utils"

Chart.register(...registerables)

interface TimeTrackingChartProps {
  data: TimeTrackingData[]
}

export function TimeTrackingChart({ data }: TimeTrackingChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.projectTitle),
        datasets: [
          {
            label: "Estimated Hours",
            data: data.map((item) => item.estimatedHours),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Actual Hours",
            data: data.map((item) => item.actualHours),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Hours",
            },
          },
          x: {
            title: {
              display: true,
              text: "Projects",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex
                const item = data[index]
                const datasetIndex = context.datasetIndex

                if (datasetIndex === 0) {
                  return `Estimated: ${item.estimatedHours.toFixed(1)} hours`
                } else {
                  return `Actual: ${item.actualHours.toFixed(1)} hours`
                }
              },
              afterBody: (context) => {
                const index = context[0].dataIndex
                const item = data[index]
                const efficiency = item.efficiency

                if (efficiency < 1) {
                  return `Under budget by ${((1 - efficiency) * 100).toFixed(1)}%`
                } else if (efficiency > 1) {
                  return `Over budget by ${((efficiency - 1) * 100).toFixed(1)}%`
                } else {
                  return "On budget"
                }
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
  }, [data])

  return (
    <div className="h-80">
      <canvas ref={chartRef} />
    </div>
  )
}
