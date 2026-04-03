import { useEffect } from "react"

export default function useLockBodyScroll(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none" // 👈 مهم للموبايل
    } else {
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
    }
  }, [isLocked])
}