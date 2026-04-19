import { useEffect, useState } from "react"

export function useMode() {

  const switchToAdmin = () => {
    document.cookie = "mode=admin; path=/"
    window.location.href = "/admin"
  }

  const switchToUser = () => {
    document.cookie = "mode=user; path=/"
    window.location.href = "/dashboard"
  }

  return {
    switchToAdmin,
    switchToUser,
  }
}