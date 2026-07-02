import React, { useState } from 'react';
import { ArrowLeft, Lock, User, Edit2, Check, X } from 'lucide-react';
import { MPINModal } from './MPINModal';
import { Language, translations } from '../lib/i18n';

interface SettingsProps {
  onBack: () => void;
  mpin: string;
  setMpin: (val: string) => void;
  language: Language;
  businessDetails?: any;
  onUpdateBusinessDetails?: (details: { name: string; phone: string; gstin: string }) => void;
}

export function SettingsView({ onBack, mpin, setMpin, language, businessDetails, onUpdateBusinessDetails }: SettingsProps) {
  const t = translations[language];
  const [showMpinModal, setShowMpinModal] = useState(false);
  const [showEditMpinModal, setShowEditMpinModal] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editForm, setEditForm] = useState({
    name: businessDetails?.name || '',
    phone: businessDetails?.phone || '',
    gstin: businessDetails?.gstin || ''
  });
  
  const handleChangeMpinClick = () => {
    setShowMpinModal(true);
  };

  const handleMpinSuccess = (pin: string) => {
    setMpin(pin);
    setShowMpinModal(false);
    setSuccessMessage('MPIN changed successfully.');
  };

  const handleEditAccountClick = () => {
    setShowEditMpinModal(true);
  };

  const handleEditMpinSuccess = (pin: string) => {
    if (pin === mpin) {
      setShowEditMpinModal(false);
      setIsEditingAccount(true);
      setEditForm({
        name: businessDetails?.name || '',
        phone: businessDetails?.phone || '',
        gstin: businessDetails?.gstin || ''
      });
    }
  };

  const handleSaveAccount = () => {
    if (!editForm.name.trim()) return;
    if (onUpdateBusinessDetails) {
      onUpdateBusinessDetails(editForm);
    }
    setIsEditingAccount(false);
    setSuccessMessage('Account details updated successfully.');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      <header className="bg-[#000080] border-b border-[#000060] px-4 py-4 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-[#000060] rounded-full transition-colors shrink-0 -ml-2">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">{t.settings}</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto pb-24 scrollbar-hide">
        {businessDetails && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 relative group">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">My Account</h2>
              </div>
              {!isEditingAccount && (
                <button
                  onClick={handleEditAccountClick}
                  className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingAccount ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business/User Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editForm.gstin}
                    onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none font-bold uppercase"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditingAccount(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveAccount}
                    disabled={!editForm.name.trim()}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Business / User Name</p>
                  <p className="font-bold text-slate-800 text-lg">{businessDetails.name}</p>
                </div>
                {businessDetails.phone && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</p>
                    <p className="font-bold text-slate-800">{businessDetails.phone}</p>
                  </div>
                )}
                {businessDetails.gstin && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GSTIN</p>
                    <p className="font-bold text-slate-800">{businessDetails.gstin}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-auto">
          <button onClick={handleChangeMpinClick} className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
              <span className="font-semibold text-slate-800">{t.changeMpin}</span>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-4 pb-2 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">&copy; FIWB Solutions, 2026.</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Made in India</p>
        </div>
      </main>

      {showMpinModal && (
        <MPINModal
          mode="change"
          expectedMpin={mpin}
          onSuccess={handleMpinSuccess}
          onCancel={() => setShowMpinModal(false)}
        />
      )}

      {showEditMpinModal && (
        <MPINModal
          mode="verify"
          title="Enter MPIN to Edit Details"
          expectedMpin={mpin}
          onSuccess={handleEditMpinSuccess}
          onCancel={() => setShowEditMpinModal(false)}
        />
      )}

      {successMessage && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Success</h3>
            <p className="text-slate-600 text-center mb-6">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
