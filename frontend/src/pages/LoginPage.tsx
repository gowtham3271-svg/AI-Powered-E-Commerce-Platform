import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      
      {/* Brand Header (Snitch Minimalist Typography) */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mx-auto shadow-2xl">
          <User size={20} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          {isRegistering ? 'Create Your Account' : 'Welcome back to BuySmart'}
        </h1>
        <p className="text-xs text-neutral-400">
          {isRegistering ? 'Join BuySmart to access your wishlist, bag, and instant checkout' : 'Sign in to access your orders, saved addresses, and bag'}
        </p>
      </div>

      {/* Main Monochrome Card */}
      <div className="bg-neutral-950 rounded-2xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-6">
        
        {/* Tab Toggle (Snitch Monochrome Pill) */}
        <div className="p-1 rounded-xl bg-black flex border border-neutral-800 text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              !isRegistering ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              isRegistering ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegistering && (
            <div>
              <label className="font-bold uppercase tracking-wider text-neutral-300 block mb-1 text-[11px]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
                <User size={15} className="absolute left-3 top-3 text-neutral-500" />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold uppercase tracking-wider text-neutral-300 block mb-1 text-[11px]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <Mail size={15} className="absolute left-3 top-3 text-neutral-500" />
            </div>
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-neutral-300 block mb-1 text-[11px]">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <Lock size={15} className="absolute left-3 top-3 text-neutral-500" />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="font-bold uppercase tracking-wider text-neutral-300 block mb-1 text-[11px]">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-white transition-colors"
              >
                <option value="customer">Customer Account</option>
                <option value="admin">Store Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? 'Complete Registration' : 'Sign In Now'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login Credentials */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">
            Quick 1-Click Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('john@example.com', 'customer123')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <User size={13} /> Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@buysmart.com', 'admin123')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={13} /> Demo Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};