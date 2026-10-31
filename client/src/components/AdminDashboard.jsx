import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'users'
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts({ status: filterStatus }),
        api.getAdminUsers(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [filterStatus]);

  const handleModerate = async (productId, status) => {
    const reason = window.prompt(
      `Please provide reason for marking listing as ${status}:`,
      status === 'flagged' ? 'Duplicate produce listing or price discrepancy' : 'Approved after verification'
    );
    if (reason === null) return;

    setActionLoading(productId);
    try {
      const res = await api.moderateProduct(productId, { status, reason });
      if (res.success) {
        await fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Moderation action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Platform Admin & Moderation</h1>
              <span className="text-2xs font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                Audit Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Overseeing platform integrity, fair trade guidelines, and listing authenticity
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Total Users</span>
            <div className="text-2xl font-black text-slate-900">
              {stats.users?.total_users || 0}
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              {stats.users?.total_farmers} Farmers • {stats.users?.total_buyers} Buyers
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Total Listings</span>
            <div className="text-2xl font-black text-purple-700">
              {stats.products?.total_products || 0}
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              {stats.products?.active_products} Active • {stats.products?.flagged_products} Flagged
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Total Orders</span>
            <div className="text-2xl font-black text-blue-700">
              {stats.orders?.total_orders || 0}
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              {stats.orders?.completed_orders} Completed • {stats.orders?.requested_orders} Pending
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Platform GMV</span>
            <div className="text-2xl font-black text-emerald-700">
              ₹{stats.orders?.gross_merchandise_value || 0}
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              ₹{stats.orders?.completed_volume || 0} delivered volume
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Listing Moderation Queue ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Platform Users ({users.length})</span>
        </button>
      </div>

      {/* Moderation Queue Table */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Filter by status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
            >
              <option value="all">All Listings</option>
              <option value="active">Active Only</option>
              <option value="flagged">Flagged Only</option>
              <option value="removed">Removed Only</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Farmer / Farm</th>
                  <th className="py-3 px-4">Price / Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-2xs text-slate-400">
                          {p.category} • Batch: {p.batch_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{p.farm_name}</span>
                      <span className="text-2xs text-slate-400">{p.farmer_location}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">₹{p.price} / {p.unit}</span>
                      <span className="text-2xs text-emerald-700 font-semibold">
                        {p.available_quantity} {p.unit} left
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-2xs font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          p.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'flagged'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {p.status !== 'active' && (
                        <button
                          onClick={() => handleModerate(p.id, 'active')}
                          disabled={actionLoading === p.id}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-2xs"
                        >
                          Approve
                        </button>
                      )}
                      {p.status !== 'flagged' && (
                        <button
                          onClick={() => handleModerate(p.id, 'flagged')}
                          disabled={actionLoading === p.id}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg text-2xs"
                        >
                          Flag
                        </button>
                      )}
                      {p.status !== 'removed' && (
                        <button
                          onClick={() => handleModerate(p.id, 'removed')}
                          disabled={actionLoading === p.id}
                          className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-2xs"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Directory Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={u.avatar_url}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-2xs text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-2xs font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          u.role === 'farmer'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {u.location || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {u.role === 'farmer'
                        ? `${u.products_count || 0} produce listed`
                        : `${u.orders_count || 0} orders placed`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-2xs">
                      {u.phone || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
