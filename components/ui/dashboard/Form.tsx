import React from "react"
import { FormLabel, HelperText } from "./Typography"

type FieldProps = {
  label: string
  helper?: string
  error?: string
  children: React.ReactNode
}

export function FormField({
  label,
  helper,
  error,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1">

      <FormLabel>{label}</FormLabel>

      <div className="mt-2">
        {children}
      </div>

      {error ? (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      ) : helper ? (
        <HelperText>{helper}</HelperText>
      ) : null}

    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function FormInput({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full border-b border-gray-200 py-2 text-sm
      focus:outline-none focus:border-[#ff9a6c] transition
      disabled:text-gray-400 disabled:cursor-not-allowed
      ${className}`}
    />
  )
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function FormTextarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full border-b border-gray-200 py-2 text-sm resize-none
      focus:outline-none focus:border-[#ff9a6c] transition
      ${className}`}
    />
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function FormSelect({ className = "", ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full border-b border-gray-200 py-2 text-sm
      focus:outline-none focus:border-[#ff9a6c] transition
      ${className}`}
    />
  )
}