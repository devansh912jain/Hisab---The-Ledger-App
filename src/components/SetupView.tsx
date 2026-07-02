import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { translations, Language } from '../lib/i18n';

interface SetupViewProps {
  onComplete: (details: { name: string; phone: string; gstin: string; mpin: string }, lang: Language) => void;
}

export function SetupView({ onComplete }: SetupViewProps) {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Business/Your name is required');
      return;
    }
    if (mpin.length !== 4) {
      setError('MPIN must be exactly 4 digits');
      return;
    }
    if (mpin !== confirmMpin) {
      setError('MPINs do not match');
      return;
    }
    
    if (gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim())) {
        setError('Invalid GSTIN format');
        return;
      }
    }

    onComplete({
      name: name.trim(),
      phone: phone.trim(),
      gstin: gstin.trim().toUpperCase(),
      mpin
    }, lang);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
             <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hisaab</h1>
          <p className="text-slate-500 font-medium mt-2">Setup your business profile</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-200 p-1 rounded-lg flex gap-1">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${lang === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${lang === 'hi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              हिंदी
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">{t.fullName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Manglam Agency"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">{t.mobileNumber}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 9876543210"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">GSTIN (Optional)</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => { setGstin(e.target.value.toUpperCase()); setError(''); }}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              placeholder="e.g. 22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Set 4-Digit MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center tracking-widest text-lg font-bold"
                placeholder="••••"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Confirm MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmMpin}
                onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center tracking-widest text-lg font-bold"
                placeholder="••••"
              />
            </div>
          </div>

          {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors mt-6"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
