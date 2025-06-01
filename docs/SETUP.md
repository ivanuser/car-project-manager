# Caj-Pro Setup Guide

This document provides instructions for setting up the Caj-Pro car project management application.

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (or Supabase account)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/car-project-manager.git
cd car-project-manager
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your specific configuration:

- Add your Supabase URL and keys
- Configure storage settings (server file system vs. Supabase Storage)
- Set other application-specific settings

### 4. Set Up the Database

#### Option 1: Using Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the initialization scripts in the order specified in `/db/README.md`
   - Start with `schema.sql`
   - Follow with the other schema files in the recommended order
   
Alternatively, you can use the comprehensive initialization script:

1. Go to the SQL Editor in Supabase
2. Copy and paste the contents of `/db/init-all.sql`
3. Run the script

#### Option 2: Using PostgreSQL Client

If you're connecting directly to PostgreSQL:

```bash
psql -U your_postgres_user -d your_database -f db/init-all.sql
```

### 5. Set Up File Storage

#### Server File System Storage (Default)

The application is configured to use the server's file system for storage by default.

1. Create a directory for file storage:
   ```bash
   mkdir -p C:\Users\ihoner\Documents\src\caj-pro\storage
   # Or your custom path as configured in .env.local
   ```

2. Ensure the application has read/write permissions to this directory.

#### Supabase Storage (Alternative)

If using Supabase Storage instead:

1. In your Supabase dashboard, create the following buckets:
   - `project-photos`
   - `project-documents`
   - `receipts`
   - `avatars`

2. Set appropriate security policies for each bucket.

3. Update your `.env.local` file:
   ```
   USE_SERVER_STORAGE=false
   ```

### 6. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

The application should now be running at http://localhost:3000.

### 7. Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Sign Up" to create a new account
3. Verify your email if required
4. Log in to start using the application

## Deployment Options

### Vercel Deployment

1. Push your repository to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel
4. Deploy

### Docker Deployment

A Dockerfile and docker-compose.yml are provided for containerized deployment.

```bash
docker-compose up -d
```

### Self-hosted Deployment

For self-hosting on a VPS or dedicated server:

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Database Connection Issues

- Verify your Supabase URL and credentials in `.env.local`
- Check that the database is accessible from your deployment environment
- Ensure tables are created with the correct schema

### File Storage Issues

- Check that the storage directory exists and has correct permissions
- If using Supabase Storage, verify bucket names and policies
- Check environment variables related to storage configuration

### Authentication Problems

- Clear browser cookies and try again
- Verify Supabase authentication settings
- Check for any CORS issues in browser console

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
