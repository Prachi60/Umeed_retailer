import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import Button from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface Agent {
  id: string;
  name: string;
  pending: number;
}

interface CollectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onConfirm: (data: any) => void;
}

export default function CollectModal({ open, onOpenChange, agent, onConfirm }: CollectModalProps) {
  const [amount, setAmount] = useState<string>("")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [referenceId, setReferenceId] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (agent) {
      setAmount(agent.pending.toString())
    }
  }, [agent, open])

  const handleConfirm = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (agent && numAmount > agent.pending) {
      setError(`Amount cannot exceed pending balance (₹${agent.pending})`)
      return
    }
    
    setError("")
    onConfirm({
      agentId: agent?.id,
      amount: numAmount,
      paymentMode,
      referenceId,
      notes,
      date: new Date().toISOString()
    })
    
    // Reset fields
    setReferenceId("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border-none shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500" />
        <DialogHeader className="pt-4">
          <DialogTitle className="text-2xl font-bold text-neutral-800">Collect Cash</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Record a cash submission from the delivery agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Agent Name</Label>
              <div className="px-3 py-2 bg-neutral-50 rounded-lg text-sm font-medium text-neutral-700 border border-neutral-100">
                {agent?.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pending Amount</Label>
              <div className="px-3 py-2 bg-red-50 rounded-lg text-sm font-bold text-red-600 border border-red-100">
                ₹{agent?.pending.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-neutral-700">Amount Received</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400">₹</span>
              <Input
                id="amount"
                type="number"
                className={cn(
                  "pl-8 h-12 text-lg font-bold transition-all",
                  error ? "border-red-300 focus-visible:ring-red-100" : "border-neutral-200 focus-visible:ring-purple-100"
                )}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError("")
                }}
              />
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mode" className="text-xs font-bold uppercase tracking-wider text-neutral-700">Payment Mode</Label>
              <Select
                id="mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="h-11 border-neutral-200 focus-visible:ring-purple-100"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref" className="text-xs font-bold uppercase tracking-wider text-neutral-700">Reference ID (Optional)</Label>
              <Input
                id="ref"
                placeholder="TXN-123..."
                className="h-11 border-neutral-200 focus-visible:ring-purple-100"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-neutral-700">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl text-neutral-500 hover:bg-neutral-50"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 border-none"
            onClick={handleConfirm}
          >
            Confirm Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
