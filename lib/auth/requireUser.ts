import { getUser } from "./getUser"
import { NextResponse } from "next/server"

export async function requireUser(){

  const user = await getUser()

  if(!user){

    throw new Error("Unauthorized")

  }

  return user

}