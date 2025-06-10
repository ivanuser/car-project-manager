"use server"

import { Pool } from 'pg';

export interface TaskWithProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
  project_title?: string;
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getTasksForReports(): Promise<TaskWithProject[]> {
  try {
    console.log('Executing query for tasks reports...');
    
    // Use proper PostgreSQL JOIN syntax instead of Supabase syntax
    const query = `
      SELECT 
        t.*,
        vp.title as project_title
      FROM tasks t
      LEFT JOIN vehicle_projects vp ON t.project_id = vp.id
      ORDER BY t.created_at DESC
    `;
    
    console.log('Executing query:', query);
    console.log('Query parameters:', []);
    
    const result = await pool.query(query);
    
    console.log('Tasks query result:', result.rows.length, 'rows');
    
    return result.rows.map((task: any) => ({
      ...task,
      project_title: task.project_title || "Unknown Project",
    }));
  } catch (error) {
    console.error("Error fetching tasks for reports:", error);
    return [];
  }
}

export async function getCompletedTasksByDate(startDate: string, endDate: string): Promise<TaskWithProject[]> {
  try {
    console.log('Executing query for completed tasks by date...');
    
    // Use proper PostgreSQL JOIN syntax
    const query = `
      SELECT 
        t.*,
        vp.title as project_title
      FROM tasks t
      LEFT JOIN vehicle_projects vp ON t.project_id = vp.id
      WHERE t.status = $1 
        AND t.completed_at >= $2 
        AND t.completed_at <= $3
      ORDER BY t.completed_at ASC
    `;
    
    const result = await pool.query(query, ['completed', startDate, endDate]);
    
    return result.rows.map((task: any) => ({
      ...task,
      project_title: task.project_title || "Unknown Project",
    }));
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    return [];
  }
}