"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProviderProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

export function ToastProvider({ toasts, removeToast }: ToastProviderProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  }

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        ${bgColors[toast.type]}
        animate-in slide-in-from-right fade-in duration-200
      `}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}