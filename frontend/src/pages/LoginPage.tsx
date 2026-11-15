import React, { useState } from 'react';
import { Sparkles, User, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/30">
          <Sparkles size={24} />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {isRegistering ? 'Create your Account' : 'Welcome back to BuySmart'}
        </h1>
        <p className="text-xs text-slate-400">
          {isRegistering ? 'Join BuySmart to start shopping with AI guidance' : 'Sign in to access your orders, cart, and personalized assistant'}
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Tab Toggle */}
        <div className="p-1 rounded-xl bg-slate-950 flex border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegistering ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegistering ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegistering && (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <User size={15} className="absolute left-3 top-3 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="customer">Customer Account</option>
                <option value="admin">Store Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? 'Complete Registration' : 'Sign In Now'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Credentials */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Quick College Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('john@example.com', 'customer123')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@buysmart.com', 'admin123')}
              className="p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 hover:text-white border border-indigo-800/50 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <ShieldCheck size={13} /> Demo Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
