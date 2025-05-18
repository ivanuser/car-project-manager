"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import db from "@/lib/db"
import jwtUtils from "@/lib/auth/jwt"

// Types
export type MaintenanceSchedule = {
  id: string
  project_id: string
  title: string
  description?: string
  interval_type: "miles" | "months" | "hours"
  interval_value: number
  last_performed_at?: string
  last_performed_value?: number
  next_due_at?: string
  next_due_value?: number
  priority: "low" | "medium" | "high" | "critical"
  status: "upcoming" | "due" | "overdue" | "completed"
  created_at: string
  updated_at: string
}

export type MaintenanceLog = {
  id: string
  schedule_id?: string
  project_id: string
  title: string
  description?: string
  performed_at: string
  performed_value?: number
  cost?: number
  notes?: string
  parts_used?: string[]
  created_at: string
  updated_at: string
}

export type MaintenanceNotification = {
  id: string
  schedule_id: string
  user_id: string
  title: string
  message: string
  status: "unread" | "read" | "dismissed"
  read_at?: string
  notification_type: "upcoming" | "due" | "overdue"
  scheduled_for: string
  created_at: string
  updated_at: string
}

// Helper function to get current user ID
async function getCurrentUserId() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('cajpro_auth_token')?.value;

  if (!authToken) {
    return null;
  }

  return jwtUtils.getUserIdFromToken(authToken);
}

// Fetch maintenance schedules for a project
export async function getMaintenanceSchedules(projectId: string) {
  try {
    // Verify user has access to this project
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    // Check if user owns this project
    const projectResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      console.error("User does not have access to this project");
      return [];
    }

    const result = await db.query(
      `SELECT * FROM maintenance_schedules 
       WHERE project_id = $1 
       ORDER BY next_due_at ASC`,
      [projectId]
    );

    return result.rows as MaintenanceSchedule[];
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    return [];
  }
}

// Fetch all maintenance schedules for the user
export async function getAllMaintenanceSchedules() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    // Get all projects owned by the user
    const projectsResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE user_id = $1`,
      [userId]
    );

    if (projectsResult.rows.length === 0) {
      return [];
    }

    const projectIds = projectsResult.rows.map(project => project.id);

    // Get maintenance schedules for all user's projects
    const result = await db.query(
      `SELECT ms.*, vp.title as project_title 
       FROM maintenance_schedules ms 
       JOIN vehicle_projects vp ON ms.project_id = vp.id 
       WHERE ms.project_id = ANY($1) 
       ORDER BY ms.next_due_at ASC`,
      [projectIds]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching all maintenance schedules:", error);
    return [];
  }
}

// Create a new maintenance schedule
export async function createMaintenanceSchedule(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Authentication required" };
    }

    const projectId = formData.get("project_id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const intervalType = formData.get("interval_type") as "miles" | "months" | "hours";
    const intervalValue = Number.parseInt(formData.get("interval_value") as string);
    const lastPerformedAt = formData.get("last_performed_at") as string;
    const lastPerformedValue = Number.parseInt(formData.get("last_performed_value") as string);
    const priority = formData.get("priority") as "low" | "medium" | "high" | "critical";

    // Verify user owns this project
    const projectResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return { error: "You don't have access to this project" };
    }

    // Calculate next due date based on interval type
    const nextDueAt = new Date(lastPerformedAt);
    let nextDueValue = lastPerformedValue;

    if (intervalType === "months") {
      nextDueAt.setMonth(nextDueAt.getMonth() + intervalValue);
    } else if (intervalType === "miles" || intervalType === "hours") {
      nextDueValue = lastPerformedValue + intervalValue;
    }

    // Insert the new maintenance schedule
    const result = await db.query(
      `INSERT INTO maintenance_schedules (
        project_id, title, description, interval_type, interval_value,
        last_performed_at, last_performed_value, next_due_at, next_due_value, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        projectId, title, description, intervalType, intervalValue,
        lastPerformedAt, lastPerformedValue, nextDueAt.toISOString(), nextDueValue, priority
      ]
    );

    revalidatePath(`/dashboard/projects/${projectId}/maintenance`);
    return { success: true, redirectUrl: `/dashboard/projects/${projectId}/maintenance` };
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    return { error: error instanceof Error ? error.message : "Failed to create maintenance schedule" };
  }
}

