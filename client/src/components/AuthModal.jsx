import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, User, Lock, Mail, Phone, MapPin, Building } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('buyer'); // 'buyer' | 'farmer'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    farm_name: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ ...formData, role });
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(targetRole);
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {isRegister ? 'Join Farmer Marketplace' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? 'Connect directly to fresh farm harvests'
              : 'Sign in to access your orders and produce dashboard'}
          </p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 mb-5">
          <div className="flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-wider text-amber-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Hackathon 1-Click Evaluation Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('farmer')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-2xs font-bold transition-all shadow-2xs"
            >
              👨‍🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              className="py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-xl text-2xs font-bold transition-all shadow-2xs"
            >
              🛒 Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-xl text-2xs font-bold transition-all shadow-2xs"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Custom Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  role === 'buyer'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Buyer Account
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  role === 'farmer'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Farmer Producer
              </button>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address:</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. you@example.com"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password:</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone:</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Region:</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Nashik"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {role === 'farmer' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Farm / Enterprise Name:</label>
                  <input
                    type="text"
                    value={formData.farm_name}
                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    placeholder="e.g. Surya Organic Orchards"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-emerald-700 hover:underline"
              >
                Register as Farmer / Buyer
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

