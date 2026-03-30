export function requireAdmin(user: any) {
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}