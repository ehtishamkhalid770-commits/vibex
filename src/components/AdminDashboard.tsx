import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Users, 
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
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

const CLOTHING_TEMPLATES = [
  {
    name: 'Vibex Acid Oversized Hoodie',
    price: 65.00,
    category: 'Jackets',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    desc: 'Heavyweight loopback French Terry hoodie. Drop shoulder, oversized drape, distressed finish with high-density screenprinted Vibex core graphics.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Vintage Acid Wash', hex: '#2c2c2c' },
      { name: 'Cyber Orange', hex: '#c25121' }
    ]
  },
  {
    name: 'Cyberpunk Tech Tee',
    price: 32.00,
    category: 'Tees',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    desc: 'Combed ring-spun cotton streetwear tee. High-build glow-in-the-dark graphic prints with dual utility loop accents at the hemline.',
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Stealth Black', hex: '#111111' },
      { name: 'Arctic White', hex: '#f0f0f0' }
    ]
  },
  {
    name: 'Stealth Multipocket Cargo',
    price: 58.00,
    category: 'Pants',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=600&q=80',
    desc: 'High-durability nylon blend utility cargo pants. Features 8 discrete pockets, adjustable strap buckles, and drawstring cinched cuffs.',
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Stealth Black', hex: '#1c1c1e' }
    ]
  },
  {
    name: 'Tactical Ribbed Beanie',
    price: 22.00,
    category: 'Accessories',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&w=600&q=80',
    desc: 'Double-layer merino wool ribbed knit beanie with modular tactical brand woven patch at the center fold-over cuff.',
    sizes: ['One Size'],
    colors: [
      { name: 'Carbon Black', hex: '#222222' },
      { name: 'Vibrant Orange', hex: '#c25121' }
    ]
  },
  {
    name: 'Kids Little Beast Hoodie',
    price: 38.00,
    category: 'Kids',
    gender: 'Kids',
    image: 'https://images.unsplash.com/photo-1622324228944-2522e3d3eb0a?auto=format&fit=crop&w=600&q=80',
    desc: 'Super soft brushed fleece kids hoodie. Feature non-toxic organic dye print of the Vibex mini icon at back.',
    sizes: ['6Y', '8Y', '10Y', '12Y'],
    colors: [
      { name: 'Cyber Orange', hex: '#c25121' },
      { name: 'Charcoal Wash', hex: '#333333' }
    ]
  }
];

