import React, { useState } from 'react';
import { ArrowLeft, Calendar, IndianRupee, FileText, Settings, Trash2, X } from 'lucide-react';
import { Account, TransactionType, Transaction } from '../types';
import { calculateBalance, formatCurrency } from '../lib/utils';
import { Language, translations } from '../lib/i18n';
import { MPINModal } from './MPINModal';

import { Info } from 'lucide-react';

interface AccountDetailsProps {
  account: Account;
  onBack: () => void;
  onAddTransaction: (accountId: string, amount: number, type: TransactionType, note: string, dateStr: string) => void;
  onEditTransaction?: (accountId: string, txId: string, amount: number, type: TransactionType, note: string, dateStr: string) => void;
  onDeleteAccount: () => void;
  mpin: string;
  language: Language;
  businessDetails: { name: string; phone: string; gstin: string };
}

export function AccountDetails({ account, onBack, onAddTransaction, onEditTransaction, onDeleteAccount, mpin, language, businessDetails }: AccountDetailsProps) {
  const t = translations[language];
  const [isAddingMode, setIsAddingMode] = useState<TransactionType | null>(null);
  const [isLedgerView, setIsLedgerView] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'currentMonth' | 'currentFY' | 'previousFY' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [showMpinForDelete, setShowMpinForDelete] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  
  const [showMpinForEdit, setShowMpinForEdit] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const balance = calculateBalance(account.transactions);
  const isOwed = balance > 0;
  const isOwing = balance < 0;

  let accountTotalDebit = 0;
  let accountTotalCredit = 0;
  account.transactions.forEach(txn => {
    if (txn.type === 'gave') accountTotalDebit += txn.amount;
    if (txn.type === 'got') accountTotalCredit += txn.amount;
  });

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !isAddingMode || !txnDate) return;
    
    if (editingTxnId && onEditTransaction) {
      onEditTransaction(account.id, editingTxnId, Number(amount), isAddingMode, note.trim(), txnDate);
      setEditingTxnId(null);
      setEditingTxn(null);
    } else {
      onAddTransaction(account.id, Number(amount), isAddingMode, note.trim(), txnDate);
    }
    setIsAddingMode(null);
    setAmount('');
    setNote('');
    setTxnDate(new Date().toISOString().split('T')[0]);
  };

  const handleTouchStart = (txn: Transaction) => {
    const timer = setTimeout(() => {
      setEditingTxn(txn);
      setShowEditConfirmation(true);
    }, 600); // 600ms long press
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  const handleEditMpinSuccess = (pin: string) => {
    if (pin === mpin && editingTxn) {
      setShowMpinForEdit(false);
      setIsAddingMode(editingTxn.type);
      setAmount(editingTxn.amount.toString());
      setNote(editingTxn.note);
      setTxnDate(editingTxn.date);
      setEditingTxnId(editingTxn.id);
    }
  };

  const handleDeleteClick = () => {
    setShowSettings(false);
    setShowDeleteWarning(true);
  };

  const confirmDelete = () => {
    setShowDeleteWarning(false);
    setShowMpinForDelete(true);
  };

  const handleMpinSuccess = (pin: string) => {
    if (pin === mpin) {
      setShowMpinForDelete(false);
      onDeleteAccount();
    }
  };

  if (isLedgerView) {
    let runningBalance = 0;
    
    // Filter logic
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentFYStart = new Date(today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1, 3, 1);
    const previousFYStart = new Date(currentFYStart.getFullYear() - 1, 3, 1);
    const previousFYEnd = new Date(currentFYStart.getFullYear(), 2, 31, 23, 59, 59, 999);

    const filteredTxns = account.transactions.filter(txn => {
      const txnDateObj = new Date(txn.date);
      if (ledgerFilter === 'currentMonth') return txnDateObj >= currentMonthStart;
      if (ledgerFilter === 'currentFY') return txnDateObj >= currentFYStart;
      if (ledgerFilter === 'previousFY') return txnDateObj >= previousFYStart && txnDateObj <= previousFYEnd;
      if (ledgerFilter === 'custom' && customStartDate && customEndDate) {
        return txnDateObj >= new Date(customStartDate) && txnDateObj <= new Date(customEndDate + 'T23:59:59');
      }
      return true; // 'all'
    });

    const sortedTxns = [...filteredTxns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let totalDebit = 0;
    let totalCredit = 0;

    let dateRangeStr = "All time";
    if (filteredTxns.length > 0) {
      const dates = filteredTxns.map(t => new Date(t.date).getTime());
      const minDate = new Date(Math.min(...dates)).toLocaleDateString('en-IN');
      const maxDate = new Date(Math.max(...dates)).toLocaleDateString('en-IN');
      dateRangeStr = `${minDate} to ${maxDate}`;
    }

    return (
      <div className="w-full h-full bg-white flex flex-col font-sans overflow-y-auto scrollbar-hide relative print:h-auto print:overflow-visible">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden border-b border-slate-200">
          <button onClick={() => setIsLedgerView(false)} className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-900 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <select 
              value={ledgerFilter} 
              onChange={(e) => setLedgerFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            >
              <option value="all">All Dates</option>
              <option value="currentMonth">Current Month</option>
              <option value="currentFY">Current Financial Year</option>
              <option value="previousFY">Previous Financial Year</option>
              <option value="custom">Custom Date</option>
            </select>
            
            {ledgerFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2" />
                <span className="text-slate-500">to</span>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2" />
              </div>
            )}
            
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4" />
              {t.printPdf}
            </button>
          </div>
        </div>
        
        <div className="p-8 print:p-0 flex-1 bg-white" id="ledger-printable-area">
          <div className="border border-black p-4 mb-4 bg-[#c2d69b] text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider">LEDGER</h1>
          </div>

          <div className="text-center mb-4 text-sm font-medium text-slate-700">
             Period: {dateRangeStr}
          </div>
          
          <div className="flex justify-center mb-8">
            <table className="w-full max-w-2xl border-collapse border border-black text-sm text-center">
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2 font-bold bg-slate-100">{businessDetails?.name || t.appName + ' User'}</td>
                  <td className="border border-black p-2 w-1/2 font-bold bg-slate-100">{account.name}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">{businessDetails?.phone || '-'}</td>
                  <td className="border border-black p-2">{account.phone || '-'}</td>
                </tr>
                {(businessDetails?.gstin || account.gstin) && (
                  <tr>
                    <td className="border border-black p-2 font-bold bg-slate-50 text-xs">GSTIN: {businessDetails?.gstin || '-'}</td>
                    <td className="border border-black p-2 font-bold bg-slate-50 text-xs">GSTIN: {account.gstin || '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <table className="w-full border-collapse border border-black text-sm text-center">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-2 w-24">Type</th>
                <th className="border border-black p-2 w-32">{t.date}</th>
                <th className="border border-black p-2 w-32">Voucher No</th>
                <th className="border border-black p-2 text-left">{t.particular}</th>
                <th className="border border-black p-2 w-24">{t.debit}</th>
                <th className="border border-black p-2 w-24">{t.credit}</th>
                <th className="border border-black p-2 w-32">{t.balance}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTxns.map((txn, index) => {
                // If I give money, they owe me -> Debit (increase balance)
                // If I get money, they paid me -> Credit (decrease balance)
                const debit = txn.type === 'gave' ? txn.amount : 0;
                const credit = txn.type === 'got' ? txn.amount : 0;
                
                runningBalance += debit - credit;
                totalDebit += debit;
                totalCredit += credit;

                const balanceStr = Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' Dr.' : ' Cr.');

                return (
                  <tr key={txn.id}>
                    <td className="border border-black p-2">Invoice</td>
                    <td className="border border-black p-2">
                      {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).format(new Date(txn.date))}
                    </td>
                    <td className="border border-black p-2">{`${(index + 1).toString().padStart(4, '0')}/25-26`}</td>
                    <td className="border border-black p-2 text-left">{txn.note || 'Sales'}</td>
                    <td className="border border-black p-2">{debit > 0 ? debit.toFixed(0) : '0'}</td>
                    <td className="border border-black p-2">{credit > 0 ? credit.toFixed(2) : ''}</td>
                    <td className="border border-black p-2">{balanceStr}</td>
                  </tr>
                );
              })}
              <tr className="font-bold bg-slate-50">
                <td colSpan={4} className="border border-black p-2 text-left">Total</td>
                <td className="border border-black p-2">{totalDebit > 0 ? totalDebit.toFixed(0) : '0'}</td>
                <td className="border border-black p-2">{totalCredit > 0 ? totalCredit.toFixed(0) : '0'}</td>
                <td className="border border-black p-2">
                  {Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' Dr.' : ' Cr.')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans">
      <header className="bg-[#000080] px-4 py-4 border-b border-[#000060] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#000060] rounded-full transition-colors shrink-0 -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-white text-[#000080] flex items-center justify-center font-bold text-base shrink-0">
              {account.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h2 className="font-extrabold text-white text-lg leading-tight truncate max-w-[150px]">{account.name}</h2>
                {account.phone ? (
                  <p className="text-xs text-white/70">{account.phone}</p>
                ) : (
                  <p className="text-xs text-white/70">No phone number</p>
                )}
              </div>
              <button onClick={() => setShowAccountInfo(true)} className="p-1 rounded-full hover:bg-[#000060] transition-colors">
                <Info className="w-4 h-4 text-white/70 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center w-10 h-10 bg-[#000060] text-white hover:bg-[#000050] rounded-full transition-colors shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="bg-white p-6 shadow-sm border-b border-slate-200 flex flex-col items-center shrink-0 relative">
        <button
          onClick={() => setIsLedgerView(true)}
          className="flex items-center gap-2 px-4 py-2 mb-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full text-sm font-bold transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>View Ledger</span>
        </button>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Net Balance</p>
        <h3
          className={`text-4xl font-bold mb-1 ${
            accountTotalDebit > accountTotalCredit ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {formatCurrency(Math.abs(balance))}
        </h3>
        <p className="text-sm text-slate-500 font-medium mb-5">
          {isOwed ? t.youGave : isOwing ? t.youGot : t.settled}
        </p>

        <div className="w-full flex justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="text-center w-1/2 border-r border-slate-200">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t.youGave}</p>
             <p className="text-rose-600 font-bold mt-1">{formatCurrency(accountTotalDebit)}</p>
          </div>
          <div className="text-center w-1/2">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t.youGot}</p>
             <p className="text-emerald-600 font-bold mt-1">{formatCurrency(accountTotalCredit)}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 relative">
        <div className="max-w-3xl mx-auto w-full">
          {account.transactions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-400">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="text-slate-600 font-bold">{t.noTransactions}</p>
              <p className="text-sm text-slate-400 mt-1">{t.addEntryToStart}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                [...account.transactions]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .reduce((acc, txn) => {
                    const dateObj = new Date(txn.date);
                    const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(dateObj);
                    if (!acc[monthYear]) acc[monthYear] = [];
                    acc[monthYear].push(txn);
                    return acc;
                  }, {} as Record<string, typeof account.transactions>)
              ).map(([monthYear, txns]) => (
                <div key={monthYear} className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide pl-1 sticky top-0 bg-slate-50 py-1 z-10">
                    {monthYear}
                  </div>
                  <div className="flex flex-col gap-3">
                    {txns.map((txn) => (
                      <div
                        key={txn.id}
                        onMouseDown={() => handleTouchStart(txn)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onTouchStart={() => handleTouchStart(txn)}
                        onTouchEnd={handleTouchEnd}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer active:scale-[0.99] select-none"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-slate-500">
                              {new Intl.DateTimeFormat('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }).format(new Date(txn.date))}
                            </p>
                            {txn.isEdited && (
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">EDITED</span>
                            )}
                          </div>
                          {txn.note ? (
                            <p className="font-bold text-slate-800">{txn.note}</p>
                          ) : (
                            <p className="font-medium text-slate-400 opacity-80">{t.noNote}</p>
                          )}
                        </div>
                        <div
                          className={`font-bold text-xl whitespace-nowrap flex items-center gap-1 ${
                            txn.type === 'got' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          <span>{txn.type === 'got' ? '+' : '-'}</span> <span>{formatCurrency(txn.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Transaction Form Overlay */}
      {isAddingMode ? (
        <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h2
              className={`text-xl font-bold mb-6 ${
                isAddingMode === 'got' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isAddingMode === 'got' ? t.youGotMoney : t.youGaveMoney}
            </h2>
            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-slate-50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="date"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  value={txnDate}
                  onChange={(e) => setTxnDate(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.enterDetails}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMode(null);
                    setEditingTxnId(null);
                    setEditingTxn(null);
                  }}
                  className="flex-1 py-4 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!amount || isNaN(Number(amount))}
                  className={`flex-1 py-4 px-4 text-white rounded-xl font-bold disabled:opacity-50 transition-colors ${
                    isAddingMode === 'got' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100'
                  }`}
                >
                  {editingTxnId ? 'Save Changes' : t.saveEntry}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-slate-200 flex gap-4 shrink-0 justify-center transition-colors duration-200">
          <div className="flex gap-4 w-full max-w-3xl">
            <button
              onClick={() => setIsAddingMode('gave')}
              className="flex-1 bg-rose-50 text-rose-600 border border-rose-200 py-4 rounded-xl font-bold shadow-sm hover:bg-rose-100 transition-colors active:scale-[0.98]"
            >
              {t.youGave} <span className="text-rose-500 ml-1">(-)</span>
            </button>
            <button
              onClick={() => setIsAddingMode('got')}
              className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-4 rounded-xl font-bold shadow-sm hover:bg-emerald-100 transition-colors active:scale-[0.98]"
            >
              {t.youGot} <span className="text-emerald-500 ml-1">(+)</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white rounded-t-2xl p-6 shadow-xl w-full max-w-md animate-in slide-in-from-bottom-full duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setShowSettings(false);
                  setShowDeleteWarning(true);
                }}
                className="w-full py-4 px-4 bg-rose-50 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This action cannot be undone. All transactions associated with this account will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteWarning(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteWarning(false);
                  setShowMpinForDelete(true);
                }}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccountInfo && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Account Details</h3>
              <button onClick={() => setShowAccountInfo(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Account Name</p>
                <p className="font-semibold text-slate-800">{account.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contact Number</p>
                <p className="font-semibold text-slate-800">{account.phone || '-'}</p>
              </div>
              {account.gstin && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">GSTIN</p>
                  <p className="font-semibold text-slate-800">{account.gstin}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Account Since</p>
                <p className="font-semibold text-slate-800">{new Date(account.createdAt || new Date()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteWarning && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Account</h3>
            <p className="text-slate-600 text-center mb-6">Are you sure you want to delete this account and all its transactions? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showMpinForDelete && (
        <MPINModal
          mode="verify"
          expectedMpin={mpin}
          title="Enter MPIN to Delete"
          onSuccess={handleMpinSuccess}
          onCancel={() => setShowMpinForDelete(false)}
        />
      )}

      {showEditConfirmation && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-6 uppercase">Do you want to edit this entry?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditConfirmation(false);
                  setEditingTxn(null);
                  if (pressTimer) clearTimeout(pressTimer);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditConfirmation(false);
                  setShowMpinForEdit(true);
                }}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showMpinForEdit && (
        <MPINModal
          mode="verify"
          expectedMpin={mpin}
          title="Enter MPIN to Edit Entry"
          onSuccess={handleEditMpinSuccess}
          onCancel={() => {
            setShowMpinForEdit(false);
            setEditingTxn(null);
            if (pressTimer) clearTimeout(pressTimer);
          }}
        />
      )}
    </div>
  );
}
