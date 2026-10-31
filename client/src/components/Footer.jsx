import React from 'react';
import { Store, ShieldCheck, Heart, Code2 } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg">KisanSetu • Farmer Marketplace</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Full-Stack Web Application for Hackathon Problem Statement{' '}
              <strong className="text-emerald-400">HACK-P309</strong>. Enabling direct produce trade between certified regional farmers and consumer households, restaurants, and retailers.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-2xs font-semibold border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prototype Safety: Simulated transactions & local pickup demo</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('market')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Browse Fresh Produce
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('trends')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Mandi Price Benchmarks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('buyer_dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Buyer Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('farmer_dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Farmer Produce Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin_dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Admin Moderation Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Submission Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Hackathon Submission
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>
                <strong className="text-white">Subject:</strong> Backend Web Development
              </p>
              <p>
                <strong className="text-white">Problem ID:</strong> HACK-P309
              </p>
              <p>
                <strong className="text-white">Stack:</strong> React + Node.js + SQLite
              </p>
              <p>
                <strong className="text-white">Team Size:</strong> 4 Students
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-slate-500">
          <p>© 2026 KisanSetu Farmer Marketplace • Built for Academic & Hackathon Demonstration.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for direct agricultural empowerment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