export default function AdminDashboard({ products, setProducts, orders, setOrders, categories, setCategories, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add Product Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tees');
  const [newCatName, setNewCatName] = useState('');
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

  const startEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price.toString());
    setCategory(p.category);
    setGender(p.gender as any);
    setImage(p.image);
    setDesc(p.desc);
    setSizes(p.sizes || []);
    setColors(p.colors || []);
    setIsNew(p.isNew || false);
    setFormError('');
    setSuccessMsg('Loaded details of "' + p.name + '" for editing.');
    // Smooth scroll to top of form
    const formBox = document.querySelector('.lg\\:col-span-5');
    if (formBox) {
      formBox.scrollIntoView({ behavior: 'smooth' });
    }
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

  // Helpers for sizing checklist
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size', '4Y', '6Y', '8Y', '10Y', '12Y'];
  
  const handleSizeToggle = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleAddNewCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    
    // Check if category already exists
    if (categories.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
      setFormError(`Category "${trimmed}" already exists.`);
      return;
    }
    
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    const updatedCategories = [...categories, formatted];
    setCategories(updatedCategories);
    localStorage.setItem('vibex_custom_categories', JSON.stringify(updatedCategories.filter(cat => !['Tees', 'Jackets', 'Pants', 'Accessories', 'Kids'].includes(cat))));
    
    // Automatically select the newly created category
    setCategory(formatted);
    setNewCatName('');
    setSuccessMsg(`Category "${formatted}" created and selected!`);
    setFormError('');
  };

  // Color Input helpers
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorHex, setTempColorHex] = useState('#ff5500');

  const addColorOption = () => {
    if (!tempColorName) return;
    if (colors.some(c => c.name.toLowerCase() === tempColorName.toLowerCase() || c.hex.toLowerCase() === tempColorHex.toLowerCase())) {
      return;
    }
    setColors([...colors, { name: tempColorName, hex: tempColorHex }]);
    setTempColorName('');
  };

  const removeColorOption = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Apply Template Helper
  const applyTemplate = (tpl: typeof CLOTHING_TEMPLATES[0]) => {
    setName(tpl.name);
    setPrice(tpl.price.toString());
    setCategory(tpl.category);
    setGender(tpl.gender as any);
    setImage(tpl.image);
    setDesc(tpl.desc);
    setSizes(tpl.sizes);
    setColors(tpl.colors);
    setSuccessMsg('Form filled with ' + tpl.name + ' template data!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Handle Submit Product
  const handleSubmitProduct = (e: React.FormEvent) => {
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
        const updated = prev.map(p => p.id === editingId ? {
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
        } : p);
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

  // Handle Delete Product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== productId);
        localStorage.setItem('vibex_products', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Handle Update Order Status
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      });
      localStorage.setItem('vibex_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle Delete Order Record
  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order record? This action cannot be undone.')) {
      setOrders(prev => {
        const updated = prev.filter(o => o.id !== orderId);
        localStorage.setItem('vibex_orders', JSON.stringify(updated));
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
      // Find category in products if possible, or fallback
      const cat = item.productId.startsWith('mw-') ? (item.productId === 'mw-1' ? 'Tees' : item.productId === 'mw-2' ? 'Jackets' : item.productId === 'mw-3' ? 'Pants' : 'Accessories') : 'Other';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#060606] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Banner (Admin Control) */}
      <div className="bg-gradient-to-r from-red-950 via-[#c25121] to-amber-950 px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-black/40 p-2 border border-white/20 rounded">
            <Shield className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-widest font-display uppercase">VIBEX CONTROL HUB</h1>
            <p className="text-[10px] font-mono opacity-80 uppercase tracking-wider">Role: Admin console | ehtisham.khalid770@gmail.com</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="px-4 py-2 border border-white/30 hover:border-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 rounded bg-black/30"
        >
          <X className="w-4 h-4" />
          <span>Exit Admin Hub</span>
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Control Column (Tabs Selector) */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#09090b] p-6 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible">
          <span className="hidden md:block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">WORKSPACE NODES</span>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 ${activeTab === 'analytics' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Core Analytics</span>
          </button>

          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 ${activeTab === 'products' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Catalog</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left font-mono text-xs uppercase tracking-widest transition-all shrink-0 relative ${activeTab === 'orders' ? 'bg-[#c25121] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Records</span>
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="absolute right-4 bg-orange-600 text-white font-mono text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                {orders.filter(o => o.status === 'Pending').length}
              </span>
            )}
          </button>

          <div className="hidden md:flex flex-col mt-auto p-4 bg-zinc-950/80 border border-zinc-900 rounded font-mono text-[10px] text-zinc-500 space-y-2">
            <span className="font-bold text-zinc-400">SYS_CONSOLE Status:</span>
            <div className="flex items-center gap-2 text-green-400">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
              <span>Online & Secured</span>
            </div>
            <span>Vibex Sandbox Sync: OK</span>
          </div>
        </div>

        {/* Right Dynamic View Area */}
        <div className="flex-grow p-6 sm:p-8 overflow-y-auto bg-[#040404]">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: ANALYTICS */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-display text-white">SYSTEM INSIGHTS</h2>
                  <p className="text-xs font-mono text-zinc-500 uppercase mt-1">Numerical overview and operational metrics</p>
                </div>

                {/* Score Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
                  {/* Revenue Card */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#c25121]"></div>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest block">GROSS REVENUE (EXCL. CANCELLED)</span>
                    <h3 className="text-3xl font-black text-white mt-2 font-display">${totalRevenue.toFixed(2)}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>100% SECURED FUNDS</span>
                    </div>
                  </div>

                  {/* Orders Card */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest block">TOTAL ORDERS PLACED</span>
                    <h3 className="text-3xl font-black text-white mt-2 font-display">{orderCount} ORDERS</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                      <span>{orders.filter(o => o.status === 'Pending').length} PENDING FULFILLMENT</span>
                    </div>
                  </div>

                  {/* Avg Order Value */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-600"></div>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest block">AVERAGE BASKET SIZE</span>
                    <h3 className="text-3xl font-black text-white mt-2 font-display">${avgOrderValue.toFixed(2)}</h3>
                    <p className="text-[10px] text-zinc-500 mt-2">TOTAL ITEMS SOLD: {orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)} PCS</p>
                  </div>
                </div>

                {/* Sales Breakdown and Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Category breakdown visual */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded shadow-lg">
                    <h4 className="font-mono text-xs uppercase text-zinc-400 tracking-widest mb-6 pb-2 border-b border-zinc-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#c25121]" />
                      <span>CATEGORY SALES MATRIX</span>
                    </h4>

                    {orders.length === 0 ? (
                      <div className="h-48 flex items-center justify-center font-mono text-xs text-zinc-600">
                        No orders recorded yet. Place some orders to view the metrics!
                      </div>
                    ) : (
                      <div className="space-y-4 font-mono text-xs">
                        {[...categories, 'Other'].map(cat => {
                          const amount = categorySales[cat] || 0;
                          const percent = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                          return (
                            <div key={cat} className="space-y-1.5">
                              <div className="flex justify-between uppercase">
                                <span className="font-bold text-zinc-300">{cat}</span>
                                <span className="text-[#c25121]">${amount.toFixed(2)} ({percent.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-600 to-[#c25121]"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick System Activity */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded shadow-lg flex flex-col">
                    <h4 className="font-mono text-xs uppercase text-zinc-400 tracking-widest mb-6 pb-2 border-b border-zinc-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span>LATEST CHECKOUT INGRESS</span>
                    </h4>

                    <div className="flex-grow space-y-3 font-mono text-xs overflow-y-auto max-h-[220px] pr-2">
                      {orders.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-600">
                          Waiting for order pings...
                        </div>
                      ) : (
                        orders.slice(0, 5).map(o => (
                          <div key={o.id} className="p-3 bg-black border border-zinc-900 rounded flex justify-between items-center hover:border-zinc-800 transition-all">
                            <div>
                              <span className="font-bold text-[#c25121] uppercase">{o.buyerName}</span>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{o.date} | {o.items.length} items</p>
                            </div>
                            <div className="text-right">
                              <span className="text-white font-bold block">${o.total.toFixed(2)}</span>
                              <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                                o.status === 'Pending' ? 'bg-amber-950 text-amber-400' :
                                o.status === 'Shipped' ? 'bg-sky-950 text-sky-400' :
                                o.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400' :
                                'bg-red-950 text-red-400'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: MANAGE PRODUCTS */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-display text-white">PRODUCT CATALOG MANAGER</h2>
                    <p className="text-xs font-mono text-zinc-500 uppercase mt-1">Add, delete, or modify streetwear pieces</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Add Product Form Box (Col: 5) */}
                  <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 p-6 rounded shadow-lg space-y-6">
                    <h3 className="font-mono text-xs uppercase text-[#c25121] tracking-widest pb-3 border-b border-zinc-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {editingId ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                        <span>{editingId ? 'EDIT STREETWEAR PIECE' : 'PUBLISH STREETWEAR PIECE'}</span>
                      </div>
                      {editingId && (
                        <button
                          type="button"
                          onClick={cancelEditProduct}
                          className="text-[9px] text-zinc-400 hover:text-white uppercase font-bold underline transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </h3>

                    {/* Pre-fill templates block */}
                    <div className="space-y-2">
                      <label className="block text-zinc-500 uppercase font-mono text-[9px]">QUICK PRESETS (CLICK TO INJECT)</label>
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_TEMPLATES.map(tpl => (
                          <button
                            key={tpl.name}
                            type="button"
                            onClick={() => applyTemplate(tpl)}
                            className="bg-zinc-900 hover:bg-[#c25121]/20 hover:border-[#c25121] border border-zinc-800 rounded px-2.5 py-1 text-[10px] text-zinc-300 font-mono transition-all"
                          >
                            + {tpl.name.split(' ').slice(1, 3).join(' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSubmitProduct} className="space-y-4 font-mono text-xs">
                      {formError && (
                        <div className="bg-red-950/50 border border-red-500/30 p-3 rounded flex items-center gap-2.5 text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <p className="text-[11px] leading-relaxed">{formError}</p>
                        </div>
                      )}

                      {successMsg && (
                        <div className="bg-emerald-950/50 border border-emerald-500/30 p-3 rounded flex items-center gap-2.5 text-emerald-400">
                          <Check className="w-4 h-4 shrink-0" />
                          <p className="text-[11px] font-bold uppercase">{successMsg}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-zinc-400 uppercase text-[9px] mb-1">Product Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Acid Wash Varsity Jacket" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 uppercase text-[9px] mb-1">Price ($USD) *</label>
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="e.g. 55.00" 
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 uppercase text-[9px] mb-1">Category *</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Inline Create New Category Tool */}
                        <div className="col-span-2 bg-zinc-900/40 p-3 rounded border border-zinc-900 space-y-2 mt-1">
                          <label className="block text-[#c25121] uppercase text-[8px] font-bold tracking-widest">OR CREATE NEW CATEGORY</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. Hoodies, Denim, Shoes" 
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewCategory();
                                }
                              }}
                              className="flex-grow bg-black border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-white outline-none focus:border-[#c25121] transition-all"
                            />
                            <button 
                              type="button"
                              onClick={handleAddNewCategory}
                              className="bg-[#c25121] hover:bg-[#a34117] text-white px-3 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer shrink-0"
                            >
                              Create
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-400 uppercase text-[9px] mb-1">Target Gender *</label>
                          <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                          >
                            <option value="Unisex">Unisex</option>
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Kids">Kids</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 mt-4 pt-1">
                          <input 
                            type="checkbox" 
                            id="isNew"
                            checked={isNew}
                            onChange={(e) => setIsNew(e.target.checked)}
                            className="accent-[#c25121] h-4 w-4"
                          />
                          <label htmlFor="isNew" className="text-zinc-300 uppercase text-[10px] cursor-pointer">MARK AS NEW IN</label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1">Image URL *</label>
                        <input 
                          type="text" 
                          placeholder="Unsplash URL, /src/assets/..., or templates" 
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white text-[10px] outline-none focus:border-[#c25121] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1">Description (Product Details) *</label>
                        <textarea 
                          placeholder="Craftsmanship details, fabrics, fit characteristics, features..." 
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          rows={3}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all resize-none leading-relaxed"
                        />
                      </div>

                      {/* Sizes checklist */}
                      <div>
                        <span className="block text-zinc-400 uppercase text-[9px] mb-2">Available Sizes *</span>
                        <div className="grid grid-cols-4 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                          {sizeOptions.map(sz => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeToggle(sz)}
                              className={`py-1 rounded text-[10px] font-bold transition-all border ${
                                sizes.includes(sz)
                                  ? 'bg-[#c25121] border-[#c25121] text-white'
                                  : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Colors configuration list */}
                      <div className="space-y-2">
                        <span className="block text-zinc-400 uppercase text-[9px]">Configure Colorways</span>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Color Name (e.g. Midnight Onyx)" 
                            value={tempColorName}
                            onChange={(e) => setTempColorName(e.target.value)}
                            className="flex-grow bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs outline-none"
                          />
                          <input 
                            type="color" 
                            value={tempColorHex}
                            onChange={(e) => setTempColorHex(e.target.value)}
                            className="w-10 h-8 p-0 bg-transparent border-0 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={addColorOption}
                            className="bg-zinc-900 border border-zinc-800 px-3 hover:text-white hover:border-white transition-all text-[11px]"
                          >
                            Add
                          </button>
                        </div>

                        {/* List added colors */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {colors.map((c, i) => (
                            <div 
                              key={i} 
                              className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded flex items-center gap-1.5 text-[10px]"
                            >
                              <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                              <span className="text-zinc-300">{c.name}</span>
                              <button 
                                type="button" 
                                onClick={() => removeColorOption(i)} 
                                className="text-zinc-500 hover:text-red-400 ml-1 font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#c25121] hover:bg-[#a34117] text-white py-3 font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
                      >
                        {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{editingId ? 'UPDATE STREETWEAR PIECE' : 'PUBLISH TO LOOKBOOK'}</span>
                      </button>

                    </form>
                  </div>

                  {/* Products List Table (Col: 7) */}
                  <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 p-6 rounded shadow-lg overflow-hidden">
                    <h3 className="font-mono text-xs uppercase text-zinc-400 tracking-widest pb-3 border-b border-zinc-900 flex items-center gap-2 mb-4">
                      <Package className="w-4 h-4 text-orange-400" />
                      <span>INVENTORY LIST ({products.length} ITEMS)</span>
                    </h3>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase tracking-wider">
                            <th className="py-3 px-2">Preview</th>
                            <th className="py-3 px-2">Product Name</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2">Price</th>
                            <th className="py-3 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {products.map((p) => (
                            <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors group">
                              <td className="py-3 px-2">
                                <div className="w-10 h-12 bg-gradient-to-tr from-[#f4ebe1] to-[#fdf6f0] flex items-center justify-center p-1 rounded">
                                  <img 
                                    src={p.image} 
                                    alt={p.name} 
                                    className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-2 font-bold text-white group-hover:text-[#c25121] transition-colors max-w-[150px] truncate">
                                {p.name}
                                {p.isNew && (
                                  <span className="ml-1.5 bg-[#c25121] text-white text-[7px] px-1 py-0.2 rounded font-bold">NEW</span>
                                )}
                              </td>
                              <td className="py-3 px-2 uppercase text-zinc-500 text-[10px]">
                                {p.category}
                              </td>
                              <td className="py-3 px-2 text-orange-400 font-bold">
                                ${p.price.toFixed(2)}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button 
                                    onClick={() => startEditProduct(p)}
                                    className="p-1.5 rounded text-zinc-500 hover:text-sky-400 hover:bg-sky-950/20 transition-all cursor-pointer"
                                    title="Edit product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 3: MANAGE ORDERS */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-display text-white">CHECKOUT RECORDS HUB</h2>
                  <p className="text-xs font-mono text-zinc-500 uppercase mt-1">Fulfillment control, status, and client contacts</p>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-zinc-950 border border-zinc-900 rounded p-12 text-center font-mono space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 text-zinc-600 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-zinc-500 uppercase text-xs tracking-widest">No order records found in current sandbox context.</p>
                    <p className="text-[10px] text-zinc-600 max-w-md mx-auto">Add items to your bag in the shop storefront, click Checkout, complete the buyer form to place realistic orders, then come back here to fulfill them!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-zinc-950 border border-zinc-900 rounded overflow-hidden shadow-lg hover:border-zinc-800 transition-all flex flex-col"
                      >
                        
                        {/* Order Header */}
                        <div className="bg-zinc-900/60 border-b border-zinc-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="font-bold text-white text-sm">ORDER ID: <span className="text-[#c25121] uppercase">#{order.id}</span></span>
                            <span className="text-zinc-500">|</span>
                            <span className="text-zinc-300 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> {order.date}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 uppercase text-[10px]">fulfillment Status:</span>
                            
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                              className={`px-3 py-1.5 rounded font-mono text-[10px] uppercase font-bold outline-none border cursor-pointer ${
                                order.status === 'Pending' ? 'bg-amber-950 border-amber-600/30 text-amber-400' :
                                order.status === 'Shipped' ? 'bg-sky-950 border-sky-600/30 text-sky-400' :
                                order.status === 'Delivered' ? 'bg-emerald-950 border-emerald-600/30 text-emerald-400' :
                                'bg-red-950 border-red-600/30 text-red-400'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 rounded border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[9px] uppercase font-bold px-2.5"
                              title="Delete order record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Body Details */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                          
                          {/* Buyer Contact Card (Col: 4) */}
                          <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-900 pb-6 lg:pb-0 lg:pr-8 font-mono text-xs">
                            <span className="text-zinc-500 uppercase text-[9px] block tracking-widest">BUYER ACCOUNT DETAILS</span>
                            
                            <div className="space-y-3">
                              <h4 className="text-sm font-extrabold text-white uppercase">{order.buyerName}</h4>
                              
                              <div className="space-y-2 text-zinc-400">
                                <div className="flex items-center gap-2.5">
                                  <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                  <a href={`mailto:${order.buyerEmail}`} className="hover:text-white transition-colors">{order.buyerEmail}</a>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                  <span>{order.buyerPhone}</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed uppercase">{order.buyerAddress}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Items details (Col: 5) */}
                          <div className="lg:col-span-5 space-y-3">
                            <span className="font-mono text-zinc-500 uppercase text-[9px] block tracking-widest mb-1">CART ITEMS ({order.items.reduce((s, i) => s + i.quantity, 0)} UNITS)</span>
                            
                            <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center text-xs font-mono">
                                  <div className="w-9 h-11 bg-gradient-to-tr from-[#f4ebe1] to-[#fdf6f0] p-1 rounded shrink-0 flex items-center justify-center">
                                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain filter drop-shadow-xs" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <h5 className="font-bold text-white uppercase truncate text-xs">{item.name}</h5>
                                    <div className="flex gap-2 text-[10px] text-zinc-500 mt-0.5 uppercase">
                                      <span>Size: <strong className="text-zinc-300">{item.selectedSize}</strong></span>
                                      <span>Color: <strong className="text-zinc-300">{item.selectedColor.name}</strong></span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-zinc-400 block">{item.quantity}x</span>
                                    <span className="text-[#c25121] font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Total Calculations (Col: 3) */}
                          <div className="lg:col-span-3 bg-zinc-950/40 p-4 border border-zinc-900 rounded font-mono text-xs flex flex-col justify-between">
                            <div className="space-y-2 text-zinc-500">
                              <span className="text-zinc-500 uppercase text-[9px] block tracking-widest mb-1">FINANCIAL TALLY</span>
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="text-zinc-300">${order.subtotal.toFixed(2)}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-emerald-500">
                                  <span>Discount:</span>
                                  <span>-${order.discount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span className="text-zinc-300">{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                              </div>
                            </div>

                            <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-between items-baseline">
                              <span className="font-bold text-white uppercase">ORDER TOTAL:</span>
                              <span className="text-xl font-bold text-orange-400 font-display">${order.total.toFixed(2)}</span>
                            </div>
                          </div>

                        </div>

                      </div>
                    ))}
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
