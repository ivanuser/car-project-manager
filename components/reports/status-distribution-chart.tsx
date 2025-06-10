"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { StatusDistribution } from "@/utils/report-utils"

Chart.register(...registerables)

interface StatusDistributionChartProps {
  data: StatusDistribution[]
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
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

    // Define colors for different statuses
    const statusColors: Record<string, string> = {
      Todo: "rgba(54, 162, 235, 0.6)",
      "In progress": "rgba(255, 206, 86, 0.6)",
      Completed: "rgba(75, 192, 192, 0.6)",
      Blocked: "rgba(255, 99, 132, 0.6)",
      Unknown: "rgba(201, 203, 207, 0.6)",
    }

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map((item) => item.status),
        datasets: [
          {
            data: data.map((item) => item.count),
            backgroundColor: data.map((item) => statusColors[item.status] || "rgba(201, 203, 207, 0.6)"),
            borderColor: "rgba(255, 255, 255, 0.8)",
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
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex
                const item = data[index]
                return [`${item.status}: ${item.count} tasks`, `${item.percentage.toFixed(1)}% of total`]
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
