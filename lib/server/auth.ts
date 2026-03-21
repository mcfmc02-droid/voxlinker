import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"



/* ===============================
   Get Current User
================================ */

export async function getUser(){

  const cookieStore = await cookies()

  const token = cookieStore.get("token")?.value

  if(!token) return null

  try{

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId:number }

    const user = await prisma.user.findUnique({
      where:{
        id:decoded.userId
      }
    })

    return user

  }catch{

    return null

  }

}



/* ===============================
   Require User (Protected API)
================================ */

export async function requireUser(){

  const user = await getUser()

  if(!user){
    throw new Error("Unauthorized")
  }

  return user

}



/* ===============================
   Require Admin
================================ */

export async function requireAdmin(){

  const user = await requireUser()

  if(user.role !== "ADMIN"){
    throw new Error("Forbidden")
  }

  return user

}