"use client"

export default function PhoneFrame({children}:{children:React.ReactNode}){

return(

<div className="relative w-[260px] h-[520px]">

{/* PHONE BODY */}

<div className="relative w-full h-full rounded-[34px] bg-black p-[5px] shadow-[0_35px_70px_rgba(0,0,0,0.55)]">

{/* SCREEN */}

<div className="relative w-full h-full rounded-[28px] bg-white overflow-hidden">

{/* subtle screen reflection */}

<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40"/>

{/* ===== STATUS BAR ===== */}

<div className="absolute top-[10px] left-0 right-0 flex items-center justify-between px-6 text-[9px] font-semibold text-black z-30 select-none">

{/* TIME */}

<span className="tracking-tight">
9:41
</span>

{/* RIGHT ICONS */}

<div className="flex items-center gap-[4px]">

{/* SIGNAL */}

<div className="flex items-end gap-[1.5px]">

<span className="w-[2px] h-[3px] bg-black rounded-sm"/>
<span className="w-[2px] h-[5px] bg-black rounded-sm"/>
<span className="w-[2px] h-[7px] bg-black rounded-sm"/>
<span className="w-[2px] h-[9px] bg-black rounded-sm"/>

</div>

{/* WIFI */}

<svg width="10" height="15" viewBox="0 0 24 24" fill="none">

<path d="M2 7C7 3 17 3 22 7" stroke="black" strokeWidth="2" strokeLinecap="round"/>
<path d="M4 10C9 6 15 6 20 10" stroke="black" strokeWidth="2" strokeLinecap="round"/>
<path d="M7 13C10 11 14 11 17 13" stroke="black" strokeWidth="2" strokeLinecap="round"/>
<path d="M10 16C11 15 13 15 14 16" stroke="black" strokeWidth="2" strokeLinecap="round"/>

</svg>

{/* BATTERY */}

<div className="flex items-center gap-[2px]">

<div className="w-[15px] h-[7px] border border-black rounded-[2px] relative">

<div className="absolute left-[1px] top-[1px] bottom-[1px] w-[65%] bg-black rounded-[1px]"/>

</div>

<div className="w-[1.5px] h-[3px] bg-black rounded-sm"/>

</div>

</div>

</div>

{/* ===== DYNAMIC ISLAND ===== */}

<div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[70px] h-[16px] bg-black rounded-full z-40"/>

{/* ===== CONTENT AREA ===== */}

<div className="pt-[10px] h-full">

{children}

</div>

</div>

</div>

</div>

)

}