// Update a maintenance schedule
export async function updateMaintenanceSchedule(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Authentication required" };
    }

    const id = formData.get("id") as string;
    const projectId = formData.get("project_id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const intervalType = formData.get("interval_type") as "miles" | "months" | "hours";
    const intervalValue = Number.parseInt(formData.get("interval_value") as string);
    const lastPerformedAt = formData.get("last_performed_at") as string;
    const lastPerformedValue = Number.parseInt(formData.get("last_performed_value") as string);
    const priority = formData.get("priority") as "low" | "medium" | "high" | "critical";

    // Verify user owns this project
    const projectResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return { error: "You don't have access to this project" };
    }

    // Calculate next due date based on interval type
    const nextDueAt = new Date(lastPerformedAt);
    let nextDueValue = lastPerformedValue;

    if (intervalType === "months") {
      nextDueAt.setMonth(nextDueAt.getMonth() + intervalValue);
    } else if (intervalType === "miles" || intervalType === "hours") {
      nextDueValue = lastPerformedValue + intervalValue;
    }

    // Update the maintenance schedule
    const result = await db.query(
      `UPDATE maintenance_schedules SET
        title = $1, description = $2, interval_type = $3, interval_value = $4,
        last_performed_at = $5, last_performed_value = $6, next_due_at = $7, 
        next_due_value = $8, priority = $9, updated_at = NOW()
      WHERE id = $10 AND project_id = $11
      RETURNING *`,
      [
        title, description, intervalType, intervalValue,
        lastPerformedAt, lastPerformedValue, nextDueAt.toISOString(),
        nextDueValue, priority, id, projectId
      ]
    );

    if (result.rows.length === 0) {
      return { error: "Maintenance schedule not found or access denied" };
    }

    revalidatePath(`/dashboard/projects/${projectId}/maintenance`);
    return { success: true, redirectUrl: `/dashboard/projects/${projectId}/maintenance` };
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    return { error: error instanceof Error ? error.message : "Failed to update maintenance schedule" };
  }
}

// Delete a maintenance schedule
export async function deleteMaintenanceSchedule(id: string, projectId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Authentication required" };
    }

    // Verify user owns this project
    const projectResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return { error: "You don't have access to this project" };
    }

    // Delete the maintenance schedule
    const result = await db.query(
      `DELETE FROM maintenance_schedules WHERE id = $1 AND project_id = $2`,
      [id, projectId]
    );

    revalidatePath(`/dashboard/projects/${projectId}/maintenance`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete maintenance schedule" };
  }
}

