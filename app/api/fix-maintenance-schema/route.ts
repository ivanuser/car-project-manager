import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting maintenance schema fix...")

    // Check if maintenance tables already exist
    const tableCheckResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('maintenance_schedules', 'maintenance_logs', 'maintenance_notifications')
    `)

    const existingTables = tableCheckResult.rows.map(row => row.table_name)
    console.log("Existing maintenance tables:", existingTables)

    // Create maintenance_schedules table
    if (!existingTables.includes('maintenance_schedules')) {
      console.log("Creating maintenance_schedules table...")
      await db.query(`
        CREATE TABLE maintenance_schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          interval_type TEXT NOT NULL CHECK (interval_type IN ('miles', 'months', 'hours')),
          interval_value INTEGER NOT NULL CHECK (interval_value > 0),
          last_performed_at TIMESTAMP WITH TIME ZONE,
          last_performed_value INTEGER,
          next_due_at TIMESTAMP WITH TIME ZONE,
          next_due_value INTEGER,
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
          status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue', 'completed')),
          notification_sent BOOLEAN DEFAULT FALSE,
          notification_sent_at TIMESTAMP WITH TIME ZONE
        )
      `)
      console.log("Created maintenance_schedules table")
    } else {
      console.log("maintenance_schedules table already exists")
    }

    // Create maintenance_logs table
    if (!existingTables.includes('maintenance_logs')) {
      console.log("Creating maintenance_logs table...")
      await db.query(`
        CREATE TABLE maintenance_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
          project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
          performed_value INTEGER,
          cost DECIMAL(10, 2),
          notes TEXT,
          parts_used TEXT[]
        )
      `)
      console.log("Created maintenance_logs table")
    } else {
      console.log("maintenance_logs table already exists")
    }

    // Create maintenance_notifications table
    if (!existingTables.includes('maintenance_notifications')) {
      console.log("Creating maintenance_notifications table...")
      await db.query(`
        CREATE TABLE maintenance_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
          read_at TIMESTAMP WITH TIME ZONE,
          notification_type TEXT DEFAULT 'upcoming' CHECK (notification_type IN ('upcoming', 'due', 'overdue')),
          scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `)
      console.log("Created maintenance_notifications table")
    } else {
      console.log("maintenance_notifications table already exists")
    }

    // Create indexes for better performance
    console.log("Creating indexes...")
    
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_project_id ON maintenance_schedules(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_priority ON maintenance_schedules(priority)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due_at ON maintenance_schedules(next_due_at)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_notification_sent ON maintenance_schedules(notification_sent)`,
      
      `CREATE INDEX IF NOT EXISTS idx_maintenance_logs_project_id ON maintenance_logs(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_logs_schedule_id ON maintenance_logs(schedule_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_at ON maintenance_logs(performed_at)`,
      
      `CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_user_id ON maintenance_notifications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_schedule_id ON maintenance_notifications(schedule_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_status ON maintenance_notifications(status)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_notification_type ON maintenance_notifications(notification_type)`
    ]

    for (const query of indexQueries) {
      await db.query(query)
    }
    console.log("Created indexes")

    // Create triggers for updating timestamps
    console.log("Creating update triggers...")
    
    const triggerQueries = [
      `CREATE TRIGGER IF NOT EXISTS update_maintenance_schedules_updated_at
       BEFORE UPDATE ON maintenance_schedules
       FOR EACH ROW EXECUTE PROCEDURE update_updated_at()`,
       
      `CREATE TRIGGER IF NOT EXISTS update_maintenance_logs_updated_at
       BEFORE UPDATE ON maintenance_logs
       FOR EACH ROW EXECUTE PROCEDURE update_updated_at()`,
       
      `CREATE TRIGGER IF NOT EXISTS update_maintenance_notifications_updated_at
       BEFORE UPDATE ON maintenance_notifications
       FOR EACH ROW EXECUTE PROCEDURE update_updated_at()`
    ]

    for (const query of triggerQueries) {
      await db.query(query)
    }
    console.log("Created update triggers")

    // Create function to update maintenance schedule status
    console.log("Creating maintenance status update function...")
    await db.query(`
      CREATE OR REPLACE FUNCTION update_maintenance_schedule_status()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update status based on next_due_at
        IF NEW.next_due_at IS NOT NULL THEN
          IF NEW.next_due_at < NOW() - INTERVAL '7 days' THEN
            NEW.status = 'overdue';
          ELSIF NEW.next_due_at < NOW() THEN
            NEW.status = 'due';
          ELSE
            NEW.status = 'upcoming';
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create trigger for updating maintenance schedule status
    await db.query(`
      DROP TRIGGER IF EXISTS update_maintenance_schedule_status_trigger ON maintenance_schedules;
      CREATE TRIGGER update_maintenance_schedule_status_trigger
      BEFORE INSERT OR UPDATE ON maintenance_schedules
      FOR EACH ROW EXECUTE PROCEDURE update_maintenance_schedule_status();
    `)
    console.log("Created maintenance status update function and trigger")

    // Check if any projects exist to determine success
    const projectsResult = await db.query("SELECT COUNT(*) as count FROM vehicle_projects")
    const projectCount = projectsResult.rows[0].count

    console.log(`Maintenance schema fix completed successfully. Found ${projectCount} projects.`)

    return NextResponse.json({
      success: true,
      message: "Maintenance schema created successfully",
      details: {
        projectCount: parseInt(projectCount),
        tablesCreated: existingTables.length === 0 ? 3 : (3 - existingTables.length),
        existingTables: existingTables
      }
    })

  } catch (error) {
    console.error("Error fixing maintenance schema:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fix maintenance schema"
      },
      { status: 500 }
    )
  }
}
