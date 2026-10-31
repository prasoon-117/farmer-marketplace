import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  Info,
  BadgeCheck,
} from 'lucide-react';

export default function ProductCard({ product, onSelectDetails }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [qty, setQty] = useState(1);

  const available = Number(product.available_quantity);
  const initial = Number(product.initial_quantity) || available;
  const isOutOfStock = available <= 0;
  const stockPercentage = initial > 0 ? Math.min(100, Math.round((available / initial) * 100)) : 0;

  const handleQtyChange = (delta) => {
    setQty((prev) => Math.max(1, Math.min(prev + delta, available)));
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, qty);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Product Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-2xs font-extrabold uppercase tracking-wide bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-xs">
            {product.category}
          </span>
          {product.organic_certified === 1 && (
            <span className="text-2xs font-extrabold bg-emerald-600 text-white px-2 py-1 rounded-full shadow-xs flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              Organic
            </span>
          )}
        </div>

        {/* Batch Number & Traceability Pill */}
        <button
          onClick={() => onSelectDetails(product)}
          className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-slate-800 text-2xs font-bold px-2.5 py-1 rounded-lg shadow-md backdrop-blur-md flex items-center gap-1 transition-transform active:scale-95"
          title="Inspect batch provenance"
        >
          <Info className="w-3 h-3 text-emerald-600" />
          <span>Batch {product.batch_number || 'Trace'}</span>
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-sm px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Farm Name & Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700">{product.farm_name || product.farmer_name}</span>
            <span>•</span>
            <span className="truncate">{product.farmer_location}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelectDetails(product)}
            className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-1 transition-colors"
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mt-1 mb-3">
            {product.description}
          </p>

          {/* Harvest Date & Fulfillment Options */}
          <div className="grid grid-cols-2 gap-2 text-2xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Harvest: {product.harvest_date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {product.delivery_available && product.pickup_available
                  ? 'Pickup & Delivery'
                  : product.delivery_available
                  ? 'Delivery Only'
                  : 'Pickup Only'}
              </span>
            </div>
          </div>

          {/* Inventory Stock Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-2xs font-semibold mb-1">
              <span className="text-slate-500">Live Inventory:</span>
              <span className={available > 10 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {available} {product.unit} available
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stockPercentage > 30 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.max(5, stockPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-2xs text-slate-400 font-medium block">Price / {product.unit}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">₹{product.price}</span>
              <span className="text-xs text-slate-500 font-medium">/{product.unit}</span>
            </div>
          </div>

          {!isOutOfStock ? (
            <div className="flex items-center gap-2">
              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                <button
                  onClick={() => handleQtyChange(-1)}
                  disabled={qty <= 1}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-800">{qty}</span>
                <button
                  onClick={() => handleQtyChange(1)}
                  disabled={qty >= available}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="bg-slate-200 text-slate-400 text-xs font-bold px-4 py-2 rounded-xl cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
