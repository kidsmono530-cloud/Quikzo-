import React, { useState } from 'react';
import { adminLogin } from '../../lib/api';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminLogin(email.trim(), password);
      if (res.success && res.token) {
        onLoginSuccess();
      } else {
        setError('Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Access denied: Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center font-black text-xl mx-auto shadow-md">
            <Lock className="w-7 h-7 text-gray-950 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Quikzo Store Owner Portal
          </h1>
          <p className="text-xs text-gray-400">
            Sign in with authorized administrator credentials to manage inventory, orders, and store settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-300 block mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="owner@yourdomain.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl focus:border-amber-400 focus:outline-hidden text-white placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-300 block mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl focus:border-amber-400 focus:outline-hidden text-white placeholder:text-gray-600 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-800/80 text-center">
          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Customer Store
          </button>
        </div>
      </div>
    </div>
  );
};
