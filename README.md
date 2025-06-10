# CAJPRO - Car Project Management

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/honerivan-gmailcoms-projects/v0-cajpro)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/CkplaSuN2ld)

## Overview

CAJPRO is a comprehensive web application designed to help car enthusiasts and mechanics manage their vehicle projects efficiently. From tracking expenses and maintenance logs to managing parts inventory and project timelines, CAJPRO provides a centralized platform for all your automotive project needs.

## Features

*   **Authentication:** Secure user registration and login.
*   **Project Management:** Create and manage multiple car projects, track progress, and set milestones.
*   **Budget Tracking:** Monitor project expenses and manage budgets effectively.
*   **Document Management:** Store and organize project-related documents, such as invoices, manuals, and registration papers.
*   **Expense Tracking:** Keep a detailed record of all project-related expenses with receipt scanning and categorization.
*   **Photo Gallery:** Upload and manage project photos, including before/after comparisons.
*   **Maintenance Logs:** Schedule and log vehicle maintenance activities.
*   **Parts Inventory:** Manage a list of parts, track their status, and associate them with projects.
*   **Task Management:** Create and assign tasks for different project stages.
*   **Vendor Management:** Store contact information and details for preferred vendors.
*   **Reporting & Analytics:** Generate reports on project progress, expenses, and more.
*   **User Profile Management:** Users can manage their profile information and application preferences.
*   **Admin Dashboard:** For administrative users to manage users, system settings, and view system health.

## Tech Stack

*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS
*   **Backend:** Next.js API Routes
*   **Database:** PostgreSQL (compatible with Supabase)
*   **UI Components:** shadcn/ui, Radix UI
*   **Forms:** React Hook Form with Zod for validation
*   **Charting:** Chart.js
*   **Authentication:** Custom solution using bcryptjs and JWT

## Prerequisites

*   Node.js (v18 or higher)
*   npm or pnpm
*   PostgreSQL database (or a Supabase account)
*   Git

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cajpro-auth.git # Replace with the actual repository URL if different
cd cajpro-auth
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```
Or using pnpm:
```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.local.example .env.local
```

Edit the `.env.local` file with your specific configuration. Key variables to set include:

*   `POSTGRES_URL` or Supabase connection details
*   `JWT_SECRET` for authentication
*   `USE_SERVER_STORAGE` (true/false) and `STORAGE_PATH` if using local file storage
*   Supabase URL and Anon Key if using Supabase for database or storage

Refer to `docs/SETUP.md` for more detailed environment variable configuration.

### 4. Set Up the Database

You can initialize your PostgreSQL database using the provided SQL scripts.

**Option 1: Using a PostgreSQL client (e.g., psql)**

Connect to your PostgreSQL database and run the main initialization script:
```bash
psql -U your_postgres_user -d your_database_name -f db/init-all.sql
```
Make sure to replace `your_postgres_user` and `your_database_name` with your actual database credentials.

**Option 2: Using Supabase SQL Editor**

1.  Log in to your Supabase dashboard.
2.  Navigate to the SQL Editor.
3.  Copy and paste the contents of `db/init-all.sql` into the editor and run the script.
    (Alternatively, run scripts from the `/db` directory in the order specified in `db/README.md` if it exists, starting with `schema.sql` or individual schema files like `auth-schema.sql`, `project-schema.sql`, etc.)

### 5. Set Up File Storage (If Applicable)

If you're using local file storage (`USE_SERVER_STORAGE=true` in `.env.local`):

1.  Create the storage directory specified in `STORAGE_PATH` (e.g., `mkdir -p ./storage/uploads`).
2.  Ensure the application has read/write permissions to this directory.

If using Supabase Storage (`USE_SERVER_STORAGE=false`):

1.  In your Supabase dashboard, create the necessary buckets (e.g., `project-photos`, `documents`, `avatars`, `receipts`).
2.  Configure bucket policies as needed.

## Running the Application

Once the setup is complete, you can start the development server:

```bash
npm run dev
```
Or using pnpm:
```bash
pnpm dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Deployment

CAJPRO can be deployed using various methods:

*   **Vercel:** Ideal for Next.js applications. Connect your Git repository to Vercel for automatic deployments.
*   **Docker:** A `Dockerfile` and `docker-compose.yml` might be available in the repository for containerized deployment (Please verify their existence and update this section accordingly).
*   **Self-hosted:** Deploy on your own VPS or dedicated server by building the application (`npm run build`) and starting it (`npm start`).

Refer to `docs/SETUP.md` for more detailed deployment guidance.

## Contributing

Contributions are welcome! If you'd like to contribute to CAJPRO, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name` or `bugfix/issue-number`).
3.  Make your changes and commit them with clear and descriptive messages.
4.  Push your changes to your forked repository.
5.  Create a Pull Request to the main repository's `main` or `develop` branch.

Please ensure your code adheres to the project's coding standards and includes tests where applicable.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

## Roadmap

This section outlines the future plans and upcoming features for CAJPRO.

*   **Phase 1 (Current Focus):**
    *   Stabilize core features (Project Management, Expenses, Maintenance).
    *   Enhance UI/UX based on user feedback.
    *   Improve mobile responsiveness.
*   **Phase 2 (Upcoming):**
    *   Advanced reporting and analytics dashboards.
    *   Integration with third-party APIs (e.g., parts suppliers, VIN decoders).
    *   User collaboration features for shared projects.
    *   Notifications and reminders system.
*   **Phase 3 (Long-term):**
    *   Mobile application (iOS/Android).
    *   Community features (forums, project showcases).
    *   AI-powered suggestions for maintenance and parts.

*(This roadmap is indicative and subject to change. Project owners/maintainers should update this section regularly.)*

---

*This README was generated with assistance from an AI tool and reviewed by the project team.*
