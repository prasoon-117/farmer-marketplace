import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  ChevronDown,
  Menu,
  X,
  Store,
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, openAuthModal }) {
  const { user, logout, demoLogin, demoAccounts } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const { lang, setLang, t } = useLanguage();

  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDemoSwitch = async (roleOrEmail) => {
    try {
      await demoLogin(roleOrEmail);
      setIsDemoMenuOpen(false);
      // Auto-navigate to relevant dashboard
      if (roleOrEmail === 'farmer' || roleOrEmail.includes('patel')) {
        setCurrentView('farmer_dashboard');
      } else if (roleOrEmail === 'admin') {
        setCurrentView('admin_dashboard');
      } else {
        setCurrentView('buyer_dashboard');
      }
    } catch (err) {
      console.error('Demo switch error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView('market')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t('brandName')}
                </span>
                <span className="text-2xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  HACK-P309
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t('brandSubtitle')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('market')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'market'
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {t('browseMarket')}
            </button>

            <button
              onClick={() => setCurrentView('trends')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                currentView === 'trends'
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {t('priceTrends')}
            </button>

            {user?.role === 'farmer' && (
              <button
                onClick={() => setCurrentView('farmer_dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'farmer_dashboard'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('farmerDashboard')}
              </button>
            )}

            {user?.role === 'buyer' && (
              <button
                onClick={() => setCurrentView('buyer_dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'buyer_dashboard'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {t('buyerDashboard')}
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin_dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin_dashboard'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {t('adminDashboard')}
              </button>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{lang}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 p-1 hidden group-hover:block group-focus-within:block z-50">
                <button
                  onClick={() => setLang('en')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 flex items-center justify-between ${
                    lang === 'en' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  English <span>🇺🇸</span>
                </button>
                <button
                  onClick={() => setLang('hi')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 flex items-center justify-between ${
                    lang === 'hi' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  हिन्दी <span>🇮🇳</span>
                </button>
                <button
                  onClick={() => setLang('es')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 flex items-center justify-between ${
                    lang === 'es' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  Español <span>🇪🇸</span>
                </button>
              </div>
            </div>

            {/* Demo Quick Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all shadow-2xs"
                title="Switch demo persona for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline">Demo Persona:</span>
                <span className="capitalize font-extrabold text-amber-800">
                  {user ? user.role : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {isDemoMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-amber-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Quick Persona Switcher
                    </p>
                    <p className="text-2xs text-slate-500">
                      Instantly test distinct role workflows & permissions
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => handleDemoSwitch('farmer')}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5 ${
                        user?.role === 'farmer'
                          ? 'bg-emerald-50 border border-emerald-300'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">👨‍🌾</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Rajesh Patel</span>
                          <span className="text-2xs bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Farmer
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 truncate">
                          Green Valley Farm (Manage produce & orders)
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDemoSwitch('buyer')}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5 ${
                        user?.role === 'buyer'
                          ? 'bg-blue-50 border border-blue-300'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">🛒</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Priya Sharma</span>
                          <span className="text-2xs bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                            Buyer
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 truncate">
                          Household Buyer (Browse, order & track)
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDemoSwitch('admin')}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5 ${
                        user?.role === 'admin'
                          ? 'bg-purple-50 border border-purple-300'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">🛡️</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Market Admin</span>
                          <span className="text-2xs bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 truncate">
                          Platform moderation & transaction audits
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-all border border-slate-200"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-xs font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-white animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile or Sign In */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <img
                  src={
                    user.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-200 space-y-2 bg-white">
            <button
              onClick={() => {
                setCurrentView('market');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-800 hover:bg-slate-100"
            >
              {t('browseMarket')}
            </button>
            <button
              onClick={() => {
                setCurrentView('trends');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {t('priceTrends')}
            </button>
            {user?.role === 'farmer' && (
              <button
                onClick={() => {
                  setCurrentView('farmer_dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-bold text-emerald-700 bg-emerald-50"
              >
                {t('farmerDashboard')}
              </button>
            )}
            {user?.role === 'buyer' && (
              <button
                onClick={() => {
                  setCurrentView('buyer_dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-bold text-emerald-700 bg-emerald-50"
              >
                {t('buyerDashboard')}
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentView('admin_dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-bold text-purple-700 bg-purple-50"
              >
                {t('adminDashboard')}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

