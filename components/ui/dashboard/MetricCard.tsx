type MetricCardProps = {
label: string
value: string
}

export default function MetricCard({label,value}:MetricCardProps){

return(

<div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">

<p className="text-sm text-gray-500">
{label}
</p>

<p className="text-2xl font-semibold mt-2">
{value}
</p>

</div>

)

}