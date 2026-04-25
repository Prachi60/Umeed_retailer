import React from 'react';
import { motion } from 'framer-motion';

interface SummaryCardsProps {
  stats: {
    totalSellerEarnings: number;
    codReceived: number;
    alreadyPaid: number;
    availableToSettle: number;
    pendingCOD: number;
  } | null;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Total Seller Earnings",
      value: `₹${stats?.totalSellerEarnings.toLocaleString('en-IN') || '0'}`,
      subtitle: "System calculated from orders",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "COD Received",
      value: `₹${stats?.codReceived.toLocaleString('en-IN') || '0'}`,
      subtitle: "Actual cash in Admin Wallet",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Available to Settle",
      value: `₹${stats?.availableToSettle.toLocaleString('en-IN') || '0'}`,
      subtitle: "COD Received - Already Paid",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-green-600",
      bg: "bg-green-50",
      highlight: true
    },
    {
      title: "Pending COD",
      value: `₹${stats?.pendingCOD.toLocaleString('en-IN') || '0'}`,
      subtitle: "Money with delivery boys",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-red-600",
      bg: "bg-red-50",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 ${card.highlight ? 'ring-2 ring-green-100' : ''}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            {card.highlight && (
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Ready
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            {card.title}
          </h3>
          <div className={`text-3xl font-bold tracking-tight ${card.color}`}>
            {card.value}
          </div>
          <p className="text-xs text-neutral-400 mt-2 font-medium">
            {card.subtitle}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
