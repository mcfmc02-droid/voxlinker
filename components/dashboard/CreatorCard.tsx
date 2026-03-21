type Creator = {
  id: number
  name: string
  handle: string
  followers: number
  engagement: number
  sales: number
}
import Link from "next/link"
export default function CreatorCard({ creator }: { creator: Creator }) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">

      <div className="flex items-center gap-4">

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffb48a] to-[#ff9a6c] flex items-center justify-center text-white font-medium">
          {creator.name.charAt(0)}
        </div>

        <div>
          <p className="font-medium">{creator.name}</p>
          <p className="text-sm text-gray-500">@{creator.handle}</p>
        </div>

      </div>

      <div className="mt-6 grid grid-cols-3 text-center text-sm">

        <div>
          <p className="font-semibold">{creator.followers}</p>
          <p className="text-gray-500 text-xs">Followers</p>
        </div>

        <div>
          <p className="font-semibold">{creator.engagement}%</p>
          <p className="text-gray-500 text-xs">Engagement</p>
        </div>

        <div>
          <p className="font-semibold">${creator.sales}</p>
          <p className="text-gray-500 text-xs">Sales</p>
        </div>

      </div>

      <div className="mt-6 flex gap-3">

        <Link
  href={`/dashboard/creators/${creator.id}`}
  className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
>
  View Profile
</Link>

        <button className="flex-1 py-2 text-sm bg-black text-white rounded-lg hover:opacity-90 cursor-pointer">
          Invite
        </button>

      </div>

    </div>

  )
}