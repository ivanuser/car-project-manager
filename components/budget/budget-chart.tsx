"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { BudgetSummary } from "@/actions/budget-actions"
import { formatCurrency } from "@/utils/format-utils"

// Register Chart.js components
Chart.register(...registerables)

interface BudgetChartProps {
  summary: BudgetSummary
}

export function BudgetChart({ summary }: BudgetChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for the chart
    const categories = summary.categories.filter((cat) => cat.spent > 0 || cat.allocated > 0)
    const labels = categories.map((cat) => cat.name)
    const spentData = categories.map((cat) => cat.spent)
    const allocatedData = categories.map((cat) => cat.allocated)

    // Create the chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Spent",
              data: spentData,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
            {
              label: "Allocated",
              data: allocatedData,
              backgroundColor: "rgba(107, 114, 128, 0.3)",
              borderColor: "rgba(107, 114, 128, 0.5)",
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
              ticks: {
                callback: (value) => formatCurrency(value as number),
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || ""
                  const value = context.parsed.y
                  return `${label}: ${formatCurrency(value)}`
                },
              },
            },
          },
        },
      })
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [summary])

  return <canvas ref={chartRef} />
}