// Log maintenance completion
export async function logMaintenanceCompletion(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Authentication required" };
    }

    const scheduleId = formData.get("schedule_id") as string;
    const projectId = formData.get("project_id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const performedAt = formData.get("performed_at") as string;
    const performedValue = Number.parseInt(formData.get("performed_value") as string);
    const cost = Number.parseFloat(formData.get("cost") as string);
    const notes = formData.get("notes") as string;
    const partsUsed = formData.getAll("parts_used") as string[];

    // Verify user owns this project
    const projectResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return { error: "You don't have access to this project" };
    }

    // Use a transaction for this operation
    return await db.transaction(async (client) => {
      // Insert maintenance log
      const logResult = await client.query(
        `INSERT INTO maintenance_logs (
          schedule_id, project_id, title, description,
          performed_at, performed_value, cost, notes, parts_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          scheduleId, projectId, title, description,
          performedAt, performedValue, cost, notes, JSON.stringify(partsUsed)
        ]
      );

      // Get the schedule to calculate next due date
      const scheduleResult = await client.query(
        `SELECT * FROM maintenance_schedules WHERE id = $1`,
        [scheduleId]
      );

      if (scheduleResult.rows.length === 0) {
        throw new Error("Maintenance schedule not found");
      }

      const schedule = scheduleResult.rows[0];

      // Calculate next due date based on interval type
      const nextDueAt = new Date(performedAt);
      let nextDueValue = performedValue;

      if (schedule.interval_type === "months") {
        nextDueAt.setMonth(nextDueAt.getMonth() + schedule.interval_value);
      } else if (schedule.interval_type === "miles" || schedule.interval_type === "hours") {
        nextDueValue = performedValue + schedule.interval_value;
      }

      // Update the schedule with new last performed and next due dates
      await client.query(
        `UPDATE maintenance_schedules SET
          last_performed_at = $1, last_performed_value = $2,
          next_due_at = $3, next_due_value = $4,
          status = 'upcoming', notification_sent = false,
          notification_sent_at = NULL, updated_at = NOW()
        WHERE id = $5`,
        [
          performedAt, performedValue,
          nextDueAt.toISOString(), nextDueValue,
          scheduleId
        ]
      );

      revalidatePath(`/dashboard/projects/${projectId}/maintenance`);
      return { success: true, redirectUrl: `/dashboard/projects/${projectId}/maintenance` };
    });
  } catch (error) {
    console.error("Error logging maintenance completion:", error);
    return { error: error instanceof Error ? error.message : "Failed to log maintenance completion" };
  }
}

// Get maintenance logs for a project
export async function getMaintenanceLogs(projectId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    // Verify user has access to this project
    const projectResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      console.error("User does not have access to this project");
      return [];
    }

    const result = await db.query(
      `SELECT * FROM maintenance_logs 
       WHERE project_id = $1 
       ORDER BY performed_at DESC`,
      [projectId]
    );

    return result.rows as MaintenanceLog[];
  } catch (error) {
    console.error("Error fetching maintenance logs:", error);
    return [];
  }
}

// Get maintenance notifications for the user
export async function getMaintenanceNotifications() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const result = await db.query(
      `SELECT mn.*, ms.title as schedule_title, ms.project_id, 
              vp.title as project_title
       FROM maintenance_notifications mn
       JOIN maintenance_schedules ms ON mn.schedule_id = ms.id
       JOIN vehicle_projects vp ON ms.project_id = vp.id
       WHERE mn.user_id = $1 AND mn.status = 'unread'
       ORDER BY mn.scheduled_for ASC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error("Error fetching maintenance notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Authentication required" };
    }

    const result = await db.query(
      `UPDATE maintenance_notifications SET
        status = 'read', read_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return { error: "Notification not found or access denied" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error: error instanceof Error ? error.message : "Failed to mark notification as read" };
  }
}

// Dismiss notification
export async function dismissNotification(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Authentication required" };
    }

    const result = await db.query(
      `UPDATE maintenance_notifications SET
        status = 'dismissed', read_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return { error: "Notification not found or access denied" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error dismissing notification:", error);
    return { error: error instanceof Error ? error.message : "Failed to dismiss notification" };
  }
}

// Check for due maintenance and create notifications
export async function checkMaintenanceNotifications() {
  try {
    // Get all maintenance schedules that are due or overdue and haven't sent notifications
    const schedulesResult = await db.query(
      `SELECT ms.*, vp.user_id, vp.title as project_title
       FROM maintenance_schedules ms
       JOIN vehicle_projects vp ON ms.project_id = vp.id
       WHERE (ms.status = 'due' OR ms.status = 'overdue')
       AND ms.notification_sent = false`
    );

    const schedules = schedulesResult.rows;
    if (schedules.length === 0) {
      return { message: "No due maintenance schedules found" };
    }

    // Create notifications for each schedule using a transaction
    return await db.transaction(async (client) => {
      let notificationCount = 0;

      for (const schedule of schedules) {
        const userId = schedule.user_id;
        const projectTitle = schedule.project_title;
        const notificationType = schedule.status;
        const message = `${schedule.title} for ${projectTitle} is ${notificationType}. Please schedule maintenance soon.`;

        // Insert notification
        try {
          await client.query(
            `INSERT INTO maintenance_notifications (
              schedule_id, user_id, title, message,
              notification_type, scheduled_for
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              schedule.id,
              userId,
              `Maintenance ${notificationType}: ${schedule.title}`,
              message,
              notificationType,
              schedule.next_due_at
            ]
          );

          // Mark schedule as having sent notification
          await client.query(
            `UPDATE maintenance_schedules SET
              notification_sent = true,
              notification_sent_at = NOW(),
              updated_at = NOW()
             WHERE id = $1`,
            [schedule.id]
          );

          notificationCount++;
        } catch (insertError) {
          console.error("Error creating notification for schedule:", schedule.id, insertError);
          // Continue with other notifications
        }
      }

      revalidatePath("/dashboard");
      return { message: `Created ${notificationCount} maintenance notifications` };
    });
  } catch (error) {
    console.error("Error checking maintenance notifications:", error);
    return { error: error instanceof Error ? error.message : "Failed to check maintenance notifications" };
  }
}
