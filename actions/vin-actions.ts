"use server"

import { lookupVin } from "@/lib/vin-service"

export async function lookupVehicleByVin(vin: string) {
  try {
    const result = await lookupVin(vin)
    return result
  } catch (error) {
    console.error("VIN lookup action error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during VIN lookup.",
    }
  }
}
