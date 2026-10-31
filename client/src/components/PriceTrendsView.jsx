import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  TrendingUp,
  Percent,
  Calendar,
  Info,
  CheckCircle,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export default function PriceTrendsView({ onBrowseCrop }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPriceTrends()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch((err) => console.error('Failed to load price trends:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <TrendingUp className="w-4 h-4 text-lime-400" />
            <span>Fair Trade Mandi Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Transparent Pricing Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Compare real-time direct farm gate prices against regional wholesale APMC mandis and urban supermarket retail rates.
          </p>
        </div>
      </div>

      {/* Insight Highlight Cards */}
      {data?.insights && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs uppercase tracking-wider font-extrabold text-emerald-800">
                Buyer Economic Advantage
              </span>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">
                {data.insights.averageBuyerSavings} Lower
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Direct purchasing bypasses multiple layers of logistics, packing, and wholesale commission margins.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs uppercase tracking-wider font-extrabold text-amber-800">
                Farmer Value Realization
              </span>
              <div className="text-2xl font-black text-amber-950 mt-0.5">
                {data.insights.averageFarmerEarningGain}
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Farmers take home superior remuneration compared to distressed distress sales at traditional mandis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Crop Price Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Direct Farmer Price vs. APMC Mandi vs. Supermarket Retail
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading benchmark data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Produce Item</th>
                  <th className="py-3.5 px-4 text-emerald-700">Direct Farmer Price</th>
                  <th className="py-3.5 px-4 text-slate-500">Mandi Rate</th>
                  <th className="py-3.5 px-4 text-rose-600">Supermarket Retail</th>
                  <th className="py-3.5 px-4 text-center">Buyer Savings</th>
                  <th className="py-3.5 px-4">Optimal Season</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.benchmarks?.map((b) => (
                  <tr key={b.crop} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {b.crop}
                      <span className="text-2xs font-normal text-slate-400 block">
                        Per {b.unit}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ₹{b.farmerPrice}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-500">
                      ₹{b.mandiRate}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-500 line-through">
                      ₹{b.supermarketPrice}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-2xs">
                        Save {b.savingsPct}%
                      </span>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-600 flex items-center gap-1.5 pt-5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.bestSeason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Methodology Disclaimer */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-2xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Data aggregated across key regional agricultural production belts (Maharashtra, Punjab, Tamil Nadu, Himachal Pradesh, Gujarat). Price benchmarks represent seasonal averages and demonstrate the transparent margin distribution enabled by KisanSetu direct marketplace architecture.
        </p>
      </div>
    </div>
  );
}

