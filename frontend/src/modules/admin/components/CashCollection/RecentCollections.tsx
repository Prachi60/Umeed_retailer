import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Collection {
  id: string;
  agentName: string;
  amount: number;
  mode: string;
  date: string;
}

export default function RecentCollections({ collections }: { collections: Collection[] }) {
  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neutral-800">Recent Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {collections.length > 0 ? (
            collections.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 relative group">
                {index !== collections.length - 1 && (
                  <div className="absolute left-[19px] top-[40px] bottom-[-24px] w-0.5 bg-neutral-100" />
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 z-10 group-hover:bg-purple-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-neutral-900 truncate">{item.agentName}</p>
                    <p className="text-sm font-bold text-indigo-600">₹{item.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400 font-medium">{item.mode}</p>
                    <p className="text-[10px] text-neutral-300 font-mono">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
              <svg className="mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <p className="text-sm">No recent transactions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
