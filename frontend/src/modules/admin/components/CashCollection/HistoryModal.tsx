import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { getDeliveryBoyCashCollections, type CashCollection } from "../../../../services/api/admin/adminDeliveryService"
import { cn } from "@/lib/utils"

interface Agent {
  id: string;
  name: string;
  pending: number;
}

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
}

export default function HistoryModal({ open, onOpenChange, agent }: HistoryModalProps) {
  const [history, setHistory] = useState<CashCollection[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (agent && open) {
      fetchHistory()
    }
  }, [agent, open])

  const fetchHistory = async () => {
    if (!agent) return
    try {
      setLoading(true)
      const res = await getDeliveryBoyCashCollections(agent.id, { limit: 20 })
      if (res.success) {
        setHistory(res.data)
      }
    } catch (err) {
      console.error("Error fetching agent history:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-teal-600" />
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            Collection History
          </DialogTitle>
          <DialogDescription className="text-neutral-500 font-medium">
            Viewing recent cash submissions for <span className="text-neutral-900 font-bold">{agent?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading Ledger...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-6">
              {history.map((item, idx) => (
                <div key={item._id} className="relative pl-8 group">
                  {/* Timeline Line */}
                  {idx !== history.length - 1 && (
                    <div className="absolute left-[11px] top-[24px] bottom-[-24px] w-0.5 bg-neutral-100 group-hover:bg-teal-100 transition-colors" />
                  )}
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-white border-2 border-teal-500 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  </div>

                  <div className="bg-neutral-50/50 group-hover:bg-teal-50/30 p-4 rounded-2xl border border-neutral-100 group-hover:border-teal-100 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-neutral-900">₹{item.amount.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Success
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Reference ID</p>
                        <p className="text-xs font-mono text-neutral-600 truncate">{item.referenceId || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Date & Time</p>
                        <p className="text-xs text-neutral-600">
                          {new Date(item.collectedAt).toLocaleDateString()} • {new Date(item.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    {item.remark && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Notes</p>
                        <p className="text-xs text-neutral-500 italic">"{item.remark}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p className="text-sm font-medium">No submission history found</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-50 bg-neutral-50/30">
          <button 
            onClick={() => onOpenChange(false)}
            className="w-full py-3 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all active:scale-[0.98]"
          >
            Close History
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
