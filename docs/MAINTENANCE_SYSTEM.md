# Maintenance System - CAJ-Pro

## Overview

The maintenance system in CAJ-Pro allows you to track and manage maintenance schedules for all your vehicle projects. This comprehensive system helps you:

- Create recurring maintenance schedules based on time or mileage intervals
- Track maintenance history and costs
- Get notifications when maintenance is due or overdue
- Maintain detailed logs of completed maintenance work

## Features

### 1. Maintenance Schedules
- **Interval Types**: Track maintenance by miles, months, or hours
- **Priority Levels**: Set priority from low to critical
- **Status Tracking**: Automatic status updates (upcoming, due, overdue)
- **Notifications**: Get alerts when maintenance is due

### 2. Maintenance Logs
- **Service History**: Complete record of all maintenance performed
- **Cost Tracking**: Track expenses for each maintenance item
- **Parts Used**: Record which parts were used in each service
- **Notes**: Add detailed notes about the work performed

### 3. Maintenance Notifications
- **Due Alerts**: Automatic notifications when maintenance is due
- **Overdue Warnings**: Alerts for overdue maintenance items
- **Status Management**: Mark notifications as read or dismissed

## Getting Started

### Prerequisites
Before using the maintenance system, ensure that:
1. Your PostgreSQL database is properly set up
2. You have at least one vehicle project created
3. The maintenance database tables have been created

### Setting Up Maintenance Tables
If you see errors about missing maintenance tables, run the schema fix:

1. **Web Interface**: Visit `/fix-maintenance-schema` in your browser
2. **Manual SQL**: Run the script at `scripts/fix-maintenance-schema.sql`
3. **API Call**: POST to `/api/fix-maintenance-schema`

### Creating Your First Maintenance Schedule

1. Navigate to **Maintenance** in the sidebar
2. Click **Add Maintenance Schedule** 
3. Fill in the schedule details:
   - **Title**: Name of the maintenance (e.g., "Oil Change")
   - **Description**: Details about what's involved
   - **Interval Type**: Choose miles, months, or hours
   - **Interval Value**: How often (e.g., 3000 miles, 6 months)
   - **Last Performed**: When was it last done
   - **Priority**: Set the importance level

## Usage Guide

### Maintenance Dashboard
The main maintenance dashboard shows:
- **Overview Cards**: Overdue, due soon, and upcoming maintenance
- **Schedule Tabs**: View maintenance by status
- **Quick Actions**: Easy access to common tasks

### Project-Specific Maintenance
Each project has its own maintenance section:
- Access via **Projects > [Project Name] > Maintenance**
- View maintenance schedules specific to that vehicle
- See complete service history

### Logging Completed Maintenance
When you complete maintenance:
1. Find the maintenance item in your schedule
2. Click **Log Completion**
3. Fill in the completion details:
   - Date performed
   - Current mileage/hours
   - Cost of service
   - Parts used
   - Additional notes

### Managing Notifications
- View notifications on the main dashboard
- Mark as read when acknowledged
- Dismiss notifications you don't need

## Database Schema

The maintenance system uses three main tables:

### maintenance_schedules
- Stores recurring maintenance schedules
- Links to vehicle projects
- Tracks intervals, priorities, and status

### maintenance_logs
- Records completed maintenance work
- Links to schedules and projects
- Stores costs, parts, and notes

### maintenance_notifications
- Manages due/overdue alerts
- User-specific notifications
- Status tracking (unread/read/dismissed)

## API Endpoints

### Maintenance Schedules
- `GET /api/maintenance/schedules` - Get all schedules
- `POST /api/maintenance/schedules` - Create new schedule
- `PUT /api/maintenance/schedules/:id` - Update schedule
- `DELETE /api/maintenance/schedules/:id` - Delete schedule

### Maintenance Logs
- `GET /api/maintenance/logs` - Get maintenance history
- `POST /api/maintenance/logs` - Log completed maintenance

### Notifications
- `GET /api/maintenance/notifications` - Get user notifications
- `PUT /api/maintenance/notifications/:id` - Update notification status

## Troubleshooting

### Common Issues

**1. "Table doesn't exist" errors**
- Solution: Run the maintenance schema fix
- Go to `/fix-maintenance-schema` or use the API endpoint

**2. No maintenance schedules showing**
- Check that you have vehicle projects created
- Verify the database connection is working
- Ensure you're logged in with the correct user

**3. Notifications not working**
- Run the notification check: Call `checkMaintenanceNotifications()`
- Verify maintenance schedules have proper due dates
- Check that status updates are working

**4. Date picker issues**
- Use the enhanced date picker for better year navigation
- Ensure dates are in the correct format
- Check timezone settings

### Database Maintenance

Periodically run these maintenance tasks:

**Update Maintenance Statuses**
```sql
SELECT update_maintenance_schedule_status();
```

**Check for Due Maintenance**
```sql
SELECT * FROM maintenance_schedules 
WHERE next_due_at < NOW() AND status != 'overdue';
```

**Clean Old Notifications**
```sql
DELETE FROM maintenance_notifications 
WHERE status = 'dismissed' AND created_at < NOW() - INTERVAL '30 days';
```

## Best Practices

### Setting Up Schedules
1. **Be Realistic**: Set intervals based on your actual driving/usage
2. **Use Priorities**: Mark critical items (brakes, oil) as high priority
3. **Track Everything**: Include both major and minor maintenance
4. **Update Regularly**: Keep schedules current with completed work

### Logging Maintenance
1. **Be Detailed**: Include comprehensive notes about work performed
2. **Track Costs**: Record all expenses for budgeting
3. **List Parts**: Document all parts used for warranty tracking
4. **Update Immediately**: Log maintenance as soon as it's completed

### Managing Notifications
1. **Regular Checks**: Review notifications weekly
2. **Plan Ahead**: Use "upcoming" notifications to schedule work
3. **Don't Ignore**: Address overdue items promptly
4. **Clean Up**: Dismiss irrelevant notifications

## Support

For additional help with the maintenance system:
1. Check the application logs for error details
2. Verify database connectivity and permissions
3. Ensure all required tables and indexes exist
4. Contact support with specific error messages

## Version History

- **v1.0**: Initial maintenance system implementation
- **v1.1**: Added PostgreSQL compatibility
- **v1.2**: Enhanced notification system
- **v1.3**: Improved schema and status tracking
