import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  loginWithEmail,
  registerWithEmail,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp
} from '../lib/api';
import { QuikzoLogo } from './QuikzoLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface LoginScreenProps {
  onSuccess: () => void;
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onContinueAsGuest
}) => {
  const { login } = useAuth();

  // Mode: 'email' or 'otp'
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');

  // Email sub-states: 'login' | 'register' | 'forgot'
  const [emailSubView, setEmailSubView] = useState<'login' | 'register' | 'forgot'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneForRegister, setPhoneForRegister] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  // OTP Login fields
  const [mobilePhone, setMobilePhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const clearFeedback = () => {
    setError(null);
    setSuccessMsg(null);
  };

  // --- Handlers: Email Login ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(email.trim(), password);
      login(res.user);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Email Register ---
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phoneForRegister.replace(/\D/g, '')
      });
      login(res.user);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Forgot Password ---
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSuccessMsg(res.message);
      if (res.debugResetCode) {
        setResetCode(res.debugResetCode);
      }
      setForgotStep('reset');
    } catch (err: any) {
      setError(err.message || 'Unable to find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!resetCode.trim() || !newPassword) {
      setError('Please enter the reset code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword
      });
      setSuccessMsg(res.message);
      setEmailSubView('login');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Mobile OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const clean = mobilePhone.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(clean);
      setOtpSent(true);
      setResendCountdown(res.resendAvailableInSeconds || 30);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
        setOtpCode(res.debugOtp);
      }
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please verify mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(mobilePhone.replace(/\D/g, ''), otpCode.trim(), name);
      login(res.user);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B0B] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Banner Notice */}
      <div className="bg-[#FFCD00] text-[#0B0B0B] py-2 px-4 text-center text-xs font-black shadow-2xs border-b border-amber-300">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-[#0B0B0B]" />
          <span>⚡ Lightning 10-15 Min Grocery Delivery • Welcome to Quikzo!</span>
        </span>
      </div>

      {/* Main Login Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-400">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <QuikzoLogo size="lg" showTagline={false} />
            <div className="pt-2">
              <h1 className="text-2xl font-black text-[#0B0B0B] tracking-tight">
                Welcome to Quikzo
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Fresh groceries delivered in 10-15 minutes
              </p>
            </div>
          </div>

          {/* Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-2xl text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                clearFeedback();
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                authMethod === 'email'
                  ? 'bg-white text-[#0B0B0B] shadow-2xs font-black'
                  : 'hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4 text-[#0B0B0B]" />
              <span>Email &amp; Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                clearFeedback();
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                authMethod === 'otp'
                  ? 'bg-white text-[#0B0B0B] shadow-2xs font-black'
                  : 'hover:text-gray-900'
              }`}
            >
              <Phone className="w-4 h-4 text-[#0B0B0B]" />
              <span>Mobile OTP</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* OPTION A: EMAIL & PASSWORD                                     */}
          {/* ============================================================== */}
          {authMethod === 'email' && (
            <div>
              {emailSubView === 'login' && (
                <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#0B0B0B]">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailSubView('forgot');
                          clearFeedback();
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00]/20 focus:outline-hidden text-gray-900 font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-2xl shadow-md border border-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login to Quikzo</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs">
                    <span className="text-gray-500 font-medium">New to Quikzo? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubView('register');
                        clearFeedback();
                      }}
                      className="font-black text-[#0B0B0B] underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              )}

              {emailSubView === 'register' && (
                <form onSubmit={handleEmailRegister} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      Mobile Number (Optional)
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-gray-200 bg-gray-100 text-gray-600 font-bold font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneForRegister}
                        onChange={e => setPhoneForRegister(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-r-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      Create Password * (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-2xl shadow-md border border-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Quikzo Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center text-xs">
                    <span className="text-gray-500 font-medium">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubView('login');
                        clearFeedback();
                      }}
                      className="font-black text-[#0B0B0B] underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {emailSubView === 'forgot' && (
                <div className="space-y-4 text-xs">
                  {forgotStep === 'request' ? (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                      <div>
                        <label className="font-bold text-[#0A192F] block mb-1">
                          Registered Email Address
                        </label>
                        <p className="text-[11px] text-gray-400 mb-2">
                          We will generate a 6-digit verification code to reset your password.
                        </p>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? 'Sending code...' : 'Send Reset Code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-3.5">
                      <div>
                        <label className="font-bold text-[#0A192F] block mb-1">
                          6-Digit Reset Code
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={resetCode}
                            onChange={e => setResetCode(e.target.value)}
                            placeholder="123456"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-mono tracking-widest text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-[#0A192F] block mb-1">
                          New Password (min 6 characters)
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-medium transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? 'Updating Password...' : 'Save New Password'}
                      </button>
                    </form>
                  )}

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubView('login');
                        clearFeedback();
                      }}
                      className="font-bold text-gray-500 hover:text-[#0A192F]"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* OPTION B: MOBILE NUMBER & OTP                                  */}
          {/* ============================================================== */}
          {authMethod === 'otp' && (
            <div>
              {!otpSent ? (
                /* Step 1: Input mobile number */
                <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-[#0A192F] block mb-1">
                      10-Digit Mobile Number
                    </label>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Enter your mobile number to receive a secure 6-digit OTP.
                    </p>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-gray-200 bg-gray-100 text-[#0A192F] font-black font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobilePhone}
                        onChange={e => setMobilePhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-r-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-mono tracking-wider font-bold transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-2xl shadow-md border border-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send OTP via SMS</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#0A192F]">Enter 6-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          clearFeedback();
                        }}
                        className="text-[11px] font-bold text-[#FF6B00] hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Sent to <strong className="text-gray-700 font-mono">+91 {mobilePhone}</strong>
                    </p>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/10 focus:outline-hidden text-gray-900 font-mono tracking-widest text-base font-bold transition-all text-center"
                      />
                    </div>

                    {/* Verification helper */}
                    {debugOtp && (
                      <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center justify-between">
                        <span>Code received: <strong className="font-mono text-sm">{debugOtp}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(debugOtp)}
                          className="font-bold text-[#FF6B00] underline"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Resend with Countdown */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-500 font-medium">Didn&apos;t get code?</span>
                    {resendCountdown > 0 ? (
                      <span className="font-mono text-xs font-bold text-gray-400">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-2xl shadow-md border border-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify OTP &amp; Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Guest / Browse Mode Option */}
          {onContinueAsGuest && (
            <div className="pt-2 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs font-bold text-gray-500 hover:text-[#0B0B0B] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>Explore Groceries as Guest →</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer Guarantees */}
      <div className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-gray-50/50">
        <p className="font-semibold text-gray-500">
          ⚡ 10-15 Min Superfast Delivery • 100% Secure Checkout • Best Prices in India (₹)
        </p>
      </div>
    </div>
  );
};
