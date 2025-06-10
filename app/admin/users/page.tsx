import { getUsers, getUserStats } from "@/actions/admin-actions"
import { UserStatsCards } from "@/components/admin/user-stats-cards"
import { UserTable } from "@/components/admin/user-table"

export const metadata = {
  title: "User Management | CAJPRO Admin",
  description: "Manage users and permissions",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const search = searchParams.search || ""

  const { users, total, pages } = await getUsers(page, 10, search)
  const userStats = await getUserStats()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <UserStatsCards stats={userStats} />

      <UserTable users={users} currentPage={page} totalPages={pages} totalUsers={total} searchQuery={search} />
    </div>
  )
}
