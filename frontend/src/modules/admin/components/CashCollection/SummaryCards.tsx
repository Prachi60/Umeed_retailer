import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: string;
  trendColor?: string;
  icon?: React.ReactNode;
}

const SummaryCard = ({ title, value, description, trend, trendColor, icon }: SummaryCardProps) => (
  <Card className="overflow-hidden transition-all hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{title}</CardTitle>
      <div className="text-neutral-400">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className={cn("text-2xl font-bold", trendColor)}>{value}</div>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
      {trend && (
        <p className={cn("text-xs font-medium mt-2", trendColor)}>
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
)

export default function SummaryCards({ data }: { data: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total COD Collected"
        value={`₹${data.totalCollected?.toLocaleString() || '0'}`}
        description="Gross cash collected by agents"
        trendColor="text-purple-600"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
      />
      <SummaryCard
        title="Total Submitted"
        value={`₹${data.totalSubmitted?.toLocaleString() || '0'}`}
        description="Amount received by admin"
        trendColor="text-indigo-600"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
      />
      <SummaryCard
        title="Pending Amount"
        value={`₹${data.pendingAmount?.toLocaleString() || '0'}`}
        description="Cash yet to be submitted"
        trendColor="text-red-500"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
      />
      <SummaryCard
        title="Agents with Pending"
        value={data.agentsWithPending || '0'}
        description="Active agents with cash"
        trendColor={data.agentsWithPending > 0 ? "text-purple-600" : "text-indigo-500"}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
      />
    </div>
  )
}
