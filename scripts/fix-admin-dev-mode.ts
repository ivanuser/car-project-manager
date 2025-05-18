"use strict";

/**
 * Fix Admin Dev Mode Script
 * 
 * This script ensures that the admin@cajpro.local user has correctly set up
 * user preferences with a valid UUID.
 */

import db from '../lib/db';

async function fixAdminDevMode() {
  console.log('Starting fix for admin-dev-mode user preferences...');
  
  // Find the admin user to get the proper UUID
  const adminResult = await db.query(
    `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
  );
  
  if (adminResult.rows.length === 0) {
    console.error('Admin user not found. Please ensure admin@cajpro.local exists in the database.');
    process.exit(1);
  }
  
  const adminId = adminResult.rows[0].id;
  console.log(`Found admin user with ID: ${adminId}`);
  
  // Check if the admin has user preferences
  const prefsResult = await db.query(
    `SELECT * FROM user_preferences WHERE id = $1`,
    [adminId]
  );
  
  // If the admin doesn't have preferences, create default ones
  if (prefsResult.rows.length === 0) {
    console.log('Admin user does not have preferences set up. Creating default preferences...');
    
    // Create default preferences
    await db.query(
      `INSERT INTO user_preferences (
        id, theme, color_scheme, background_intensity, ui_density,
        date_format, time_format, measurement_unit, currency,
        notification_preferences, display_preferences,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        adminId, 'system', 'default', 'medium', 'comfortable',
        'MM/DD/YYYY', '12h', 'imperial', 'USD',
        JSON.stringify({
          email: true,
          push: true,
          maintenance: true,
          project_updates: true,
        }),
        JSON.stringify({
          default_project_view: 'grid',
          default_task_view: 'list',
          show_completed_tasks: true,
        }),
        new Date(), new Date()
      ]
    );
    
    console.log('Default preferences created for admin user.');
  } else {
    console.log('Admin user already has preferences set up.');
  }
  
  // Check if there are any orphaned preferences with invalid IDs
  try {
    // This might fail if your IDs are strictly enforced as UUID by the database
    const invalidResult = await db.query(
      `SELECT id FROM user_preferences WHERE id::text = 'admin-dev-mode'`
    );
    
    if (invalidResult.rows.length > 0) {
      console.log('Found invalid user_preferences entries for admin-dev-mode, removing...');
      
      await db.query(
        `DELETE FROM user_preferences WHERE id::text = 'admin-dev-mode'`
      );
      
      console.log('Removed invalid preferences.');
    }
  } catch (error) {
    console.log('No invalid preferences found (expected error if UUID validation is strict).');
  }
  
  console.log('Fix complete. The admin user now has valid preferences.');
  process.exit(0);
}

// Run the script
fixAdminDevMode().catch(error => {
  console.error('Error running fix script:', error);
  process.exit(1);
});
