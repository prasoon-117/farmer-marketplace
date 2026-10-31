import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  X,
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Plus,
  Minus,
  ShoppingBag,
  Award,
} from 'lucide-react';

export default function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const available = Number(product.available_quantity);
  const isOutOfStock = available <= 0;

  const handleQtyChange = (delta) => {
    setQty((prev) => Math.max(1, Math.min(prev + delta, available)));
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image side */}
          <div className="relative h-64 md:h-full min-h-[300px] bg-slate-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                {product.category}
              </span>
              {product.organic_certified === 1 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  100% Certified Organic
                </span>
              )}
            </div>
          </div>

          {/* Details side */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{product.farmer_location}</span>
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-2">
                {product.name}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Farmer Profile Box */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      product.farmer_avatar ||
                      'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={product.farmer_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {product.farm_name || 'Independent Producer'}
                    </h4>
                    <p className="text-2xs text-slate-500 font-medium">
                      Managed by {product.farmer_name}
                    </p>
                  </div>
                </div>
                {product.farmer_bio && (
                  <p className="text-2xs text-slate-600 mt-2 italic">
                    "{product.farmer_bio}"
                  </p>
                )}
                {product.farmer_phone && (
                  <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-800 mt-2">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Farmer Helpline: {product.farmer_phone}</span>
                  </div>
                )}
              </div>

              {/* Traceability Metadata */}
              <div className="space-y-1.5 text-2xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Harvest Date:</span>
                  <span className="font-bold">{product.harvest_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Traceability Batch:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {product.batch_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fulfillment:</span>
                  <span className="font-bold">
                    {product.pickup_available && product.delivery_available
                      ? 'Farm Pickup & Local Delivery'
                      : product.delivery_available
                      ? 'Local Delivery Only'
                      : 'Farm Pickup Only'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-400">Price / Unit</span>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{product.price}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      /{product.unit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Available Stock</span>
                  <div className="text-sm font-bold text-emerald-700">
                    {available} {product.unit}
                  </div>
                </div>
              </div>

              {!isOutOfStock ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      disabled={qty <= 1}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQtyChange(1)}
                      disabled={qty >= available}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {qty} to Cart (₹{qty * product.price})</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 text-rose-600 font-bold bg-rose-50 rounded-xl text-xs">
                  Currently Sold Out. Check back next harvest season!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
