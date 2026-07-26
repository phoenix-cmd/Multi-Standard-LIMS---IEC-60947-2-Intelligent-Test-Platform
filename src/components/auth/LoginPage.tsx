import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Activity, CheckCircle } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('priya.sharma@lab.in');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen w-full bg-surface-950 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden text-surface-100">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Branding */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-surface-50 leading-none">LABORATORY INTELLIGENCE</h1>
            <span className="text-xs text-brand-400 font-mono tracking-widest uppercase">Multi-Standard IEC 60947-2 Platform</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-surface-400 bg-surface-900/80 px-3 py-1.5 rounded-full border border-surface-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Enterprise OS Kernel v1.0 • Secure Auth
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center my-8 z-10">
        <div className="w-full max-w-md bg-surface-900/90 backdrop-blur-xl border border-surface-800/80 rounded-2xl p-8 shadow-2xl relative">
          
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-800 border border-surface-700 mb-3 text-brand-400">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-surface-50">Enterprise Sign In</h2>
            <p className="text-sm text-surface-400 mt-1">Authenticate to access protected laboratory controls</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
                User Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-950 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  placeholder="name@lab.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-surface-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-950 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-surface-400 hover:text-surface-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-surface-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-surface-950 border-surface-700 text-brand-500 focus:ring-0 cursor-pointer"
                />
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Session...
                </>
              ) : (
                <>
                  Sign In to Enterprise LIMS
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Shortcuts for Demo/Evaluation */}
          <div className="mt-8 pt-6 border-t border-surface-800">
            <span className="block text-xs font-mono text-surface-400 uppercase tracking-widest text-center mb-3">
              Quick Role Login Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('priya.sharma@lab.in', 'Password123!')}
                className="p-2 bg-surface-950 hover:bg-surface-800 border border-surface-800 rounded-lg text-left transition-all group"
              >
                <p className="text-xs font-bold text-surface-200 group-hover:text-brand-400">Priya Sharma</p>
                <p className="text-[10px] text-surface-400 font-mono">Lead Engineer</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('arjun.menon@lab.in', 'Admin@123456!')}
                className="p-2 bg-surface-950 hover:bg-surface-800 border border-surface-800 rounded-lg text-left transition-all group"
              >
                <p className="text-xs font-bold text-surface-200 group-hover:text-amber-400">Dr. Arjun Menon</p>
                <p className="text-[10px] text-surface-400 font-mono">Lab Director (Admin)</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.verma@lab.in', 'Password123!')}
                className="p-2 bg-surface-950 hover:bg-surface-800 border border-surface-800 rounded-lg text-left transition-all group"
              >
                <p className="text-xs font-bold text-surface-200 group-hover:text-emerald-400">Rahul Verma</p>
                <p className="text-[10px] text-surface-400 font-mono">Technician</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sunita@lab.in', 'Password123!')}
                className="p-2 bg-surface-950 hover:bg-surface-800 border border-surface-800 rounded-lg text-left transition-all group"
              >
                <p className="text-xs font-bold text-surface-200 group-hover:text-purple-400">Sunita Krishnan</p>
                <p className="text-[10px] text-surface-400 font-mono">Quality Inspector</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-surface-50 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-400" /> Reset Password
            </h3>
            <p className="text-xs text-surface-300">
              For enterprise security, password resets are processed via Administrator invitation or directory service integration.
            </p>
            <div className="bg-surface-950 p-3 rounded-xl text-xs text-surface-400 space-y-1 font-mono">
              <p className="text-brand-400 font-semibold">Contact Admin:</p>
              <p>Email: admin@lab.in</p>
              <p>Support: +91 20 6711 0000</p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer System Compliance Notice */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-surface-500 z-10 gap-2 border-t border-surface-900 pt-4">
        <p>© 2026 ABB Electrification & Multi-Standard LIMS Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> ISO/IEC 17025 Compliant</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 21 CFR Part 11 Audit Trail</span>
        </div>
      </footer>
    </div>
  );
}
