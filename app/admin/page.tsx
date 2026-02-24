"use client"

import { useEffect, useState } from "react"

type User = {
id: number
email: string
name: string | null
role: string
status: string
createdAt: string
}

export default function AdminPage() {
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState(true)
const [filter, setFilter] = useState("ALL")

useEffect(() => {
fetch("/api/admin/users", { credentials: "include" })
.then(res => res.json())
.then(data => {
setUsers(data.users || [])
setLoading(false)
})
}, [])

const updateStatus = async (id: number, status: string) => {
await fetch("/api/admin/users/" + id, {
method: "PATCH",
headers: { "Content-Type": "application/json" },
credentials: "include",
body: JSON.stringify({ status }),
})

setUsers(users.map(u =>  
  u.id === id ? { ...u, status } : u  
))

}

const filteredUsers =
filter === "ALL"
? users
: users.filter(u => u.status === filter)

const pendingCount = users.filter(u => u.status === "PENDING").length

if (loading) return <div className="p-8">Loading...</div>

return (
<div className="p-8">

<h1 className="text-2xl font-bold mb-4">User Management</h1>  

  {/* Pending Counter */}  
  <div className="mb-4">  
    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium">  
      Pending Users: {pendingCount}  
    </span>  
  </div>  

  {/* Filters */}  
  <div className="flex gap-2 mb-6">  
    {["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map(f => (  
      <button  
        key={f}  
        onClick={() => setFilter(f)}  
        className={`px-3 py-1 rounded text-sm ${  
          filter === f  
            ? "bg-black text-white"  
            : "bg-gray-200 text-gray-700"  
        }`}  
      >  
        {f}  
      </button>  
    ))}  
  </div>  

  {/* Table */}  
  <div className="bg-white rounded-xl shadow overflow-hidden">  
    <table className="w-full text-sm">  
      <thead className="bg-gray-50 border-b">  
        <tr>  
          <th className="p-3 text-left">Email</th>  
          <th className="p-3 text-left">Name</th>  
          <th className="p-3 text-left">Role</th>  
          <th className="p-3 text-left">Status</th>  
          <th className="p-3 text-left">Actions</th>  
        </tr>  
      </thead>  

      <tbody>  
        {filteredUsers.map(user => (  
          <tr key={user.id} className="border-b hover:bg-gray-50">  
            <td className="p-3">{user.email}</td>  
            <td className="p-3">{user.name || "-"}</td>  
            <td className="p-3">{user.role}</td>  
            <td className="p-3">  
              <span className={`px-2 py-1 rounded text-xs font-medium  
                ${  
                  user.status === "ACTIVE"  
                    ? "bg-green-100 text-green-600"  
                    : user.status === "PENDING"  
                    ? "bg-yellow-100 text-yellow-600"  
                    : user.status === "SUSPENDED"  
                    ? "bg-red-100 text-red-600"  
                    : "bg-gray-200 text-gray-600"  
                }  
              `}>  
                {user.status}  
              </span>  
            </td>  
            <td className="p-3 space-x-2">  
              <button  
                onClick={() => updateStatus(user.id, "ACTIVE")}  
                className="px-3 py-1 bg-green-500 text-white rounded text-xs"  
              >  
                Approve  
              </button>  

              <button  
                onClick={() => updateStatus(user.id, "REJECTED")}  
                className="px-3 py-1 bg-gray-500 text-white rounded text-xs"  
              >  
                Reject  
              </button>  

              <button  
                onClick={() => updateStatus(user.id, "SUSPENDED")}  
                className="px-3 py-1 bg-red-500 text-white rounded text-xs"  
              >  
                Suspend  
              </button>  
            </td>  
          </tr>  
        ))}  
      </tbody>  

    </table>  
  </div>  
</div>

)
}