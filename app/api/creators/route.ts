import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

const creators = await prisma.user.findMany({
where:{
role:"CREATOR"
},
select:{
id:true,
name:true,
email:true
}
})

return NextResponse.json({
creators
})

}