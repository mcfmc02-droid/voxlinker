import React from "react"

export function Table({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function TableHead({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <thead className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
      {children}
    </thead>
  )
}

export function TableBody({
  children,
}: {
  children: React.ReactNode
}) {
  return <tbody>{children}</tbody>
}

export function TableRow({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      {children}
    </tr>
  )
}

export function TableHeaderCell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <th className="text-left py-3 font-medium">
      {children}
    </th>
  )
}

export function TableCell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <td className="py-4 text-gray-700">
      {children}
    </td>
  )
}