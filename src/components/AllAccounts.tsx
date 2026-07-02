import React, { useState } from 'react';
import { ArrowLeft, User, Search } from 'lucide-react';
import { Account } from '../types';
import { calculateBalance, formatCurrency } from '../lib/utils';
import { Language, translations } from '../lib/i18n';

interface AllAccountsProps {
  accounts: Account[];
  onBack: () => void;
  onSelectAccount: (accountId: string) => void;
  language: Language;
}

export function AllAccounts({ accounts, onBack, onSelectAccount, language }: AllAccountsProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  // Sort accounts alphabetically by name
  const sortedAccounts = [...accounts].sort((a, b) => a.name.localeCompare(b.name));
  
  const filteredAccounts = sortedAccounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (acc.phone && acc.phone.includes(searchQuery))
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative transition-colors duration-200">
      <header className="bg-[#000080] border-b border-[#000060] px-4 py-4 flex items-center gap-4 shrink-0 transition-colors duration-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#000060] rounded-full transition-colors shrink-0 -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">All Accounts</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto pb-24 scrollbar-hide">
        <div className="sticky top-0 z-20 bg-slate-50 pt-2 pb-2 -mt-2 transition-colors duration-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200 shadow-sm mt-2 transition-colors duration-200">
            <p className="text-slate-500 text-sm font-medium">{t.noAccountsFound}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {filteredAccounts.map((account) => {
              const balance = calculateBalance(account.transactions);
              const isOwed = balance > 0;
              const isOwing = balance < 0;

              return (
                <div
                  key={account.id}
                  onClick={() => onSelectAccount(account.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer flex justify-between items-center group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4 truncate">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-indigo-100 transition-colors">
                      {account.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate pr-4">
                      <h3 className="font-bold text-slate-800 text-base truncate">{account.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{account.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm text-slate-400">{isOwed ? t.youGet : isOwing ? t.youGive : t.settled}</p>
                    <p className={`text-lg font-bold ${isOwed ? 'text-emerald-600' : isOwing ? 'text-rose-600' : 'text-slate-400'}`}>
                      {formatCurrency(Math.abs(balance))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
