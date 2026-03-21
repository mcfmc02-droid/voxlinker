"use client"

import { useEffect, useState } from "react"

export default function Counter({value}:{value:number}){

const [count,setCount] = useState(0)

useEffect(()=>{

let start = 0

const step = Math.ceil(value / 40)

const interval = setInterval(()=>{

start += step

if(start >= value){
start = value
clearInterval(interval)
}

setCount(start)

},20)

return ()=>clearInterval(interval)

},[value])

return <span>{count.toLocaleString()}</span>

}