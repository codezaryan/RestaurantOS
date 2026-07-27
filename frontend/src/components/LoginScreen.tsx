import React, { useState } from 'react';
import { api } from '../api';
import { Sparkles, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const DEMO_CREDENTIALS = [
  { role: 'Owner', email: 'owner@restaurantos.io', password: 'password123' },
  { role: 'Manager', email: 'manager@restaurantos.io', password: 'password123' },
  { role: 'Chef', email: 'chef@restaurantos.io', password: 'password123' },
  { role: 'Waiter', email: 'waiter@restaurantos.io', password: 'password123' },
  { role: 'Cashier', email: 'cashier@restaurantos.io', password: 'password123' },
  { role: 'Store Manager', email: 'store@restaurantos.io', password: 'password123' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.login(email, password);
      localStorage.setItem('restaurant_os_user', JSON.stringify({ email }));
      onLoginSuccess();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      await api.login(demoEmail, demoPassword);
      localStorage.setItem('restaurant_os_user', JSON.stringify({ email: demoEmail }));
      onLoginSuccess();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 shadow-lg shadow-blue-500/30 border border-white/20 mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Restaurant<span className="text-blue-400">OS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI-Powered Restaurant Management Platform</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="text-center border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Secure Login</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials to access the platform</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurantos.io"
                className="w-full glass-input p-3 rounded-xl text-sm text-white placeholder-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input p-3 rounded-xl text-sm text-white placeholder-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Quick Login</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              All demo accounts use password: <span className="font-mono text-amber-400 font-bold">password123</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => handleDemoLogin(cred.email, cred.password)}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
                >
                  <Shield className={`w-3 h-3 ${
                    cred.role === 'Owner' ? 'text-purple-400' :
                    cred.role === 'Manager' ? 'text-blue-400' :
                    cred.role === 'Chef' ? 'text-amber-400' :
                    cred.role === 'Waiter' ? 'text-emerald-400' :
                    cred.role === 'Cashier' ? 'text-rose-400' :
                    'text-cyan-400'
                  }`} />
                  <span>{cred.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          RestaurantOS v1.0.0 — Full Stack Developer Technical Assessment
        </p>
      </div>
    </div>
  );
};

