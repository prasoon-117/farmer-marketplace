import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Building,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'requested', label: 'Requested', icon: Clock, desc: 'Awaiting farmer acceptance' },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2, desc: 'Farmer confirmed harvest & packing' },
  { key: 'ready', label: 'Ready', icon: Package, desc: 'Ready for farm pickup / dispatch' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, desc: 'Delivered / collected successfully' },
];

export default function BuyerDashboard({ onBrowseMarket }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Unable to fetch your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt(
      'Please enter a cancellation reason (optional):',
      'Buyer changed requirements'
    );
    if (reason === null) return; // User cancelled prompt

    setActionLoading(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, {
        status: 'cancelled',
        cancellationReason: reason || 'Buyer requested cancellation',
      });
      if (res.success) {
        // Refresh orders
        await fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStepIndex = (status) => {
    if (status === 'requested') return 0;
    if (status === 'accepted') return 1;
    if (status === 'ready') return 2;
    if (status === 'completed') return 3;
    return -1; // cancelled
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
              <span className="text-2xs font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Buyer Account
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {user?.location || 'Direct Produce Consumer'} • {orders.length} Total Orders Placed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onBrowseMarket}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Fresh Catalog</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Active & Historical Orders</span>
          <span className="text-xs font-bold text-slate-400">({orders.length})</span>
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl h-48 border border-slate-100 p-6 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-center">
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Explore available produce from regional farmers and place your first direct order.
            </p>
            <button
              onClick={onBrowseMarket}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const stepIndex = getStepIndex(order.status);
            const isCancelled = order.status === 'cancelled';
            const canCancel = order.status === 'requested';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Order Top Bar */}
                <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                      {order.order_number}
                    </span>
                    <span className="text-2xs text-slate-500 font-medium">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-2xs text-slate-400 uppercase font-bold block">
                        Total Amount
                      </span>
                      <span className="text-base font-black text-slate-900">
                        ₹{order.total_amount}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-2xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : order.status === 'ready'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : order.status === 'accepted'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Stepper Progress Bar (if not cancelled) */}
                {!isCancelled ? (
                  <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 -z-0">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, stepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="grid grid-cols-4 relative z-10 text-center">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= stepIndex;
                          const isCurrent = idx === stepIndex;
                          const Icon = step.icon;

                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-50'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                } ${isCurrent ? 'ring-4 ring-emerald-200 scale-110' : ''}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-xs font-bold mt-2 ${
                                  isDone ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                              <span className="text-2xs text-slate-400 hidden sm:block max-w-[120px]">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50/70 border-b border-rose-100 flex items-center gap-2.5 text-xs text-rose-800">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold">Order Cancelled:</span>{' '}
                      <span>{order.cancellation_reason || 'Cancelled by buyer'}</span>
                      <p className="text-2xs text-rose-600 mt-0.5">
                        Inventory stock was automatically restored to the participating farmers.
                      </p>
                    </div>
                  </div>
                )}

                {/* Items & Logistics Details */}
                <div className="p-5 grid sm:grid-cols-3 gap-6">
                  {/* Items list */}
                  <div className="sm:col-span-2 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Order Produce Items:
                    </h4>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {item.product_name}
                            </span>
                            <span className="text-2xs text-slate-500">
                              {item.farm_name} • ₹{item.unit_price}/{item.unit}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-800">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-2xs text-slate-500 block font-semibold">
                            ₹{item.subtotal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Logistics & Fulfillment Details */}
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        {order.delivery_option === 'delivery' ? (
                          <Truck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Building className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>
                          {order.delivery_option === 'delivery'
                            ? 'Direct Local Delivery'
                            : 'Farm Gate Pickup'}
                        </span>
                      </h4>
                      <p className="text-2xs text-slate-600 leading-relaxed">
                        {order.delivery_address}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 text-2xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment:</span>
                          <span className="font-bold capitalize text-slate-800">
                            {order.payment_method?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Settlement:</span>
                          <span
                            className={`font-bold uppercase ${
                              order.payment_status === 'completed'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Button */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="w-full mt-2 py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>
                          {actionLoading === order.id ? 'Cancelling...' : 'Cancel Order Request'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
