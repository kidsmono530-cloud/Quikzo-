import React, { useState } from 'react';
import { deliveryLogin } from '../../lib/api';
import { DeliveryBoyProfile } from '../../types';
import { QuikzoLogo } from '../QuikzoLogo';
import {
  Bike,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';

interface DeliveryLoginPageProps {
  onLoginSuccess: (deliveryBoy: DeliveryBoyProfile) => void;
  onBackToStore: () => void;
}

export const DeliveryLoginPage: React.FC<DeliveryLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your assigned username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await deliveryLogin(identifier.trim(), password);
      if (res.success && res.token && res.deliveryBoy) {
        onLoginSuccess(res.deliveryBoy);
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Access denied: Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col justify-center items-center p-4 selection:bg-orange-500 selection:text-white">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <QuikzoLogo size="md" variant="white-text" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery Fleet Partner Portal</span>
          </div>

          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Authorized delivery staff login. Access your live assigned orders, pick up groceries, and collect COD payments.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 font-medium animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-300 block mb-1.5">
              Assigned Username, Email, or Mobile
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={e => {
                  setIdentifier(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. ramesh_quikzo or phone"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-hidden text-white placeholder:text-gray-600 transition-colors font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-300">
                Delivery Account Password
              </label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-hidden text-white placeholder:text-gray-600 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-black text-xs rounded-xl shadow-lg shadow-orange-950/50 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Delivery Account...</span>
              </>
            ) : (
              <>
                <span>Sign In to Delivery Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start gap-2.5 text-[11px] text-gray-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            Delivery accounts are strictly provisioned by store management. Public registration is disabled.
          </p>
        </div>

        {/* Return Button */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Return to Customer Store
          </button>
        </div>
      </div>

      {/* Forgot Password Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Password Recovery</h3>
                <p className="text-xs text-gray-400">Store Administrator Assistance</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              For security compliance, delivery partner account credentials are managed through the <strong>Quikzo Admin Panel</strong>. Please contact your store manager or administrator to reset your password.
            </p>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
