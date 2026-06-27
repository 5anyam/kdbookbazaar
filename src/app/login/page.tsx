'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { Lock, User, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">

        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 bg-[#ff3131] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-500">
            Login to your <span className="text-[#ff3131] font-semibold">KD Book Bazaar</span> account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400"
                  placeholder="Enter username or email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#ff3131] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff3131] hover:bg-[#cc0000] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...</>
              ) : (
                <>Login to KD Book Bazaar <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">New to KD Book Bazaar?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link
            href={`/register${redirectTo !== '/dashboard' ? `?redirect=${redirectTo}` : ''}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
          >
            Create an Account
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">
          By logging in, you agree to our{' '}
          <Link href="/terms-and-conditions" className="text-[#ff3131] hover:underline">Terms & Conditions</Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="text-[#ff3131] hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}
