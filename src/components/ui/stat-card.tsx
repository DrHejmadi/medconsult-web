interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color?: string
}

export function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1">
      <div className={`w-10 h-10 rounded-lg ${colors[color] || colors.blue} flex items-center justify-center mb-3`}>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  )
}
