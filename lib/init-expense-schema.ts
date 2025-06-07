import db from '@/lib/db'

export async function initializeExpenseSchema() {
  try {
    // Check if expense_reports table exists
    const tableExistsResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'expense_reports'
      );
    `)

    const tableExists = tableExistsResult.rows[0].exists

    // If the table doesn't exist, create it
    if (!tableExists) {
      await db.query(`
        CREATE TABLE expense_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          total_amount DECIMAL(10,2) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'draft',
          user_id UUID NOT NULL,
          project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      // Create indexes
      await db.query(`
        CREATE INDEX idx_expense_reports_user_id ON expense_reports(user_id);
        CREATE INDEX idx_expense_reports_project_id ON expense_reports(project_id);
        CREATE INDEX idx_expense_reports_status ON expense_reports(status);
      `)

      // Create trigger for updated_at
      await db.query(`
        CREATE TRIGGER update_expense_reports_updated_at
        BEFORE UPDATE ON expense_reports
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `)
    }

    // Check if budget_items table has expense_report_id column
    const columnExistsResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'budget_items'
        AND column_name = 'expense_report_id'
      );
    `)

    const columnExists = columnExistsResult.rows[0].exists

    // If the column doesn't exist, add it
    if (!columnExists) {
      await db.query(`
        ALTER TABLE budget_items 
        ADD COLUMN expense_report_id UUID REFERENCES expense_reports(id) ON DELETE SET NULL;
      `)

      // Create index for the new column
      await db.query(`
        CREATE INDEX idx_budget_items_expense_report_id ON budget_items(expense_report_id);
      `)
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing expense schema:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
