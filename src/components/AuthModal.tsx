import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../lib/api';
import { X, KeyRound, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { user, login, logout } = useAuth();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await sendOtp(clean);
      setStep('otp');
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
        setOtp(res.debugOtp);
      }
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(phone.replace(/\D/g, ''), otp.trim(), name);
      login(res.user);
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC700] text-[#0A192F] flex items-center justify-center font-black text-xs">
              QZ
            </div>
            <h2 className="text-base font-bold text-[#0A192F]">
              {user ? 'My Profile' : 'Sign In to Quikzo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {user ? (
            /* Logged in view */
            <div className="text-center space-y-4 py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
                {user.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-500 font-medium">+91 {user.phone}</p>
                {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Customer
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Customer Login only */
            <>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {step === 'phone' ? (
                /* Step 1: Phone number */
                <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Your Full Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-600 font-bold font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono tracking-wider text-xs"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      We will send a 6-digit verification code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP via SMS'}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-gray-700">Enter 6-Digit OTP *</label>
                      <button
                        type="button"
                        onClick={() => setStep('phone')}
                        className="text-[11px] text-emerald-700 font-bold hover:underline"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono tracking-widest text-sm"
                      />
                    </div>

                    {debugOtp && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                        <span>Verification Code: <strong className="font-mono text-sm">{debugOtp}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtp(debugOtp)}
                          className="text-xs font-bold text-emerald-800 underline"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Log In'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
