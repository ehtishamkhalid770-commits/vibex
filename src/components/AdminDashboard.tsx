import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  PlusCircle, 
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
  Edit,
  Sliders,
  Database,
  RefreshCw,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import { 
  isSupabaseConfigured, 
  dbUpsertProduct, 
  dbDeleteProduct, 
  dbUpsertOrder, 
  dbDeleteOrder,
  testConnection,
  SQL_SCHEMA_SETUP
} from '../lib/supabase';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

export default function AdminDashboard({ 
  products, 
  setProducts, 
  orders, 
  setOrders, 
  categories, 
  setCategories, 
  onClose 
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'database'>('analytics');
  
  // Editing state for products
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tees');
  const [gender, setGender] = useState<'Men' | 'Women' | 'Kids' | 'Unisex'>('Unisex');
  const [image, setImage] = useState('');
  const [desc, setDesc] = useState('');
  const [sizes, setSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Vintage Black', hex: '#1a1a1a' }
  ]);
  const [isNew, setIsNew] = useState(true);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Supabase test status
  const [supabaseTest, setSupabaseTest] = useState<{ success: boolean; hasTables?: boolean; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      setIsTestingSupabase(true);
      testConnection().then(res => {
        setSupabaseTest(res);
        setIsTestingSupabase(false);
      });
    }
  }, []);

  const runSupabaseTest = async () => {
    setIsTestingSupabase(true);
    const res = await testConnection();
    setSupabaseTest(res);
    setIsTestingSupabase(false);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const startEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price.toString());
    setCategory(p.category);
    setGender(p.gender as any);
    setImage(p.image);
    setDesc(p.desc || '');
    setSizes(p.sizes || []);
    setColors(p.colors || []);
    setIsNew(p.isNew || false);
    setFormError('');
    setSuccessMsg('Loaded details of "' + p.name + '" for editing.');
  };

  const cancelEditProduct = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategory('Tees');
    setGender('Unisex');
    setImage('');
    setDesc('');
    setSizes(['M', 'L', 'XL']);
    setColors([{ name: 'Vintage Black', hex: '#1a1a1a' }]);
    setIsNew(true);
    setFormError('');
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!name || !price || !image || !desc) {
      setFormError('Please fill in all required fields (Name, Price, Image, Description).');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a positive number.');
      return;
    }

    if (sizes.length === 0) {
      setFormError('Please select at least one available size.');
      return;
    }

    if (editingId) {
      // Edit Mode
      setProducts(prev => {
        const updated = prev.map(p => {
          if (p.id === editingId) {
            const updatedProduct = {
              ...p,
              name,
              price: priceNum,
              category,
              gender,
              image,
              desc,
              sizes,
              colors,
              isNew
            };
            if (isSupabaseConfigured) {
              dbUpsertProduct(updatedProduct);
            }
            return updatedProduct;
          }
          return p;
        });
        localStorage.setItem('vibex_products', JSON.stringify(updated));
        return updated;
      });

      setSuccessMsg('Product updated successfully!');
      setTimeout(() => {
        cancelEditProduct();
      }, 500);
    } else {
      // Add Mode
      const newProduct: Product = {
        id: 'custom-' + Date.now(),
        name,
        price: priceNum,
        category,
        gender,
        image,
        desc,
        rating: 5.0,
        reviews: 1,
        sizes,
        colors,
        isNew
      };

      setProducts(prev => {
        const updated = [newProduct, ...prev];
        localStorage.setItem('vibex_products', JSON.stringify(updated));
        if (isSupabaseConfigured) {
          dbUpsertProduct(newProduct);
        }
        return updated;
      });

      setSuccessMsg('Product added successfully!');
      
      // Clear form
      setName('');
      setPrice('');
      setCategory('Tees');
      setGender('Unisex');
      setImage('');
      setDesc('');
      setSizes(['M', 'L', 'XL']);
      setColors([{ name: 'Vintage Black', hex: '#1a1a1a' }]);
      setIsNew(true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== productId);
        localStorage.setItem('vibex_products', JSON.stringify(updated));
        if (isSupabaseConfigured) {
          dbDeleteProduct(productId);
        }
        return updated;
      });
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status: newStatus };
          if (isSupabaseConfigured) {
            dbUpsertOrder(updatedOrder);
          }
          return updatedOrder;
        }
        return o;
      });
      localStorage.setItem('vibex_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order record? This action cannot be undone.')) {
      setOrders(prev => {
        const updated = prev.filter(o => o.id !== orderId);
        localStorage.setItem('vibex_orders', JSON.stringify(updated));
        if (isSupabaseConfigured) {
          dbDeleteOrder(orderId);
        }
        return updated;
      });
    }
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.total : sum, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  
  // Category sales breakdown
  const categorySales: Record<string, number> = {};
  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    o.items.forEach(item => {
      const cat = item.productId.startsWith('mw-') ? (item.productId === 'mw-1' ? 'Tees' : item.productId === 'mw-2' ? 'Jackets' : item.productId === 'mw-3' ? 'Pants' : 'Accessories') : 'Other';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#060606] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Banner (Admin Control) */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#c25121] to-[#1a1a1a] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-black/40 p-2 border border-white/20 rounded">
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-widest font-display uppercase">VIBEX CONTROL HUB</h1>
            <p className="text-[10px] font-mono opacity-80 uppercase tracking-wider">Role: Admin console | johnalex@gmail.com</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="px-4 py-2 border border-white/30 hover:border-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 rounded bg-black/30 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Exit Admin Hub</span>
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#09090b] p-6 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible">
          <span className="hidden md:block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">WORKSPACE NODES</span>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 cursor-pointer ${activeTab === 'analytics' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Core Analytics</span>
          </button>

          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 cursor-pointer ${activeTab === 'products' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Catalog</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 relative cursor-pointer ${activeTab === 'orders' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Records</span>
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="absolute right-4 bg-orange-600 text-white font-mono text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                {orders.filter(o => o.status === 'Pending').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 relative cursor-pointer ${activeTab === 'database' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Database className="w-4 h-4" />
            <span>Database Setup</span>
            <span className={`w-2 h-2 rounded-full ml-auto ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          </button>

          <div className="hidden md:flex flex-col mt-auto p-4 bg-zinc-950/80 border border-zinc-900 rounded font-mono text-[10px] text-zinc-500 space-y-2">
            <span className="font-bold text-zinc-400">DATABASE INTEGRATION</span>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
              <span>{isSupabaseConfigured ? 'Supabase Active' : 'Offline Sandbox'}</span>
            </div>
            <span className="text-[9px]">Tables synced dynamically.</span>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-grow p-6 sm:p-8 overflow-y-auto bg-[#040404]">
          <AnimatePresence mode="wait">
            
            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase text-white font-display">CORE PERFORMANCE</h2>
                  <p className="text-xs text-zinc-400 font-mono">Live business metrics aggregated from transactions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#09090b] border border-zinc-900 p-6 rounded-lg space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">TOTAL REVENUE</span>
                    <span className="text-3xl font-bold text-white font-display">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-[#09090b] border border-zinc-900 p-6 rounded-lg space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">COMPLETED ORDERS</span>
                    <span className="text-3xl font-bold text-white font-display">{orderCount}</span>
                  </div>
                  <div className="bg-[#09090b] border border-zinc-900 p-6 rounded-lg space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">AVERAGE BASKET VALUE</span>
                    <span className="text-3xl font-bold text-orange-500 font-display">${avgOrderValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-[#09090b] border border-zinc-900 p-6 rounded-lg">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">Sales by Category Breakdown</h3>
                  <div className="space-y-4">
                    {Object.keys(categorySales).length === 0 ? (
                      <p className="text-xs text-zinc-600 font-mono italic">No transactions recorded yet.</p>
                    ) : (
                      Object.entries(categorySales).map(([cat, amount]) => {
                        const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono text-zinc-300">
                              <span>{cat}</span>
                              <span className="text-orange-400 font-bold">${amount.toFixed(2)} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                              <div className="bg-[#c25121] h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: CATALOG */}
            {activeTab === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Form Column */}
                <div className="lg:col-span-5 bg-[#09090b] border border-zinc-900 p-6 rounded-lg space-y-6 self-start">
                  <div>
                    <h2 className="text-sm font-bold tracking-widest uppercase font-mono text-[#c25121]">
                      {editingId ? 'EDIT CAT_ITEM' : 'INSERT CATALOGUE ITEM'}
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {editingId ? `Modifying ID: ${editingId}` : 'Create a brand new listing'}
                    </p>
                  </div>

                  {formError && (
                    <div className="bg-red-950/40 border border-red-900/60 p-3 rounded text-red-400 text-[10px] font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-950/40 border border-emerald-900/60 p-3 rounded text-emerald-400 text-[10px] font-mono flex items-center gap-1.5">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">PRODUCT NAME</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">PRICE (USD)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">GENDER SEGMENT</label>
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        >
                          <option value="Unisex">Unisex</option>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Kids">Kids</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">CATEGORY</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center pt-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-mono text-zinc-300">
                          <input 
                            type="checkbox"
                            checked={isNew}
                            onChange={(e) => setIsNew(e.target.checked)}
                            className="rounded border-zinc-800 bg-black text-[#c25121] focus:ring-0"
                          />
                          <span>MARK AS "NEW" ARRIVAL</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">IMAGE SOURCE URL</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. https://images.unsplash.com/..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">STORY DESCRIPTION</label>
                      <textarea 
                        required
                        rows={3}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="submit"
                        className="flex-grow bg-[#c25121] hover:bg-[#a34117] text-white py-2.5 rounded font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                      >
                        {editingId ? 'COMMIT CHANGES' : 'PUBLISH ITEM'}
                      </button>
                      {editingId && (
                        <button 
                          type="button"
                          onClick={cancelEditProduct}
                          className="px-4 py-2.5 border border-zinc-800 hover:border-zinc-700 rounded font-mono text-xs text-zinc-400 hover:text-white"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">CATALOG LISTINGS ({products.length})</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
                    {products.map(p => (
                      <div key={p.id} className="bg-[#09090b] border border-zinc-900 p-4 rounded-lg flex gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded border border-zinc-800 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                            <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 mt-0.5">
                              <span>{p.category}</span>
                              <span>•</span>
                              <span>{p.gender}</span>
                              <span>•</span>
                              <span className="text-orange-400 font-bold">${p.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => startEditProduct(p)}
                            className="p-2 border border-zinc-800 hover:border-[#c25121] rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 border border-zinc-800 hover:border-red-500/30 rounded text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase text-white font-display">TRANSACTION REGISTRY</h2>
                  <p className="text-xs text-zinc-400 font-mono">Manage order shipments, fulfillment, and status codes.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-[#09090b] border border-zinc-900 rounded-lg p-12 text-center text-zinc-500 font-mono text-xs">
                    No orders have been recorded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {orders.map(order => (
                      <div key={order.id} className="bg-[#09090b] border border-zinc-900 rounded-lg overflow-hidden">
                        
                        {/* Order Header */}
                        <div className="bg-zinc-950/60 border-b border-zinc-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-white">ORDER #{order.id}</span>
                              <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                order.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                                order.status === 'Shipped' ? 'bg-blue-950 text-blue-400 border border-blue-900/40' :
                                order.status === 'Cancelled' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                                'bg-orange-950 text-orange-400 border border-orange-900/40'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-zinc-500">{order.date}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] text-zinc-500 uppercase">FULFILLMENT:</span>
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                                className="bg-black border border-zinc-800 text-zinc-300 font-mono text-[10px] uppercase rounded px-2 py-1 outline-none focus:border-[#c25121]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 border border-zinc-800 hover:border-red-500/30 hover:text-red-500 rounded text-zinc-500 transition-all cursor-pointer"
                              title="Delete Order Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Left: Customer Info */}
                          <div className="md:col-span-4 space-y-4 font-mono text-[11px] text-zinc-400 border-b md:border-b-0 md:border-r border-zinc-900 pb-6 md:pb-0 md:pr-6">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-2">SHIPPING & CONTACT</span>
                            <div className="space-y-2">
                              <div className="flex gap-2 items-start">
                                <span className="text-zinc-600 uppercase shrink-0 w-12">NAME:</span>
                                <span className="text-zinc-200">{order.buyerName}</span>
                              </div>
                              <div className="flex gap-2 items-start">
                                <span className="text-zinc-600 uppercase shrink-0 w-12">EMAIL:</span>
                                <span className="text-zinc-200 truncate">{order.buyerEmail}</span>
                              </div>
                              <div className="flex gap-2 items-start">
                                <span className="text-zinc-600 uppercase shrink-0 w-12">PHONE:</span>
                                <span className="text-zinc-200">{order.buyerPhone || 'None Provided'}</span>
                              </div>
                              <div className="flex gap-2 items-start">
                                <span className="text-zinc-600 uppercase shrink-0 w-12">ADDR:</span>
                                <span className="text-zinc-200 leading-relaxed">{order.buyerAddress}</span>
                              </div>
                            </div>
                          </div>

                          {/* Center: Items */}
                          <div className="md:col-span-5 space-y-3 pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-zinc-900 md:pr-6">
                            <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider block mb-2">ITEMS PURCHASED</span>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center text-xs">
                                  <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-zinc-900" />
                                  <div className="flex-grow min-w-0">
                                    <h5 className="font-bold text-zinc-200 truncate">{item.name}</h5>
                                    <p className="font-mono text-[9px] text-zinc-500 mt-0.5">
                                      QTY: {item.quantity} | SIZE: {item.selectedSize} | {item.selectedColor.name}
                                    </p>
                                  </div>
                                  <span className="font-mono text-zinc-400 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Summary */}
                          <div className="md:col-span-3 flex flex-col justify-between">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider block mb-2">SUMMARY</span>
                              <div className="space-y-1.5 font-mono text-[10px] text-zinc-500">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-red-500">
                                    <span>Discount:</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>Shipping:</span>
                                  <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-between items-baseline">
                              <span className="font-mono text-[9px] text-zinc-400 uppercase">TOTAL:</span>
                              <span className="text-lg font-bold text-orange-400 font-display">${order.total.toFixed(2)}</span>
                            </div>
                          </div>

                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: DATABASE / SUPABASE SETUP */}
            {activeTab === 'database' && (
              <motion.div 
                key="database"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-widest uppercase text-white font-display">SUPABASE INTEGRATION</h2>
                  <p className="text-xs text-zinc-400 font-mono">Verify keys, review sync states, and deploy your tables.</p>
                </div>

                <div className="bg-[#09090b] border border-zinc-900 p-6 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded border ${isSupabaseConfigured ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400' : 'bg-amber-950/40 border-amber-900/60 text-amber-400'}`}>
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Connection Status</h3>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          {isSupabaseConfigured ? 'API Keys detected in system environment.' : 'Currently running in local-only offline sandbox.'}
                        </p>
                      </div>
                    </div>

                    {isSupabaseConfigured && (
                      <button 
                        onClick={runSupabaseTest}
                        disabled={isTestingSupabase}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[10px] uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-55"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                        <span>TEST CLIENT</span>
                      </button>
                    )}
                  </div>

                  {/* Supabase Test Output */}
                  {isSupabaseConfigured && supabaseTest && (
                    <div className={`p-4 rounded-md text-xs font-mono border ${
                      supabaseTest.success && supabaseTest.hasTables !== false
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                        : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <span className="font-bold block">Test Report:</span>
                          <p>{supabaseTest.message}</p>
                          {supabaseTest.success && supabaseTest.hasTables === false && (
                            <button
                              onClick={() => setShowSqlSchema(true)}
                              className="mt-2 text-[10px] underline hover:text-white uppercase font-bold tracking-wider cursor-pointer"
                            >
                              DISPLAY SQL SETUP SCRIPT
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!isSupabaseConfigured && (
                    <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded text-xs font-mono text-zinc-400 space-y-2">
                      <p className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">⚠️ TO CONNECT YOUR SUPABASE DATABASE:</p>
                      <ol className="list-decimal list-inside space-y-1.5 text-[11px] pl-1">
                        <li>Go to the <span className="text-white font-bold">Settings -&gt; Secrets</span> menu in the AI Studio UI.</li>
                        <li>Add your <span className="text-orange-400">VITE_SUPABASE_URL</span> and <span className="text-orange-400">VITE_SUPABASE_ANON_KEY</span> secrets.</li>
                        <li>Restart the application for changes to take effect.</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* SQL Schema Deployment Script */}
                {(showSqlSchema || !isSupabaseConfigured) && (
                  <div className="bg-[#09090b] border border-zinc-900 p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-[#c25121] uppercase tracking-widest">SQL Schema Script</h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Run this SQL inside Supabase SQL Editor to prepare table spaces.</p>
                      </div>
                      <button 
                        onClick={copySqlToClipboard}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[10px] uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSql ? 'COPIED!' : 'COPY SQL'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="bg-black border border-zinc-900 rounded p-4 text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-[350px] leading-relaxed">
                        {SQL_SCHEMA_SETUP}
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
