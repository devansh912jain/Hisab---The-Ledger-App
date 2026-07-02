import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AccountDetails } from './components/AccountDetails';
import { AllAccounts } from './components/AllAccounts';
import { SettingsView } from './components/SettingsView';
import { YouView } from './components/YouView';
import { MPINModal } from './components/MPINModal';
import { SetupView } from './components/SetupView';
import { Account, TransactionType, Transaction } from './types';
import { Language } from './lib/i18n';

type ViewState = { type: 'dashboard' } | { type: 'account'; accountId: string } | { type: 'allAccounts' } | { type: 'settings' } | { type: 'you' };

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'dashboard' });
  const [language, setLanguage] = useState<Language>('en');
  
  const [mpin, setMpin] = useState<string>(() => localStorage.getItem('hisaab_mpin') || '');
  const [isMpinSet, setIsMpinSet] = useState<boolean>(!!localStorage.getItem('hisaab_mpin'));
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!localStorage.getItem('hisaab_mpin'));
  
  const [businessName, setBusinessName] = useState<string>(() => {
    const details = localStorage.getItem('hisaab_business');
    if (details) {
      try {
        const parsed = JSON.parse(details);
        return parsed.name || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  const [businessDetails, setBusinessDetails] = useState<any>(() => {
    const details = localStorage.getItem('hisaab_business');
    if (details) {
      try {
        return JSON.parse(details);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const stored = localStorage.getItem('hisaab_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load accounts from local storage', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('hisaab_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (mpin) {
      localStorage.setItem('hisaab_mpin', mpin);
      setIsMpinSet(true);
    }
  }, [mpin]);

  const handleSetupComplete = (details: { name: string; phone: string; gstin: string; mpin: string }, lang: Language) => {
    localStorage.setItem('hisaab_business', JSON.stringify({
      name: details.name,
      phone: details.phone,
      gstin: details.gstin
    }));
    setBusinessDetails({
      name: details.name,
      phone: details.phone,
      gstin: details.gstin
    });
    setBusinessName(details.name);
    setMpin(details.mpin);
    setLanguage(lang);
  };

  const handleAddAccount = (name: string, phone?: string, accountType?: 'individual' | 'business', gstin?: string) => {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name,
      phone,
      accountType,
      gstin,
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
  };

  const handleAddTransaction = (accountId: string, amount: number, type: TransactionType, note: string, dateStr: string) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: dateStr, // Expected YYYY-MM-DD
      amount,
      type,
      note,
    };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            transactions: [newTransaction, ...acc.transactions],
          };
        }
        return acc;
      })
    );
  };

  const handleEditTransaction = (accountId: string, txId: string, amount: number, type: TransactionType, note: string, dateStr: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            transactions: acc.transactions.map(tx => 
              tx.id === txId ? { ...tx, amount, type, note, date: dateStr, isEdited: true } : tx
            ),
          };
        }
        return acc;
      })
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    setView({ type: 'dashboard' });
  };

  const activeAccount = view.type === 'account' ? accounts.find((a) => a.id === view.accountId) : null;

  if (!isMpinSet || !businessName) {
    return (
      <div className="min-h-[100dvh] bg-slate-100 flex items-center justify-center">
        <SetupView onComplete={(details, lang) => {
          handleSetupComplete(details, lang);
          setIsUnlocked(true);
        }} />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-[100dvh] bg-slate-100 flex items-center justify-center sm:py-8">
        <div className="w-full h-[100dvh] sm:h-[800px] sm:max-w-[375px] bg-slate-50 sm:shadow-2xl sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 relative overflow-hidden flex flex-col justify-center items-center">
          <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
             <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hisaab</h2>
          
          <MPINModal
            mode="verify"
            expectedMpin={mpin}
            title="Unlock Hisaab"
            onSuccess={(pin) => setIsUnlocked(true)}
          />
        </div>
      </div>
    );
  }

  const handleUpdateBusinessDetails = (details: { name: string; phone: string; gstin: string }) => {
    const newDetails = { ...businessDetails, ...details };
    localStorage.setItem('hisaab_business', JSON.stringify(newDetails));
    setBusinessDetails(newDetails);
    setBusinessName(details.name);
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0] || name;
  };

  return (
    <div className={`min-h-[100dvh] bg-slate-100 flex items-center justify-center sm:py-8`}>
      <div className="w-full h-[100dvh] sm:h-[800px] sm:max-w-[375px] bg-slate-50 sm:shadow-2xl sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 relative overflow-hidden flex flex-col transition-colors duration-200">
        {view.type === 'dashboard' || (!activeAccount && view.type !== 'allAccounts' && view.type !== 'settings' && view.type !== 'you') ? (
          <Dashboard
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onSelectAccount={(accountId) => setView({ type: 'account', accountId })}
            onViewAll={() => setView({ type: 'allAccounts' })}
            onYouClick={() => setView({ type: 'you' })}
            onSettingsClick={() => setView({ type: 'settings' })}
            language={language}
            setLanguage={setLanguage}
            businessName={getFirstName(businessName)}
          />
        ) : view.type === 'allAccounts' ? (
          <AllAccounts
            accounts={accounts}
            onBack={() => setView({ type: 'dashboard' })}
            onSelectAccount={(accountId) => setView({ type: 'account', accountId })}
            language={language}
          />
        ) : view.type === 'settings' ? (
          <SettingsView
            onBack={() => setView({ type: 'dashboard' })}
            mpin={mpin}
            setMpin={setMpin}
            language={language}
            businessDetails={businessDetails}
            onUpdateBusinessDetails={handleUpdateBusinessDetails}
          />
        ) : view.type === 'you' ? (
          <YouView
            accounts={accounts}
            onBack={() => setView({ type: 'dashboard' })}
            onSelectAccount={(accountId) => setView({ type: 'account', accountId })}
            language={language}
          />
        ) : (
          <AccountDetails
            account={activeAccount!}
            onBack={() => setView({ type: 'dashboard' })}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteAccount={() => handleDeleteAccount(activeAccount!.id)}
            mpin={mpin}
            language={language}
            businessDetails={businessDetails}
          />
        )}
      </div>
    </div>
  );
}
