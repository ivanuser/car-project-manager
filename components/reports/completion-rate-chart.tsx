"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { ProjectCompletionRate } from "@/utils/report-utils"

Chart.register(...registerables)

interface CompletionRateChartProps {
  data: ProjectCompletionRate[]
}

export function CompletionRateChart({ data }: CompletionRateChartProps) {
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
            label: "Completion Rate (%)",
            data: data.map((item) => item.completionRate),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
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
            max: 100,
            title: {
              display: true,
              text: "Completion Rate (%)",
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
                return [
                  `Completion Rate: ${item.completionRate.toFixed(1)}%`,
                  `Completed: ${item.completedTasks} / ${item.totalTasks} tasks`,
                ]
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
