import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import Navbar from './components/Navbar';
import MarketplaceView from './components/MarketplaceView';
import BuyerDashboard from './components/BuyerDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import AdminDashboard from './components/AdminDashboard';
import PriceTrendsView from './components/PriceTrendsView';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

import { Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState('market'); // 'market' | 'trends' | 'buyer_dashboard' | 'farmer_dashboard' | 'admin_dashboard'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orderToast, setOrderToast] = useState(null);

  const handleOrderSuccess = (order) => {
    setOrderToast(order);
    setCurrentView('buyer_dashboard');
    setTimeout(() => {
      setOrderToast(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Prototype Safety & Evaluation Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-600/30">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-950" />
        <span>
          HACK-P309 Hackathon Prototype • Cash on Pickup & Simulated Orders Enabled • Switch personas via top-right "Demo Persona"
        </span>
      </div>

      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Order Success Toast Alert */}
      {orderToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-800 text-white p-4 rounded-2xl shadow-2xl border border-emerald-600 flex items-start gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-black text-sm">Order Placed Successfully!</h4>
            <p className="mt-0.5 text-emerald-100">
              Order <span className="font-mono font-bold text-white">{orderToast.order_number}</span> has been transmitted to participating farmers.
            </p>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {currentView === 'market' && <MarketplaceView />}
        {currentView === 'trends' && <PriceTrendsView onBrowseCrop={() => setCurrentView('market')} />}
        {currentView === 'buyer_dashboard' && (
          <BuyerDashboard onBrowseMarket={() => setCurrentView('market')} />
        )}
        {currentView === 'farmer_dashboard' && <FarmerDashboard />}
        {currentView === 'admin_dashboard' && <AdminDashboard />}
      </main>

      {/* Global Slide-Over Cart */}
      <CartDrawer
        onOrderSuccess={handleOrderSuccess}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {}}
      />

      {/* Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
