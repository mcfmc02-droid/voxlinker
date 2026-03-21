import React from "react"

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-3xl border border-gray-200 shadow-sm p-10 hover:shadow-lg transition ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      {children}
    </div>
  )
}

export function CardBody({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}