import React from "react"

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-medium tracking-tight"> 
      {children}
    </h1>
  )
}

export function PageSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gray-600 mt-1">
      {children}
    </p>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-medium">
      {children}
    </h2>
  )
}

export function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-gray-500 mb-2">
      {children}
    </p>
  )
}

export function CardValue({
  children,
  highlight = false,
}: {
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <p
      className={`text-2xl font-semibold tracking-tight ${
        highlight ? "text-[#ff9a6c]" : ""
      }`}
    >
      {children}
    </p>
  )
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
      {children}
    </label>
  )
}

export function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
      {children}
    </p>
  )
}