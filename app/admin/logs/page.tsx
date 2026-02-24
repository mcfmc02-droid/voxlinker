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

  useEffect(() => {
  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs?page=" + page, {
        credentials: "include",
      })

      if (!res.ok) return

      const data = await res.json()

      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error("Failed to load logs")
    }
  }

  loadLogs()
}, [page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Logs</h1>
        <p className="text-gray-500">All administrative actions</p>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Admin</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="p-4">{log.admin.email}</td>
                <td className="p-4 font-medium">{log.action}</td>
                <td className="p-4 text-gray-600">{log.details}</td>
                <td className="p-4 text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}