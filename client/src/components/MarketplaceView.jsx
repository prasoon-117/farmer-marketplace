import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductDetailsModal from './ProductDetailsModal';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  Check,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Leaf,
  Users,
  Coins,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Dairy & Eggs',
  'Herbs & Spices',
  'Organic Produce',
];

export default function MarketplaceView() {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  // Metadata
  const [locations, setLocations] = useState([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Fetch filter metadata
  useEffect(() => {
    api.getCategoriesAndLocations()
      .then((res) => {
        if (res.success && res.data.locations) {
          setLocations(res.data.locations);
        }
      })
      .catch((err) => console.error('Failed to load filter metadata:', err));
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLocation !== 'All') params.location = selectedLocation;
      if (inStockOnly) params.inStockOnly = 'true';
      if (organicOnly) params.organicOnly = 'true';
      if (sort) params.sort = sort;

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Unable to load marketplace produce. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedLocation, inStockOnly, organicOnly, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setInStockOnly(false);
    setOrganicOnly(false);
    setSort('newest');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Agricultural Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto px-6 py-12 sm:py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>Farm-To-Fork Direct Agriculture Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fair Trade For Farmers. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-200 to-teal-200">
              Honest Quality For Buyers.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            Eliminate commission-heavy middlemen. Connect directly with certified regional farmers, inspect harvest dates and batch provenance, and order fresh produce transparently.
          </p>

          {/* Quick Value Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <Coins className="w-5 h-5 text-lime-400 mb-1" />
              <div className="text-lg font-black text-white">0% Middleman</div>
              <p className="text-2xs text-emerald-200">Farmers keep 100% of price</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <Leaf className="w-5 h-5 text-emerald-300 mb-1" />
              <div className="text-lg font-black text-white">100% Traceable</div>
              <p className="text-2xs text-emerald-200">Real harvest dates & batch IDs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <Users className="w-5 h-5 text-teal-300 mb-1" />
              <div className="text-lg font-black text-white">6 Regional Hubs</div>
              <p className="text-2xs text-emerald-200">Punjab, Nashik, Shimla & more</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-amber-300 mb-1" />
              <div className="text-lg font-black text-white">Direct Pickup</div>
              <p className="text-2xs text-emerald-200">Farm gate or direct delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Section */}
      <section className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce (e.g. Basmati, Onions, Apples), farm name, or city..."
              className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm font-medium shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Location, Stock, Organic, Sort */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Location selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Origin:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Regions</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock Only Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>In Stock Only</span>
            </label>

            {/* Organic Only Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Certified Organic</span>
            </label>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">Newest Harvest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="harvest_desc">Freshest Harvest Date</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Available Produce Listings{' '}
            <span className="text-xs font-semibold text-slate-500">
              ({products.length} found)
            </span>
          </h2>
          {(selectedCategory !== 'All' ||
            selectedLocation !== 'All' ||
            inStockOnly ||
            organicOnly ||
            search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl h-96 border border-slate-100 p-4 animate-pulse flex flex-col justify-between"
              >
                <div className="bg-slate-100 h-48 rounded-2xl w-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-800">
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No produce matching criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Try adjusting your category, removing the stock filter, or searching with another keyword.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectDetails={(p) => setSelectedProductDetails(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
        />
      )}
    </div>
  );
}

