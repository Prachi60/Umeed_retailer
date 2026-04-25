import React from 'react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  date: string;
  sellerName: string;
  type: string; // Order Earning / COD Received / Seller Payout
  referenceId?: string;
  description: string;
  debit: number;
  credit: number;
  status: 'Pending' | 'Completed';
}

interface SettlementTableProps {
  transactions: Transaction[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

const SettlementTable: React.FC<SettlementTableProps> = ({ 
  transactions, 
  loading, 
  searchTerm, 
  setSearchTerm,
  statusFilter,
  setStatusFilter
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-neutral-50 bg-neutral-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by Order ID or Seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => {
              // Export to CSV logic
              const headers = ["Date,Seller,Type,Reference,Debit,Credit,Status\n"];
              const rows = transactions.map(t => `${t.date},${t.sellerName},${t.type},${t.referenceId || ''},${t.debit},${t.credit},${t.status}\n`);
              const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('href', url);
              a.setAttribute('download', `settlements-${new Date().toISOString().split('T')[0]}.csv`);
              a.click();
            }}
            title="Export to CSV"
            className="p-2.5 hover:bg-white border border-transparent hover:border-neutral-200 rounded-xl transition-all text-neutral-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              title="Filter by Status"
              className={`p-2.5 border rounded-xl transition-all ${
                showFilters || statusFilter !== 'all' 
                ? 'bg-teal-50 border-teal-200 text-teal-600' 
                : 'hover:bg-white border-transparent hover:border-neutral-200 text-neutral-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral-100 z-30 p-2 overflow-hidden">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2">Filter Status</div>
                {['all', 'Pending', 'Completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      statusFilter === status 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50/50 text-[11px] font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Seller Details</th>
              <th className="px-6 py-4">Transaction</th>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Debit (₹)</th>
              <th className="px-6 py-4">Credit (₹)</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm text-neutral-400 font-medium">Processing Ledger...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-neutral-400 font-medium">
                  No settlement records found.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-neutral-50/80 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-neutral-800">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-neutral-900">{tx.sellerName}</div>
                    <div className="text-xs text-neutral-500">ID: {tx.id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        tx.type === 'Seller Payout' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-neutral-600 line-clamp-1">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {tx.referenceId || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-bold ${tx.debit > 0 ? 'text-red-600' : 'text-neutral-300'}`}>
                      {tx.debit > 0 ? `-₹${tx.debit.toLocaleString()}` : '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-bold ${tx.credit > 0 ? 'text-green-600' : 'text-neutral-300'}`}>
                      {tx.credit > 0 ? `+₹${tx.credit.toLocaleString()}` : '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-5 border-t border-neutral-50 bg-neutral-50/30 flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-medium">Showing 1-10 of {transactions.length} entries</span>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SettlementTable;
