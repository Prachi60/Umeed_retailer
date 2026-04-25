import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Badge from "@/components/ui/badge"
import Button from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AgentData {
  id: string;
  name: string;
  phone: string;
  collected: number;
  submitted: number;
  pending: number;
  lastSubmission: string;
  status: "Pending" | "Partial" | "Settled";
}

interface CashTableProps {
  agents: AgentData[];
  onCollect: (agent: AgentData) => void;
  onView: (agent: AgentData) => void;
}

export default function CashTable({ agents, onCollect, onView }: CashTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "destructive";
      case "Partial": return "default"; // Use default for yellow/amber if needed, or custom
      case "Settled": return "default"; // Green
      default: return "default";
    }
  }

  return (
    <Card className="mt-6 border-none shadow-lg bg-white/80 backdrop-blur-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-xl font-bold text-neutral-800">Delivery Agent COD Summary</CardTitle>
        <div className="relative w-full sm:w-72">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            placeholder="Search agents..."
            className="pl-10 focus-visible:ring-purple-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-neutral-100">
              <TableHead className="font-bold">Agent Name</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">COD Collected</TableHead>
              <TableHead className="font-bold">Submitted</TableHead>
              <TableHead className="font-bold">Pending</TableHead>
              <TableHead className="font-bold">Last Submission</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAgents.length > 0 ? (
              paginatedAgents.map((agent) => (
                <TableRow key={agent.id} className={cn(
                  "border-neutral-100 group transition-all",
                  agent.pending > 0 ? "bg-red-50/30" : "hover:bg-neutral-50"
                )}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-neutral-500 font-mono text-xs">{agent.phone}</TableCell>
                  <TableCell className="font-semibold">₹{agent.collected.toLocaleString()}</TableCell>
                  <TableCell className="text-indigo-600">₹{agent.submitted.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-bold",
                      agent.pending > 0 ? "text-red-500" : "text-neutral-400"
                    )}>
                      ₹{agent.pending.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-400 text-xs">{agent.lastSubmission}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        agent.status === 'Pending' ? "bg-red-100 text-red-600 border-red-200" :
                        agent.status === 'Partial' ? "bg-purple-100 text-purple-600 border-purple-200" :
                        "bg-indigo-100 text-indigo-600 border-indigo-200"
                      )}
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-lg text-white border-none bg-teal-600 hover:bg-teal-700"
                        style={{ backgroundColor: '#0d9488' }}
                        onClick={() => onCollect(agent)}
                        disabled={agent.pending <= 0}
                      >
                        Collect
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg border-teal-600 text-teal-600 hover:bg-teal-50"
                        style={{ borderColor: '#0d9488', color: '#0d9488' }}
                        onClick={() => onView(agent)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-neutral-400">
                  No agents found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-neutral-500">
              Showing <span className="font-medium text-neutral-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-neutral-900">{Math.min(currentPage * itemsPerPage, filteredAgents.length)}</span> of <span className="font-medium text-neutral-900">{filteredAgents.length}</span> results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9 w-9 p-0 border-teal-600 text-teal-600 hover:bg-teal-50"
                style={{ borderColor: '#0d9488', color: '#0d9488' }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9 w-9 p-0 border-teal-600 text-teal-600 hover:bg-teal-50"
                style={{ borderColor: '#0d9488', color: '#0d9488' }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
