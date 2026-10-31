import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Building,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function CartDrawer({ onOrderSuccess, openAuthModal }) {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useCart();
  const { user, isAuthenticated, demoLogin } = useAuth();
  const { t } = useLanguage();

  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' | 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.location || 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai 400050'
  );
  const [paymentMethod, setPaymentMethod] = useState('cash_on_pickup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isDrawerOpen) return null;

  const handleCheckout = async () => {
    setErrorMessage(null);

    // If not authenticated, automatically log in as demo buyer or open modal
    if (!isAuthenticated) {
      try {
        await demoLogin('buyer');
      } catch (err) {
        openAuthModal();
        return;
      }
    }

    if (items.length === 0) return;

    if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide a delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress.trim() : 'Farm Depot Pickup',
        paymentMethod:
          deliveryOption === 'pickup' && paymentMethod === 'cash_on_delivery'
            ? 'cash_on_pickup'
            : paymentMethod,
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        clearCart();
        setIsDrawerOpen(false);
        onOrderSuccess(res.data.order);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Your Fresh Produce Cart</h2>
            <span className="text-2xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body / Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
              <p className="text-sm font-semibold">{t('emptyCart')}</p>
              <p className="text-xs text-slate-400 mt-1">
                Browse our fresh harvest catalog to add direct produce.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/70"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-2xs text-slate-500">
                        {item.product.farm_name} • ₹{item.product.price}/{item.product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= Number(item.product.available_quantity)}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-900">
                      ₹{item.subtotal}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              {/* Delivery Option */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Fulfillment Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryOption('pickup');
                      setPaymentMethod('cash_on_pickup');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                      deliveryOption === 'pickup'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <span>Farm Pickup</span>
                    </div>
                    <span className="text-2xs font-normal text-slate-500">
                      Collect at farmer depot
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryOption('delivery');
                      setPaymentMethod('cash_on_delivery');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                      deliveryOption === 'delivery'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Local Delivery</span>
                    </div>
                    <span className="text-2xs font-normal text-slate-500">
                      Direct doorstep drop
                    </span>
                  </button>
                </div>
              </div>

              {/* Delivery Address Input */}
              {deliveryOption === 'delivery' && (
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Delivery Address:
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter building, street, and pin code..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              {/* Payment Mode (Prototype Notice) */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Payment Method (Simulated):
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="payment"
                      checked={
                        deliveryOption === 'pickup'
                          ? paymentMethod === 'cash_on_pickup'
                          : paymentMethod === 'cash_on_delivery'
                      }
                      onChange={() =>
                        setPaymentMethod(
                          deliveryOption === 'pickup' ? 'cash_on_pickup' : 'cash_on_delivery'
                        )
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">
                      {deliveryOption === 'pickup'
                        ? 'Cash / UPI upon Farm Pickup'
                        : 'Cash / Pay on Doorstep Delivery'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'simulated_escrow'}
                      onChange={() => setPaymentMethod('simulated_escrow')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">
                      Simulated Escrow (Instant Demo Settlement)
                    </span>
                  </label>
                </div>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Safety banner */}
              <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-2xs text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Hackathon Demo Rule:</strong> Payments and deliveries are simulated for safety. Never enter real credit cards.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-xs text-slate-500 font-semibold">Order Subtotal:</span>
              <span className="text-2xl font-black text-slate-900">₹{totalAmount}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Order...' : 'Confirm Order Request'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
