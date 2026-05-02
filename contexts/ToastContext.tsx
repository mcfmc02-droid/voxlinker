"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Toast, ToastProvider, ToastType } from "@/components/Toast"

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastContextProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prev) => [...prev, { id, message, type, duration }])
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type?: ToastType, duration?: number) => {
      addToast(message, type, duration)
    },
    [addToast]
  )

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "success", duration)
    },
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "error", duration)
    },
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "warning", duration)
    },
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "info", duration)
    },
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastProvider toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastContextProvider")
  }
  return context
}