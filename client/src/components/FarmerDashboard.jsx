import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Building,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  DollarSign,
  Phone,
  Calendar,
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // New Produce Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'kg',
    price: '',
    available_quantity: '',
    harvest_date: new Date().toISOString().split('T')[0],
    pickup_available: 1,
    delivery_available: 1,
    organic_certified: 1,
    description: '',
    image_url: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.getFarmerProducts(),
        api.getFarmerOrders(),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (orderRes.success) setOrders(orderRes.data);
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
      setError('Unable to fetch farmer data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    let cancellationReason = null;
    if (newStatus === 'cancelled') {
      cancellationReason = window.prompt(
        'Please state reason for cancelling this order (e.g. crop weather disruption / out of stock):',
        'Crop stock damaged or unavailable'
      );
      if (cancellationReason === null) return;
    }

    setActionLoading(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, {
        status: newStatus,
        cancellationReason,
      });
      if (res.success) {
        await fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Add or Edit Product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save produce listing');
    }
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      unit: p.unit,
      price: p.price,
      available_quantity: p.available_quantity,
      harvest_date: p.harvest_date,
      pickup_available: p.pickup_available,
      delivery_available: p.delivery_available,
      organic_certified: p.organic_certified,
      description: p.description || '',
      image_url: p.image_url || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this produce listing?')) return;
    try {
      await api.deleteProduct(id);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Summary KPIs
  const totalListings = products.length;
  const activeStock = products.filter((p) => p.status === 'active' && p.available_quantity > 0).length;
  const totalSalesRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'requested').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar_url ||
              'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
              <span className="text-2xs font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Farmer
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {user?.farm_name} • {user?.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                category: 'Vegetables',
                unit: 'kg',
                price: '',
                available_quantity: '',
                harvest_date: new Date().toISOString().split('T')[0],
                pickup_available: 1,
                delivery_available: 1,
                organic_certified: 1,
                description: '',
                image_url:
                  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>List New Produce</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Total Produce</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalListings}</div>
          <p className="text-2xs text-slate-400 mt-1">Listed varieties</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">In-Stock Crops</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{activeStock}</div>
          <p className="text-2xs text-slate-400 mt-1">Ready for fulfillment</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalSalesRevenue}</div>
          <p className="text-2xs text-slate-400 mt-1">Completed orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Pending Orders</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{pendingOrdersCount}</div>
          <p className="text-2xs text-slate-400 mt-1">Awaiting confirmation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Incoming Buyer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produce Inventory ({products.length})</span>
        </button>
      </div>

      {/* Tab 1: Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-bold text-slate-700">No incoming orders yet</p>
              <p className="text-xs text-slate-400 mt-1">
                When buyers place orders for your produce, they will appear here for confirmation.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {order.order_number}
                      </span>
                      <span className="text-2xs text-slate-500">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1.5 flex items-center gap-2">
                      <span>Buyer: {order.buyer_name}</span>
                      <span>•</span>
                      <span className="text-slate-500">{order.buyer_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-2xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'accepted'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Status: {order.status}
                    </span>

                    <span className="text-base font-black text-slate-900">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                {/* Items from this farmer */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-2xs font-bold uppercase text-slate-400">Produce Ordered:</h5>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                      >
                        <span className="font-bold text-slate-800">{item.product_name}</span>
                        <span className="text-slate-600 font-medium">
                          {item.quantity} {item.unit} (₹{item.subtotal})
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5">
                    <h5 className="text-2xs font-bold uppercase text-slate-400">Logistics & Address:</h5>
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      {order.delivery_option === 'delivery' ? (
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>
                        {order.delivery_option === 'delivery'
                          ? 'Doorstep Delivery'
                          : 'Farm Depot Pickup'}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 leading-relaxed">
                      {order.delivery_address}
                    </p>
                    <p className="text-2xs text-slate-500">
                      Payment Mode: <strong className="capitalize">{order.payment_method?.replace(/_/g, ' ')}</strong>
                    </p>
                  </div>
                </div>

                {/* Action Buttons for Lifecycle */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                    {order.status === 'requested' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'accepted')}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Order & Start Packing</span>
                      </button>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup / Dispatch</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Delivered & Completed</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      disabled={actionLoading === order.id}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject / Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Produce</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Units Sold</th>
                  <th className="py-3.5 px-4">Harvest Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-2xs text-slate-400 font-mono">
                          Batch: {p.batch_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{p.category}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{p.price} / {p.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          p.available_quantity > 10 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {p.available_quantity} {p.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">
                      {p.units_sold || 0} {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{p.harvest_date}</td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Edit produce"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                        title="Delete produce"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Produce Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              {editingProduct ? 'Edit Produce Listing' : 'List New Fresh Produce'}
            </h3>

            <form onSubmit={handleSubmitProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Produce Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Nashik Red Onions"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Herbs & Spices">Herbs & Spices</option>
                    <option value="Organic Produce">Organic Produce</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit of Measure:</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="quintal">quintal (100 kg)</option>
                    <option value="crate">crate (10-20 kg)</option>
                    <option value="dozen">dozen</option>
                    <option value="litre">litre</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹ per unit):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Available Quantity:</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.available_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, available_quantity: e.target.value })
                    }
                    placeholder="e.g. 250"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Harvest / Availability Date:</label>
                <input
                  type="date"
                  required
                  value={formData.harvest_date}
                  onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL (Unsplash or direct):</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Quality Notes:</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe farm practices, soil health, variety..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.pickup_available === 1}
                    onChange={(e) =>
                      setFormData({ ...formData, pickup_available: e.target.checked ? 1 : 0 })
                    }
                    className="text-emerald-600 rounded"
                  />
                  <span>Farm Pickup</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.delivery_available === 1}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery_available: e.target.checked ? 1 : 0 })
                    }
                    className="text-emerald-600 rounded"
                  />
                  <span>Local Delivery</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.organic_certified === 1}
                    onChange={(e) =>
                      setFormData({ ...formData, organic_certified: e.target.checked ? 1 : 0 })
                    }
                    className="text-emerald-600 rounded"
                  />
                  <span>Certified Organic</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Produce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

