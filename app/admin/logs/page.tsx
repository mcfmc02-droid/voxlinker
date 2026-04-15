"use client"

import { useEffect, useState } from "react"

type Log = {
  id: number
  action: string
  details: string
  createdAt: string
  admin: {
    email: string
  }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true)

        const res = await fetch("/api/admin/logs?page=" + page, {
          credentials: "include",
        })

        if (!res.ok) return

        const data = await res.json()

        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        console.error("Failed to load logs")
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [page])

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track all administrative actions
        </p>
      </div>

      {/* TABLE */}
      <div className="
        bg-white/80 backdrop-blur
        rounded-2xl
        shadow-[0_2px_12px_rgba(0,0,0,0.05)]
        overflow-hidden
      ">

        <table className="w-full text-sm">

          {/* HEAD */}
          <thead className="text-left text-xs text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>

            {loading && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  Loading logs...
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No logs found
                </td>
              </tr>
            )}

            {logs.map((log) => (
              <tr
                key={log.id}
                className="
                  border-t border-gray-100
                  hover:bg-gray-50/50
                  transition
                "
              >
                <td className="px-6 py-4 text-gray-700">
                  {log.admin.email}
                </td>

                <td className="px-6 py-4">
                  <span className="
                    text-xs font-medium
                    px-3 py-1 rounded-full
                    bg-gray-100 text-gray-700
                  ">
                    {log.action}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-500 max-w-sm truncate">
                  {log.details}
                </td>

                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}

          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">

        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="
            px-4 py-2 text-sm rounded-lg
            bg-gray-100 hover:bg-gray-200
            disabled:opacity-40
            transition
          "
        >
          Prev
        </button>

        <div className="text-sm text-gray-500">
          Page <span className="font-medium">{page}</span> of {totalPages}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="
            px-4 py-2 text-sm rounded-lg
            bg-gray-100 hover:bg-gray-200
            disabled:opacity-40
            transition
          "
        >
          Next
        </button>

      </div>

    </div>
  )
}