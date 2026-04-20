import { Search } from "lucide-react"

type Props = {
placeholder: string
value: string
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function SearchToolbar({ placeholder, value, onChange }: Props) {
return (
<div className="relative w-full">

  <Search
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
  />

  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="
    w-full
    pl-10 pr-4 py-2.5

    border border-gray-200
    rounded-lg

    text-sm

    focus:outline-none
    focus:border-[#ff9a6c]

    transition
    "
  />

</div>

)
}