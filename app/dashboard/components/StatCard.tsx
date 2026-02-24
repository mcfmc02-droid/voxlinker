type Props = {
  title: string
  value: string
  highlight?: boolean
}

export default function StatCard({ title, value, highlight }: Props) {
  return (
    <div className={`p-6 rounded-xl shadow-sm bg-white
      ${highlight ? "border border -orange-400" : ""}
    `}>
      <p className="text-sm text-gray-500 mb-2">
        {title}
      </p>
      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}
