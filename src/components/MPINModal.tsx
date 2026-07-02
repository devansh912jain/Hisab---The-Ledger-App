import React, { useState } from 'react';

interface MPINModalProps {
  mode: 'create' | 'verify' | 'change';
  onSuccess: (mpin: string) => void;
  onCancel?: () => void;
  expectedMpin?: string;
  title?: string;
}

export function MPINModal({ mode, onSuccess, onCancel, expectedMpin, title }: MPINModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'initial' | 'confirm'>('initial');
  const [firstPin, setFirstPin] = useState('');
  
  // For change mode
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (mode === 'change') {
      if (currentPin !== expectedMpin) {
        setError('Incorrect Current MPIN.');
        return;
      }
      if (newPin.length !== 4) {
        setError('New MPIN must be 4 digits.');
        return;
      }
      if (newPin !== confirmNewPin) {
        setError('New MPINs do not match.');
        return;
      }
      onSuccess(newPin);
      return;
    }

    if (pin.length !== 4) {
      setError('MPIN must be 4 digits.');
      return;
    }
    
    if (mode === 'verify') {
      if (expectedMpin && pin !== expectedMpin) {
        setError('Incorrect MPIN.');
        setPin('');
        return;
      }
      onSuccess(pin);
    } else if (mode === 'create') {
      if (step === 'initial') {
        setFirstPin(pin);
        setPin('');
        setStep('confirm');
      } else {
        if (pin === firstPin) {
          onSuccess(pin);
        } else {
          setError('MPINs do not match. Try again.');
          setPin('');
          setStep('initial');
          setFirstPin('');
        }
      }
    }
  };

  if (mode === 'change') {
    return (
      <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
          <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Change MPIN</h2>
          <p className="text-center text-slate-500 text-sm mb-6">Enter your current MPIN and set a new one.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Current MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) => { setCurrentPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">New MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Confirm New MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmNewPin}
                onChange={(e) => { setConfirmNewPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
              />
            </div>

            {error && <p className="text-rose-500 text-sm text-center font-medium">{error}</p>}

            <div className="flex gap-3 mt-6">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={currentPin.length !== 4 || newPin.length !== 4 || confirmNewPin.length !== 4}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const currentTitle = title || (
    mode === 'verify' ? 'Enter MPIN' : 
    step === 'initial' ? 'Create MPIN' : 'Confirm MPIN'
  );

  const currentDesc = mode === 'create'
    ? (step === 'initial' ? 'Set a 4-digit passcode to secure your app.' : 'Please re-enter your 4-digit MPIN to confirm.')
    : 'Please enter your 4-digit MPIN to continue.';

  return (
    <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-2">
          {currentTitle}
        </h2>
        <p className="text-center text-slate-500 text-sm mb-6">
          {currentDesc}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              className="w-32 text-center text-3xl tracking-[0.5em] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPin(val);
                setError('');
                if (val.length === 4) {
                  if (mode === 'verify') {
                     if (expectedMpin && val !== expectedMpin) {
                       setError('Incorrect MPIN.');
                       setPin('');
                     } else {
                       onSuccess(val);
                     }
                  } else if (mode === 'create') {
                     if (step === 'initial') {
                       setFirstPin(val);
                       setPin('');
                       setStep('confirm');
                     } else {
                       if (val === firstPin) {
                         onSuccess(val);
                       } else {
                         setError('MPINs do not match. Try again.');
                         setPin('');
                         setStep('initial');
                         setFirstPin('');
                       }
                     }
                  }
                }
              }}
            />
          </div>
          {error && <p className="text-rose-500 text-sm text-center font-medium">{error}</p>}

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {mode === 'create' ? (step === 'initial' ? 'Next' : 'Confirm') : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
