import React, { useState } from 'react';
import { Search, Plus, X, Settings, User, PieChart } from 'lucide-react';
import { Account } from '../types';
import { calculateBalance, formatCurrency } from '../lib/utils';
import { Language, translations } from '../lib/i18n';

interface DashboardProps {
  accounts: Account[];
  onAddAccount: (name: string, phone?: string, accountType?: 'individual' | 'business', gstin?: string) => void;
  onSelectAccount: (accountId: string) => void;
  onViewAll: () => void;
  onYouClick: () => void;
  onSettingsClick: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  businessName: string;
}

export function Dashboard({ accounts, onAddAccount, onSelectAccount, onViewAll, onYouClick, onSettingsClick, language, setLanguage, businessName }: DashboardProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [gstin, setGstin] = useState('');
  const [gstinError, setGstinError] = useState('');

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.phone && acc.phone.includes(searchQuery))
  );

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    if (accountType === 'business' && gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim())) {
        setGstinError('Invalid GSTIN format. Expected format: 07ABCDE1234F1Z5');
        return;
      }
    }

    onAddAccount(newName.trim(), newPhone.trim() || undefined, accountType, gstin.trim() || undefined);
    setNewName('');
    setNewPhone('');
    setGstin('');
    setGstinError('');
    setAccountType('individual');
    setIsAddingMode(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      <header className="bg-[#000080] border-b border-[#000060] px-4 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase max-w-[200px] truncate">{businessName}</h1>
        </div>
        <div className="flex bg-[#000060] p-1 rounded-lg">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'en' ? 'bg-white shadow-sm text-[#000080]' : 'text-slate-300 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'hi' ? 'bg-white shadow-sm text-[#000080]' : 'text-slate-300 hover:text-white'}`}
          >
            हि
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto pb-24 scrollbar-hide">
        <section className="flex flex-col gap-4 relative">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold text-slate-700">{t.existingAccounts}</h2>
            <span onClick={onViewAll} className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">{t.viewAllLedgers}</span>
          </div>
          
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
                    className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer ${!isOwed && !isOwing ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${isOwing ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        {account.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{account.name}</p>
                        <p className="text-sm text-slate-500 truncate">
                          {account.phone || 'No phone number'}
                        </p>
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
        </section>
      </main>
      
      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-0 w-full px-6 flex justify-center z-10 pointer-events-none">
        <nav className="bg-[#000080]/95 backdrop-blur-md border border-[#000060] px-2 py-2 flex items-center gap-2 rounded-full shadow-2xl pointer-events-auto">
          <button 
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors px-6 py-2 group rounded-full hover:bg-white/10"
            onClick={onYouClick}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.reports}</span>
          </button>
          
          <button
            onClick={() => setIsAddingMode(true)}
            className="w-12 h-12 bg-white text-[#000080] rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 hover:scale-105 transition-all active:scale-95 mx-2"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button 
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors px-6 py-2 group rounded-full hover:bg-white/10"
            onClick={onSettingsClick}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.settings}</span>
          </button>
        </nav>
      </div>

      {/* New Account Overlay/Modal */}
      {isAddingMode && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">{t.newAccount}</h2>
              <button 
                onClick={() => setIsAddingMode(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <form onSubmit={handleAddAccount} className="space-y-5">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${accountType === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${accountType === 'business' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Business
                  </button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-slate-500 block">
                    {accountType === 'business' ? 'Business Name *' : t.fullName}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoFocus
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.enterName}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wide text-slate-500 block">
                    {t.mobileNumber}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 00000 00000"
                  />
                </div>

                {accountType === 'business' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label htmlFor="gstin" className="text-xs font-bold uppercase tracking-wide text-slate-500 block">
                      GSTIN Number
                    </label>
                    <input
                      id="gstin"
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase transition-shadow"
                      value={gstin}
                      onChange={(e) => {
                        setGstin(e.target.value.toUpperCase());
                        setGstinError('');
                      }}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                    />
                    {gstinError && <p className="text-rose-500 text-xs mt-1 font-medium">{gstinError}</p>}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-colors text-base"
                  >
                    {t.createLedgerAccount}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
