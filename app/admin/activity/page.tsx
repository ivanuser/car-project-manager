import { getActivityLogs } from "@/actions/admin-actions"
import { ActivityLogTable } from "@/components/admin/activity-log-table"

export const metadata = {
  title: "Activity Logs | CAJPRO Admin",
  description: "View system activity logs",
}

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const { logs, total, pages } = await getActivityLogs(page)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
      </div>

      <ActivityLogTable logs={logs} currentPage={page} totalPages={pages} totalLogs={total} />
    </div>
  )
}
