import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { Account, Transaction } from '../types';
import { calculateBalance, formatCurrency } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Language, translations } from '../lib/i18n';

interface YouViewProps {
  accounts: Account[];
  onBack: () => void;
  onSelectAccount: (accountId: string) => void;
  language: Language;
}

export function YouView({ accounts, onBack, onSelectAccount, language }: YouViewProps) {
  const t = translations[language];
  const [showAllDebtors, setShowAllDebtors] = useState(false);
  const [showAllCreditors, setShowAllCreditors] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  let totalDebit = 0; // We gave them money, they owe us
  let totalCredit = 0; // They gave us money, we owe them

  const filterTransactions = (transactions: Transaction[]) => {
    if (dateRange === 'all') return transactions;
    const now = new Date();
    let start = new Date();
    let end = new Date();
    
    if (dateRange === 'week') {
      start.setDate(now.getDate() - now.getDay());
    } else if (dateRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'year') {
      const startMonth = 3; // April for financial year in India
      const currentMonth = now.getMonth();
      const startYear = currentMonth >= startMonth ? now.getFullYear() : now.getFullYear() - 1;
      start = new Date(startYear, startMonth, 1);
    } else if (dateRange === 'custom') {
      if (!customStart || !customEnd) return transactions;
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

    return transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= start && txDate <= end;
    });
  };

  const accountBalances = accounts.map(acc => {
    const filteredTransactions = filterTransactions(acc.transactions);
    const balance = calculateBalance(filteredTransactions); // +ve means they owe us (Debit), -ve means we owe them (Credit)
    if (balance > 0) totalDebit += balance;
    if (balance < 0) totalCredit += Math.abs(balance);
    return { ...acc, balance };
  });

  const pieData = [
    { name: t.topDebtors, value: totalDebit, color: '#10b981' }, // emerald-500
    { name: t.topCreditors, value: totalCredit, color: '#f43f5e' } // rose-500
  ];

  // Debit: owe us > 0
  const debtors = accountBalances
    .filter(a => a.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  // Credit: we owe < 0
  const creditors = accountBalances
    .filter(a => a.balance < 0)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  const displayDebtors = showAllDebtors ? debtors : debtors.slice(0, 5);
  const displayCreditors = showAllCreditors ? creditors : creditors.slice(0, 5);

  const renderList = (
    title: string,
    list: typeof debtors,
    isDebtor: boolean,
    showAll: boolean,
    setShowAll: (v: boolean) => void,
    totalCount: number
  ) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {isDebtor ? <ArrowDownRight className="text-emerald-500 w-5 h-5" /> : <ArrowUpRight className="text-rose-500 w-5 h-5" />}
          {title}
        </h3>
        {totalCount > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)} 
            className="text-indigo-600 text-sm font-medium flex items-center"
          >
            {showAll ? t.showLess : t.viewAll}
            {showAll ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No {title.toLowerCase()} found.</p>
      ) : (
        <div className="space-y-3">
          {list.map(acc => (
             <div 
               key={acc.id} 
               onClick={() => onSelectAccount(acc.id)}
               className="flex justify-between items-center cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors"
             >
               <span className="font-semibold text-slate-700">{acc.name}</span>
               <span className={`font-bold ${isDebtor ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {formatCurrency(Math.abs(acc.balance))}
               </span>
             </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      <header className="bg-[#000080] border-b border-[#000060] px-4 py-4 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-[#000060] rounded-full transition-colors shrink-0 -ml-2">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider">{t.reports}</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col overflow-y-auto pb-24 scrollbar-hide">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-3 mb-6">
            <h2 className="text-center font-bold text-slate-600 uppercase tracking-widest text-xs">{t.totalBalances || 'Total Balances'}</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium"
            >
              <option value="all">ALL TIME</option>
              <option value="week">CURRENT WEEK</option>
              <option value="month">CURRENT MONTH</option>
              <option value="year">CURRENT FINANCIAL YEAR</option>
              <option value="custom">CUSTOM</option>
            </select>
            {dateRange === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="flex-1 w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2 outline-none font-medium min-w-0"
                />
                <span className="text-slate-400 font-bold shrink-0">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="flex-1 w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2 outline-none font-medium min-w-0"
                />
              </div>
            )}
          </div>
          {totalDebit === 0 && totalCredit === 0 ? (
            <div className="text-center text-slate-500 py-8">No transactions yet.</div>
          ) : (
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex flex-col gap-1 items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                              <p className="text-xs font-bold text-slate-500 uppercase">{data.name}</p>
                            </div>
                            <p className="text-lg font-extrabold text-slate-800">{formatCurrency(data.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-xs font-bold text-slate-400">NET</span>
                <span className={`font-bold ${totalDebit >= totalCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formatCurrency(Math.abs(totalDebit - totalCredit))}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-6 px-4">
             <div className="text-center">
               <span className="block text-xs font-bold text-emerald-500 uppercase">{language === 'hi' ? 'आना है' : 'DEBIT'}</span>
               <span className="font-bold text-slate-800">{formatCurrency(totalDebit)}</span>
             </div>
             <div className="text-center">
               <span className="block text-xs font-bold text-rose-500 uppercase">{language === 'hi' ? 'देना है' : 'CREDIT'}</span>
               <span className="font-bold text-slate-800">{formatCurrency(totalCredit)}</span>
             </div>
          </div>
        </div>

        {renderList(t.topDebtors, displayDebtors, true, showAllDebtors, setShowAllDebtors, debtors.length)}
        {renderList(t.topCreditors, displayCreditors, false, showAllCreditors, setShowAllCreditors, creditors.length)}
      </main>
    </div>
  );
}
