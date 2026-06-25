import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  Star, 
  Check, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Trash2, 
  Heart, 
  Filter,
  Sparkles,
  Info,
  ChevronDown,
  Shield,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { products, staticUnisexGallery } from './data';
import { Product, CartItem, Review, Order, OrderItem } from './types';
import AdminDashboard from './components/AdminDashboard';
import { 
  isSupabaseConfigured, 
  dbGetProducts, 
  dbUpsertProduct, 
  dbGetOrders, 
  dbUpsertOrder, 
  dbGetUsers, 
  dbUpsertUser,
  testConnection
} from './lib/supabase';

export default function App() {
  // Products Local Persistence state
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vibex_products');
    return saved ? JSON.parse(saved) : products;
  });

  // Orders Sandbox Persistence State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vibex_orders');
    if (saved) return JSON.parse(saved);
    
    return [
      {
        id: "vbx-9382",
        buyerName: "Ali Khan",
        buyerEmail: "ali.khan@gmail.com",
        buyerAddress: "House 24, Street 5, DHA Phase 6, Karachi, Pakistan",
        buyerPhone: "+92 300 1234567",
        items: [
          {
            productId: "mw-1",
            name: "Vibex Graphic Tee",
            quantity: 1,
            selectedSize: "L",
            selectedColor: { name: "Vintage Black", hex: "#1a1a1a" },
            price: 36.00,
            image: "/src/assets/images/vibex_tee_1782333588785.jpg"
          },
          {
            productId: "mw-3",
            name: "Stylised Utility Pant",
            quantity: 1,
            selectedSize: "32",
            selectedColor: { name: "Stitch Black", hex: "#121212" },
            price: 23.00,
            image: "/src/assets/images/vibex_pants_1782333627846.jpg"
          }
        ],
        subtotal: 59.00,
        shipping: 15.00,
        discount: 0,
        total: 74.00,
        status: "Delivered",
        date: "June 22, 2026"
      },
      {
        id: "vbx-4821",
        buyerName: "Sophia Martinez",
        buyerEmail: "sophia.m@gmail.com",
        buyerAddress: "72 Pine Street, Apt 4B, Brooklyn, NY 11201, USA",
        buyerPhone: "+1 718 555 0192",
        items: [
          {
            productId: "mw-2",
            name: "Pattered Denim Jacket",
            quantity: 1,
            selectedSize: "M",
            selectedColor: { name: "Patterned Blue", hex: "#415a77" },
            price: 36.00,
            image: "/src/assets/images/vibex_jacket_1782333608042.jpg"
          },
          {
            productId: "mw-4",
            name: "Unique Accessory",
            quantity: 2,
            selectedSize: "One Size",
            selectedColor: { name: "Black/Olive", hex: "#222521" },
            price: 26.00,
            image: "/src/assets/images/vibex_accessory_1782333647902.jpg"
          }
        ],
        subtotal: 88.00,
        shipping: 15.00,
        discount: 17.60,
        total: 85.40,
        status: "Pending",
        date: "June 24, 2026"
      }
    ];
  });

  // Admin and Checkout Dialog Controls
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Buyer Form details
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Shopping Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vibex_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Account State
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; points: number; isAdmin?: boolean } | null>(() => {
    const saved = localStorage.getItem('vibex_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('vibex_registered_users');
    if (saved) return JSON.parse(saved);
    return [
      { email: 'ali.khan@gmail.com', name: 'Ali Khan', password: 'password123', points: 300 },
      { email: 'sophia.m@gmail.com', name: 'Sophia Martinez', password: 'password123', points: 450 }
    ];
  });

  // Auth Inputs
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('default');

  // Categories state
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('vibex_custom_categories');
    const custom = saved ? JSON.parse(saved) : [];
    return ['Tees', 'Jackets', 'Pants', 'Accessories', 'Kids', ...custom];
  });

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Kids Collection Carousel Index
  const [kidsIndex, setKidsIndex] = useState(0);

  // Simulated Video Player State
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [storyTime, setStoryTime] = useState(12);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('vibex_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');

  // Notifications Toast State
  const [toast, setToast] = useState<string | null>(null);

  // Load initial data from Supabase if configured, otherwise rely on localStorage/fallback
  useEffect(() => {
    async function loadSupabaseData() {
      if (isSupabaseConfigured) {
        try {
          const conn = await testConnection();
          if (conn.success && conn.hasTables !== false) {
            // Fetch products
            const dbProducts = await dbGetProducts();
            if (dbProducts && dbProducts.length > 0) {
              setAllProducts(dbProducts);
              localStorage.setItem('vibex_products', JSON.stringify(dbProducts));
            } else {
              // Seed products table if empty
              for (const p of allProducts) {
                await dbUpsertProduct(p);
              }
            }

            // Fetch and merge orders to prevent wiping out newly placed local orders
            const dbOrders = await dbGetOrders();
            if (dbOrders) {
              const savedLocalOrdersStr = localStorage.getItem('vibex_orders');
              const localOrders: Order[] = savedLocalOrdersStr ? JSON.parse(savedLocalOrdersStr) : orders;
              
              const dbOrderIds = new Set(dbOrders.map(o => o.id));
              const unsyncedOrders = localOrders.filter(o => !dbOrderIds.has(o.id));
              
              if (unsyncedOrders.length > 0) {
                console.log(`Syncing ${unsyncedOrders.length} unsynced orders to Supabase...`);
                for (const o of unsyncedOrders) {
                  await dbUpsertOrder(o);
                }
                const finalOrders = [...unsyncedOrders, ...dbOrders];
                setOrders(finalOrders);
                localStorage.setItem('vibex_orders', JSON.stringify(finalOrders));
              } else {
                setOrders(dbOrders);
                localStorage.setItem('vibex_orders', JSON.stringify(dbOrders));
              }
            } else if (dbOrders && dbOrders.length === 0) {
              // Seed orders table if empty in Supabase but we have local orders
              for (const o of orders) {
                await dbUpsertOrder(o);
              }
            }

            // Fetch and merge users to prevent wiping out newly registered local users
            const dbUsers = await dbGetUsers();
            if (dbUsers) {
              const savedLocalUsersStr = localStorage.getItem('vibex_registered_users');
              const localUsers = savedLocalUsersStr ? JSON.parse(savedLocalUsersStr) : registeredUsers;
              
              const dbEmails = new Set(dbUsers.map(u => u.email.toLowerCase()));
              const unsyncedUsers = localUsers.filter((u: any) => !dbEmails.has(u.email.toLowerCase()));
              
              const formattedDbUsers = dbUsers.map(u => ({
                email: u.email,
                name: u.name,
                password: u.password,
                points: u.points,
                isAdmin: u.isAdmin
              }));

              if (unsyncedUsers.length > 0) {
                console.log(`Syncing ${unsyncedUsers.length} unsynced users to Supabase...`);
                for (const u of unsyncedUsers) {
                  await dbUpsertUser(u);
                }
                const finalUsers = [...unsyncedUsers, ...formattedDbUsers];
                setRegisteredUsers(finalUsers);
                localStorage.setItem('vibex_registered_users', JSON.stringify(finalUsers));
              } else {
                setRegisteredUsers(formattedDbUsers);
                localStorage.setItem('vibex_registered_users', JSON.stringify(formattedDbUsers));
              }
            } else if (dbUsers && dbUsers.length === 0) {
              // Seed users table if empty in Supabase but we have local users
              for (const u of registeredUsers) {
                await dbUpsertUser(u);
              }
            }
          }
        } catch (error) {
          console.error('Failed to auto-sync with Supabase on mount:', error);
        }
      }
    }
    loadSupabaseData();
  }, []);

  // Save Cart and Favorites to Local Storage
  useEffect(() => {
    localStorage.setItem('vibex_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vibex_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (checkoutOpen && currentUser) {
      setBuyerName(currentUser.name);
      setBuyerEmail(currentUser.email);
    }
  }, [checkoutOpen, currentUser]);

  const triggerToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Cart Handlers
  const addToCart = (product: Product, size: string, color: { name: string; hex: string }, qty: number) => {
    if (!size) {
      triggerToast('Please select a size first!');
      return;
    }
    if (!color) {
      triggerToast('Please select a color first!');
      return;
    }

    const existingIndex = cart.findIndex(
      item => 
        item.product.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor.hex === color.hex
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: qty, selectedSize: size, selectedColor: color }]);
    }

    triggerToast(`Added ${qty}x ${product.name} to your bag!`);
    setSelectedProduct(null); // Close modal
  };

  const removeFromCart = (productId: string, size: string, colorHex: string) => {
    const updated = cart.filter(
      item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor.hex === colorHex)
    );
    setCart(updated);
    triggerToast('Item removed from cart.');
  };

  const updateCartQuantity = (productId: string, size: string, colorHex: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor.hex === colorHex) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updated);
  };

  // Favorite toggle
  const toggleFavorite = (id: string, name: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      triggerToast(`Removed ${name} from Wishlist`);
    } else {
      setFavorites([...favorites, id]);
      triggerToast(`Saved ${name} to Wishlist!`);
    }
  };

  // Promo apply
  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'VIBEX20') {
      setDiscountPercent(20);
      setPromoMessage('20% discount code VIBEX20 applied successfully!');
      triggerToast('Promo applied: 20% discount!');
    } else {
      setPromoMessage('Invalid coupon code. Try VIBEX20');
      setDiscountPercent(0);
    }
  };

  // Filter and Sort Logic
  const filteredProducts = allProducts.filter(product => {
    // Search query match
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category match
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    // Gender filter (Men, Women, Kids, New In)
    let matchesGender = true;
    if (selectedGender === 'New') {
      matchesGender = !!product.isNew;
    } else if (selectedGender === 'Kids') {
      matchesGender = product.gender === 'Kids' || product.category === 'Kids';
    } else if (selectedGender === 'Men' || selectedGender === 'Women') {
      matchesGender = product.gender === selectedGender || product.gender === 'Unisex';
    }

    return matchesSearch && matchesCategory && matchesGender;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'low-to-high') return a.price - b.price;
    if (sortBy === 'high-to-low') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default sort order
  });

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = cartSubtotal * (discountPercent / 100);
  const cartShipping = cartSubtotal > 200 || cartSubtotal === 0 ? 0 : 15.00;
  const cartTotal = cartSubtotal - discountAmount + cartShipping;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Simulated Reviews
  const mockReviews: Review[] = [
    { id: '1', author: 'Arsalan K.', rating: 5, date: 'June 18, 2026', title: 'Absolute Masterpiece', comment: 'The fabric weight is outstanding. Feels incredibly durable and heavy, perfect oversized drape.' },
    { id: '2', author: 'Sophia T.', rating: 5, date: 'May 29, 2026', title: 'Top Tier Streetwear', comment: 'Matches perfectly with my cargo utility pants. The print color is vibrant and washed nicely.' },
    { id: '3', author: 'Zayn M.', rating: 4, date: 'April 14, 2026', title: 'Very stylish, runs large', comment: 'I love the patterns. It runs slightly oversized so size down if you want a snug fit.' }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#c25121] selection:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#c25121] text-white font-mono text-xs uppercase px-5 py-3 shadow-2xl tracking-widest border border-white/20 flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. PROMO BAR */}
      <div className="bg-[#c25121] text-white text-[10px] sm:text-xs tracking-[0.2em] font-medium py-2 px-4 text-center uppercase relative z-40 font-display">
        FREE WORLDWIDE SHIPPING ON ORDERS OVER $200
        <span className="hidden md:inline-block ml-4 bg-white/20 px-2 py-0.5 text-[9px] rounded">CODE: VIBEX20</span>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-30 bg-white text-black py-4 px-4 sm:px-8 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="text-2xl sm:text-3xl font-extrabold tracking-widest flex items-center select-none font-display">
            VIBE<span className="text-[#c25121] ml-0.5">X</span>
          </a>

          {/* Navigation Links (Middle) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.15em] uppercase font-display">
            <button 
              onClick={() => { setSelectedGender('New'); setSelectedCategory('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-[#c25121] transition-colors py-1 relative ${selectedGender === 'New' ? 'text-[#c25121]' : ''}`}
            >
              NEW IN
              {selectedGender === 'New' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c25121]" />}
            </button>
            <button 
              onClick={() => { setSelectedGender('Men'); setSelectedCategory('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-[#c25121] transition-colors py-1 relative ${selectedGender === 'Men' ? 'text-[#c25121]' : ''}`}
            >
              MEN
              {selectedGender === 'Men' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c25121]" />}
            </button>
            <button 
              onClick={() => { setSelectedGender('Women'); setSelectedCategory('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-[#c25121] transition-colors py-1 relative ${selectedGender === 'Women' ? 'text-[#c25121]' : ''}`}
            >
              WOMEN
              {selectedGender === 'Women' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c25121]" />}
            </button>
            <button 
              onClick={() => { setSelectedGender('Kids'); setSelectedCategory('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-[#c25121] transition-colors py-1 relative ${selectedGender === 'Kids' ? 'text-[#c25121]' : ''}`}
            >
              KIDS
              {selectedGender === 'Kids' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c25121]" />}
            </button>
            <button 
              onClick={() => { setSelectedGender('All'); setSelectedCategory('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hover:text-[#c25121] transition-colors py-1"
            >
              THE EDIT
            </button>
          </nav>

          {/* Action Icons (Right) */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Search Button */}
            <button 
              id="search-btn"
              onClick={() => setSearchOpen(true)} 
              className="hover:text-[#c25121] transition-colors p-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 hover:text-black" />
            </button>

            {/* Admin Console Hub Trigger Button (Only visible if logged in user is Admin) */}
            {currentUser?.isAdmin && (
              <button 
                id="admin-btn"
                onClick={() => {
                  setIsAdminOpen(true);
                }} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#c25121]/10 text-[#c25121] border border-[#c25121]/30 hover:bg-[#c25121] hover:text-white rounded text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-300 cursor-pointer"
                title="Open Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden lg:inline">ADMIN</span>
              </button>
            )}

            {/* Profile Button */}
            <button 
              id="account-btn"
              onClick={() => setAccountOpen(true)} 
              className="hover:text-[#c25121] transition-colors p-1 relative"
              aria-label="Account"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 hover:text-black" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>

            {/* Shopping Bag Button */}
            <button 
              id="cart-btn"
              onClick={() => setCartOpen(true)} 
              className="hover:text-[#c25121] transition-colors p-1 relative flex items-center"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 hover:text-black" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#c25121] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white scale-90">
                  {totalItemsCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative h-[80vh] sm:h-[85vh] lg:h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/vibex_crouching_alley_hero_1782338481964.jpg" 
            alt="Vibex Streetwear Models" 
            className="w-full h-full object-cover object-center scale-105 filter brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/50"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 text-center max-w-3xl px-4 flex flex-col items-center">
          <span className="text-[#c25121] text-xs sm:text-sm font-bold font-mono tracking-[0.4em] mb-4 uppercase">
            NOW AVAILABLE WORLDWIDE
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] uppercase font-display select-none">
            CITY BEATS<br />COLLECTION
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mb-10 tracking-wide font-light">
            Discover the latest from urban culture. Explore our most iconic pieces yet, engineered for durability and styling.
          </p>
          <button 
            id="hero-shop-btn"
            onClick={() => document.getElementById('most-wanted')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-8 py-3.5 border border-[#8b4d32] bg-black/60 backdrop-blur-sm text-white font-mono text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#c25121] hover:border-[#c25121] transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            SHOP THE COLLECTION
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/45 text-[10px] tracking-[0.2em] font-mono">
          <span>SCROLL</span>
          <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#c25121] animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* 4. MOST WANTED SECTION */}
      <section id="most-wanted" className="py-20 bg-black px-4 sm:px-8 border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-[#c25121] text-xs font-bold tracking-[0.3em] uppercase block mb-3 font-mono">TRENDING NOW</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase font-display">
              MOST WANTED
            </h2>
            <div className="w-16 h-1 bg-[#c25121] mx-auto mt-4"></div>
          </div>

          {/* Product Grid (4 Items exactly like screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
            {allProducts.slice(0, 4).map((product) => {
              const isFav = favorites.includes(product.id);
              return (
                <div 
                  key={product.id} 
                  id={`product-${product.id}`}
                  className="group flex flex-col cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedSize(product.sizes ? product.sizes[0] : '');
                    setSelectedColor(product.colors ? product.colors[0] : null);
                    setQuantity(1);
                  }}
                >
                  {/* Image container with soft peach-pink/gray background */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-tr from-[#f4ebe1] via-[#fdf6f0] to-[#e4f0f6] border border-white/5 shadow-md mb-4 flex items-center justify-center p-6 group-hover:shadow-[#c25121]/10 group-hover:border-[#c25121]/30 transition-all duration-300">
                    
                    {/* Corner accents representing premium utility styling */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-black/15"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-black/15"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-black/15"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-black/15"></div>

                    {/* New Badge */}
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-[#c25121] text-white font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 z-10">
                        NEW IN
                      </span>
                    )}

                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id, product.name);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 hover:bg-white text-black transition-colors duration-200 shadow-sm"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#c25121] text-[#c25121]' : 'text-gray-700 hover:text-black'}`} />
                    </button>

                    {/* Product Image */}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />

                    {/* Quick View Button Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                      <span className="px-5 py-2.5 bg-black text-white text-[10px] font-mono uppercase tracking-widest border border-white/20 hover:bg-[#c25121] hover:border-[#c25121] transition-colors duration-300 shadow-lg">
                        QUICK SHOP
                      </span>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="flex flex-col">
                    <h3 className="text-white text-sm font-bold tracking-wider group-hover:text-[#c25121] transition-colors font-display">
                      {product.name}
                    </h3>
                    <span className="text-[#c25121] font-mono text-sm font-semibold mt-1">
                      ${product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                      <span>({product.reviews})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. UNISEX STYLES: THE LIMITLESS: BE LIMITLESS */}
      <section className="py-24 bg-black px-4 sm:px-8 relative border-b border-gray-900">
        
        {/* Subtle grid background accent */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Large display headings exactly matching screenshot styling */}
          <div className="text-center mb-16 flex flex-col items-center">
            <span className="text-[#c25121] text-xs font-mono font-bold tracking-[0.4em] mb-4 uppercase">CURATED LOOKS</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-white uppercase font-display leading-relaxed">
              UNISEX STYLES:
            </h2>
            <h3 className="text-xl sm:text-2xl font-bold tracking-[0.15em] text-[#c25121]/85 uppercase font-display mb-2">
              THE LIMITLESS:
            </h3>
            <h4 className="text-4xl sm:text-6xl font-black tracking-[0.1em] text-white uppercase font-display mt-4">
              BE LIMITLESS
            </h4>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c25121] to-transparent mt-8"></div>
          </div>

          {/* Staggered Masonry Look Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Card 1: Left tall */}
            <div className="md:col-span-4 relative group overflow-hidden border border-white/5 rounded shadow-lg bg-gray-900 h-[450px]">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" 
                alt="Unisex streetwear jacket styling" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-mono text-[#c25121] uppercase tracking-widest font-bold block mb-1">STYLING 01</span>
                <h5 className="text-lg font-bold tracking-wider text-white font-display uppercase">Oversized Hoods</h5>
              </div>
            </div>

            {/* Card 2: Center heavy */}
            <div className="md:col-span-4 relative group overflow-hidden border border-white/5 rounded shadow-lg bg-gray-900 h-[450px]">
              <img 
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80" 
                alt="Streetwear model" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-mono text-[#c25121] uppercase tracking-widest font-bold block mb-1">STYLING 02</span>
                <h5 className="text-lg font-bold tracking-wider text-white font-display uppercase">Street Culture</h5>
              </div>
            </div>

            {/* Card 3: Right dark block */}
            <div className="md:col-span-4 relative group overflow-hidden border border-white/5 rounded shadow-lg bg-gray-900 h-[450px]">
              <img 
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80" 
                alt="Urban explorer jacket" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-mono text-[#c25121] uppercase tracking-widest font-bold block mb-1">STYLING 03</span>
                <h5 className="text-lg font-bold tracking-wider text-white font-display uppercase">Winter Layers</h5>
              </div>
            </div>

          </div>

          {/* Quick statement block */}
          <div className="mt-16 text-center max-w-xl mx-auto">
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
              *Designed for all body structures. Minimalist designs, high tactile materials, engineered utility details.*
            </p>
          </div>

        </div>
      </section>

      {/* 6. KIDS COLLECTION SECTION */}
      <section className="py-20 bg-black px-4 sm:px-8 border-b border-gray-900 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header with Navigation Arrows */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div>
              <span className="text-[#c25121] text-xs font-mono font-bold tracking-[0.3em] uppercase block mb-2">LITTLE ONES</span>
              <h2 className="text-3xl font-extrabold tracking-widest text-white uppercase font-display">
                KIDS COLLECTION
              </h2>
            </div>
            
            {/* Carousel navigation controls */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button 
                onClick={() => setKidsIndex(Math.max(0, kidsIndex - 1))}
                disabled={kidsIndex === 0}
                className="p-3 border border-gray-800 text-white rounded-full hover:border-[#c25121] hover:text-[#c25121] transition-all disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-white"
                aria-label="Previous items"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setKidsIndex(Math.min(1, kidsIndex + 1))}
                disabled={kidsIndex === 1}
                className="p-3 border border-gray-800 text-white rounded-full hover:border-[#c25121] hover:text-[#c25121] transition-all disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-white"
                aria-label="Next items"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slider Content */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{ transform: `translateX(-${kidsIndex * 50}%)` }}
            >
              {allProducts.filter(p => p.category === 'Kids').map((product) => {
                const isFav = favorites.includes(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedSize(product.sizes ? product.sizes[0] : '');
                      setSelectedColor(product.colors ? product.colors[0] : null);
                      setQuantity(1);
                    }}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] group flex flex-col cursor-pointer"
                  >
                    {/* Soft beige gradient container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-tr from-[#f4ebe1] via-[#fdf6f0] to-[#e4f0f6] border border-white/5 shadow-md mb-4 flex items-center justify-center p-6 group-hover:shadow-[#c25121]/10 group-hover:border-[#c25121]/30 transition-all duration-300">
                      
                      {/* Corner accents */}
                      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-black/15"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-black/15"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-black/15"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-black/15"></div>

                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id, product.name);
                        }}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 hover:bg-white text-black transition-colors duration-200 shadow-sm"
                        aria-label="Add to wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#c25121] text-[#c25121]' : 'text-gray-700 hover:text-black'}`} />
                      </button>

                      {/* Image */}
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-md rounded-md"
                        referrerPolicy="no-referrer"
                      />

                      {/* Hover Shop */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <span className="px-5 py-2.5 bg-black text-white text-[10px] font-mono uppercase tracking-widest border border-white/20 hover:bg-[#c25121] hover:border-[#c25121] transition-colors duration-300 shadow-lg">
                          QUICK SHOP
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <h3 className="text-white text-sm font-bold tracking-wider group-hover:text-[#c25121] transition-colors font-display truncate">
                        {product.name}
                      </h3>
                      <span className="text-[#c25121] font-mono text-sm font-semibold mt-1">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 7. URBAN EXPLORATION SECTION (WIDESCREEN FILM STORY) */}
      <section className="py-24 bg-black px-4 sm:px-8 relative border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-[#c25121] text-xs font-bold tracking-[0.3em] uppercase block mb-3 font-mono">FILM EXPERIENCE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase font-display">
              URBAN EXPLORATION
            </h2>
            <div className="w-16 h-[2px] bg-[#c25121] mx-auto mt-4"></div>
          </div>

          {/* Main Simulated Video Card */}
          <div className="relative aspect-[16/9] w-full max-w-5xl mx-auto overflow-hidden shadow-2xl border border-white/5 group">
            
            {/* Thumbnail Image */}
            <img 
              src="/src/assets/images/vibex_new_hero_1782337863329.jpg" 
              alt="Urban exploration campaign preview" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-[0.7] contrast-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Visual glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

            {/* Play Button Trigger */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              
              {/* Outer pulsing ring */}
              <button 
                id="play-story-btn"
                onClick={() => { setStoryOpen(true); setStoryPlaying(true); }}
                className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#c25121] text-white border border-white/30 hover:border-[#c25121] transition-all duration-300 shadow-2xl scale-95 hover:scale-105"
                aria-label="Play campaign film"
              >
                <div className="absolute inset-0 rounded-full border border-white/30 animate-pulse-ring"></div>
                <Play className="w-8 sm:w-10 h-8 sm:h-10 fill-current ml-1" />
              </button>

              <span className="font-mono text-xs text-white uppercase tracking-[0.3em] mt-6 bg-black/40 px-3 py-1.5 backdrop-blur-sm border border-white/10">
                PLAY FILM (2:15)
              </span>
            </div>

            {/* Title / details bottom bar in overlay */}
            <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold tracking-wider text-white font-display">AUTUMN/WINTER MOODREEL</h4>
                <p className="text-xs text-gray-300 font-light mt-1">Shot on Location: Neo-Tokyo Rooftops & Concrete Plazas</p>
              </div>
              <button 
                onClick={() => { setStoryOpen(true); setStoryPlaying(true); }}
                className="px-6 py-3 border border-[#c25121] text-[#c25121] text-[10px] font-mono uppercase tracking-widest hover:bg-[#c25121] hover:text-white transition-all self-start sm:self-center font-bold"
              >
                WATCH THE STORY
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 8. BROWSE CATEGORIES SECTION */}
      <section id="categories" className="py-24 bg-black px-4 sm:px-8 border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#c25121] text-xs font-bold tracking-[0.3em] uppercase block mb-3 font-mono">EXPLORE WARDROBE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase font-display">
              BROWSE CATEGORIES
            </h2>
            <div className="w-16 h-1 bg-[#c25121] mx-auto mt-4"></div>
          </div>

          {/* Category Cards (4 Vertical glowing cards exactly like screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Category: Pants */}
            <div 
              onClick={() => { setSelectedCategory('Pants'); setSelectedGender('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative h-[380px] bg-gradient-to-t from-black via-black/85 to-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-lg rounded"
            >
              {/* Image background with fine styling */}
              <div className="absolute inset-0 z-0 p-8 flex items-center justify-center">
                <img 
                  src="/src/assets/images/vibex_pants_1782333627846.jpg" 
                  alt="Browse Pants" 
                  className="max-h-[65%] object-contain opacity-40 group-hover:opacity-75 transition-all duration-500 scale-95 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Glowing bottom accent line representing orange glow of screenshot */}
              <div className="absolute bottom-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#c25121]/30 via-[#c25121] to-[#c25121]/30 opacity-70 group-hover:opacity-100 group-hover:h-[8px] transition-all"></div>
              
              {/* Overlay elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 z-10">
                <h3 className="text-white text-xl font-bold tracking-[0.2em] uppercase font-display group-hover:text-[#c25121] transition-colors">
                  PANTS
                </h3>
                <span className="text-xs text-gray-500 font-mono mt-1 group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                  EXPLORE STYLES
                </span>
              </div>
            </div>

            {/* Category: Tees */}
            <div 
              onClick={() => { setSelectedCategory('Tees'); setSelectedGender('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative h-[380px] bg-gradient-to-t from-black via-black/85 to-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-lg rounded"
            >
              <div className="absolute inset-0 z-0 p-8 flex items-center justify-center">
                <img 
                  src="/src/assets/images/vibex_tee_1782333588785.jpg" 
                  alt="Browse Tees" 
                  className="max-h-[65%] object-contain opacity-40 group-hover:opacity-75 transition-all duration-500 scale-95 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#c25121]/30 via-[#c25121] to-[#c25121]/30 opacity-70 group-hover:opacity-100 group-hover:h-[8px] transition-all"></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 z-10">
                <h3 className="text-white text-xl font-bold tracking-[0.2em] uppercase font-display group-hover:text-[#c25121] transition-colors">
                  TEES
                </h3>
                <span className="text-xs text-gray-500 font-mono mt-1 group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                  EXPLORE STYLES
                </span>
              </div>
            </div>

            {/* Category: Jackets */}
            <div 
              onClick={() => { setSelectedCategory('Jackets'); setSelectedGender('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative h-[380px] bg-gradient-to-t from-black via-black/85 to-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-lg rounded"
            >
              <div className="absolute inset-0 z-0 p-8 flex items-center justify-center">
                <img 
                  src="/src/assets/images/vibex_jacket_1782333608042.jpg" 
                  alt="Browse Jackets" 
                  className="max-h-[65%] object-contain opacity-40 group-hover:opacity-75 transition-all duration-500 scale-95 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#c25121]/30 via-[#c25121] to-[#c25121]/30 opacity-70 group-hover:opacity-100 group-hover:h-[8px] transition-all"></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 z-10">
                <h3 className="text-white text-xl font-bold tracking-[0.2em] uppercase font-display group-hover:text-[#c25121] transition-colors">
                  JACKETS
                </h3>
                <span className="text-xs text-gray-500 font-mono mt-1 group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                  EXPLORE STYLES
                </span>
              </div>
            </div>

            {/* Category: Accessories */}
            <div 
              onClick={() => { setSelectedCategory('Accessories'); setSelectedGender('All'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative h-[380px] bg-gradient-to-t from-black via-black/85 to-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-lg rounded"
            >
              <div className="absolute inset-0 z-0 p-8 flex items-center justify-center">
                <img 
                  src="/src/assets/images/vibex_accessory_1782333647902.jpg" 
                  alt="Browse Accessories" 
                  className="max-h-[65%] object-contain opacity-40 group-hover:opacity-75 transition-all duration-500 scale-95 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#c25121]/30 via-[#c25121] to-[#c25121]/30 opacity-70 group-hover:opacity-100 group-hover:h-[8px] transition-all"></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 z-10">
                <h3 className="text-white text-xl font-bold tracking-[0.2em] uppercase font-display group-hover:text-[#c25121] transition-colors">
                  ACCESSORIES
                </h3>
                <span className="text-xs text-gray-500 font-mono mt-1 group-hover:text-gray-300 transition-colors uppercase tracking-widest">
                  EXPLORE STYLES
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* INTERACTIVE FULL CATALOG SELECTION ENGINE */}
      <section id="catalog" className="py-20 bg-[#070605] px-4 sm:px-8 border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-zinc-900">
            <div>
              <span className="text-[#c25121] text-xs font-bold tracking-[0.3em] uppercase block mb-3 font-mono">DYNAMICAL EXPLORER</span>
              <h2 className="text-3xl font-extrabold tracking-widest text-white uppercase font-display">
                COMPLETE LOOKBOOK
              </h2>
            </div>

            {/* Filter Pill Controls */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0 text-xs font-mono">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 border rounded-full uppercase tracking-wider transition-all duration-200 ${
                    selectedCategory === cat 
                      ? 'bg-[#c25121] border-[#c25121] text-white font-bold' 
                      : 'border-zinc-800 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter & Sort controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-black/40 p-4 border border-zinc-900 rounded font-mono text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#c25121]" />
                <span className="text-gray-400 uppercase tracking-widest text-[10px]">GENDER:</span>
              </div>
              <div className="flex gap-2">
                {['All', 'Men', 'Women', 'Kids', 'New'].map((genderOpt) => (
                  <button
                    key={genderOpt}
                    onClick={() => setSelectedGender(genderOpt)}
                    className={`px-3 py-1 border transition-all ${
                      selectedGender === genderOpt 
                        ? 'border-[#c25121] text-[#c25121] bg-[#c25121]/5' 
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {genderOpt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-between">
              <span className="text-gray-400 uppercase tracking-widest text-[10px]">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black border border-zinc-800 text-gray-300 py-1.5 px-3 rounded text-xs tracking-wider outline-none focus:border-[#c25121] transition-all"
              >
                <option value="default">Default Catalog</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>

          {/* Results Count & Search Query summary if applicable */}
          {(searchQuery || selectedCategory !== 'All' || selectedGender !== 'All') && (
            <div className="mb-8 flex items-center justify-between text-xs font-mono text-zinc-500 pb-2 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <span>Filtering by:</span>
                {selectedCategory !== 'All' && <span className="text-white bg-zinc-800 px-2 py-0.5 rounded">{selectedCategory}</span>}
                {selectedGender !== 'All' && <span className="text-white bg-zinc-800 px-2 py-0.5 rounded">Gender: {selectedGender}</span>}
                {searchQuery && <span className="text-white bg-zinc-800 px-2 py-0.5 rounded">Search: "{searchQuery}"</span>}
              </div>
              <button 
                onClick={() => { setSelectedCategory('All'); setSelectedGender('All'); setSearchQuery(''); setSortBy('default'); }}
                className="text-[#c25121] hover:underline"
              >
                CLEAR ALL
              </button>
            </div>
          )}

          {/* Dynamic Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded">
              <p className="font-mono text-gray-500 mb-4">No streetwear apparel found matching your filters.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSelectedGender('All'); setSearchQuery(''); }}
                className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs uppercase tracking-wider hover:bg-[#c25121] hover:border-[#c25121] transition-all"
              >
                Show All Items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {sortedProducts.map((product) => {
                const isFav = favorites.includes(product.id);
                return (
                  <div 
                    key={product.id} 
                    id={`catalog-product-${product.id}`}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedSize(product.sizes ? product.sizes[0] : '');
                      setSelectedColor(product.colors ? product.colors[0] : null);
                      setQuantity(1);
                    }}
                    className="group flex flex-col cursor-pointer"
                  >
                    {/* Soft beige background card */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-tr from-[#f4ebe1] via-[#fdf6f0] to-[#e4f0f6] border border-white/5 shadow-md mb-4 flex items-center justify-center p-6 group-hover:shadow-[#c25121]/10 group-hover:border-[#c25121]/30 transition-all duration-300">
                      
                      {/* Corner accents */}
                      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-black/15"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-black/15"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-black/15"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-black/15"></div>

                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id, product.name);
                        }}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 hover:bg-white text-black transition-colors duration-200 shadow-sm"
                        aria-label="Add to wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#c25121] text-[#c25121]' : 'text-gray-700 hover:text-black'}`} />
                      </button>

                      {/* Image */}
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-md rounded-md"
                        referrerPolicy="no-referrer"
                      />

                      {/* Quick view block */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <span className="px-5 py-2.5 bg-black text-white text-[10px] font-mono uppercase tracking-widest border border-white/20 hover:bg-[#c25121] hover:border-[#c25121] transition-colors duration-300 shadow-lg">
                          QUICK SHOP
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white text-sm font-bold tracking-wider group-hover:text-[#c25121] transition-colors font-display truncate">
                          {product.name}
                        </h3>
                        {product.isNew && <span className="bg-[#c25121]/15 text-[#c25121] border border-[#c25121]/30 font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 shrink-0 rounded">NEW</span>}
                      </div>
                      <span className="text-[#c25121] font-mono text-sm font-semibold mt-1">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 9. JOIN THE VIBEX CLUB SECTION */}
      <section className="py-24 bg-black px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white text-black p-8 sm:p-16 rounded-lg relative overflow-hidden shadow-2xl flex flex-col items-center text-center">
          
          {/* Top visual accent lines */}
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-red-500 via-[#c25121] to-yellow-500"></div>

          {/* Content */}
          <span className="text-[#c25121] text-xs font-bold tracking-[0.3em] uppercase block mb-4 font-mono">STREETWEAR COMMUNITY</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest uppercase mb-4 font-display select-none">
            JOIN THE VIBEX CLUB
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mb-8 leading-relaxed">
            Sign up to unlock first-access releases, exclusive events, and get 20% off your initial order. We do not spam, ever.
          </p>

          <AnimatePresence mode="wait">
            {newsletterStatus === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md bg-[#c25121]/5 border border-[#c25121]/20 p-6 rounded flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-[#c25121] text-white flex items-center justify-center rounded-full shadow-lg">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="font-bold text-lg mt-2 font-display">WELCOME TO THE CREW!</h3>
                <p className="text-xs text-gray-500 font-mono">Check your inbox for active updates.</p>
                <div className="mt-4 border-2 border-dashed border-[#c25121]/30 bg-white px-4 py-2 text-center">
                  <span className="text-[10px] text-gray-400 block font-mono">YOUR 20% WELCOME COUPON:</span>
                  <span className="font-mono font-bold tracking-widest text-[#c25121] text-sm">VIBEX20</span>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newsletterEmail.trim()) return;
                  setNewsletterStatus('success');
                  if (currentUser) {
                    const updatedUser = {
                      ...currentUser,
                      points: currentUser.points + 100
                    };
                    setCurrentUser(updatedUser);
                    localStorage.setItem('vibex_current_user', JSON.stringify(updatedUser));
                    
                    if (isSupabaseConfigured) {
                      dbUpsertUser(updatedUser);
                    }
                    
                    // Also update in registeredUsers
                    setRegisteredUsers(prevUsers => {
                      const updatedUsers = prevUsers.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? {
                        ...u,
                        points: u.points + 100
                      } : u);
                      localStorage.setItem('vibex_registered_users', JSON.stringify(updatedUsers));
                      return updatedUsers;
                    });
                  }
                  triggerToast('Welcome! 100 loyalty points awarded.');
                }}
                className="w-full max-w-md flex flex-col sm:flex-row items-stretch gap-3 relative"
              >
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email address" 
                  required
                  className="flex-grow bg-gray-50 border border-gray-300 rounded px-4 py-3.5 text-sm font-mono text-black placeholder-gray-400 outline-none focus:border-[#c25121] focus:bg-white transition-all shadow-sm"
                />
                <button 
                  type="submit"
                  className="bg-[#c25121] hover:bg-[#a34117] text-white px-6 py-3.5 rounded font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  SUBSCRIBE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Fine terms */}
          <span className="text-[9px] text-gray-400 tracking-wider font-mono mt-6 uppercase">
            *By signing up, you agree to our Terms of Use and Privacy Policy.*
          </span>

        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#12100e] text-gray-400 text-xs py-16 px-4 sm:px-8 border-t border-zinc-900 font-sans relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Main 4 columns layout exactly like screenshot footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 pb-12 border-b border-zinc-900">
            
            {/* Col 1: Help */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest font-display text-sm uppercase mb-2 border-l-2 border-[#c25121] pl-3">
                HELP
              </h4>
              <ul className="flex flex-col gap-2 font-medium tracking-wide">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">General Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              </ul>
            </div>

            {/* Col 2: Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest font-display text-sm uppercase mb-2 border-l-2 border-[#c25121] pl-3">
                COMPANY
              </h4>
              <ul className="flex flex-col gap-2 font-medium tracking-wide">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Col 3: Categories */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest font-display text-sm uppercase mb-2 border-l-2 border-[#c25121] pl-3">
                CATEGORIES
              </h4>
              <ul className="flex flex-col gap-2 font-medium tracking-wide">
                <li><a href="#" className="hover:text-white transition-colors">All</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tees</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kids</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
              </ul>
            </div>

            {/* Col 4: Social */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest font-display text-sm uppercase mb-2 border-l-2 border-[#c25121] pl-3">
                SOCIAL
              </h4>
              <p className="text-zinc-500 text-xs mb-2">Connect with our team online for behind-the-scenes stories.</p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#c25121] hover:text-white hover:border-[#c25121] transition-all text-gray-300" aria-label="Facebook">
                  <span className="font-bold text-xs">FB</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#c25121] hover:text-white hover:border-[#c25121] transition-all text-gray-300" aria-label="Pinterest">
                  <span className="font-bold text-xs">PIN</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#c25121] hover:text-white hover:border-[#c25121] transition-all text-gray-300" aria-label="Instagram">
                  <span className="font-bold text-xs">IG</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#c25121] hover:text-white hover:border-[#c25121] transition-all text-gray-300" aria-label="TikTok">
                  <span className="font-bold text-xs">TK</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Row - Shopify & Payments */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Powered by Shopify / Vibex signature branding */}
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase">
              <span>© {new Date().getFullYear()} VIBEX STREETWEAR.</span>
              <span className="text-zinc-700">|</span>
              <span className="hover:text-white cursor-pointer flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                POWERED BY SHOPIFY
              </span>
            </div>

            {/* Payment Method Icons mimicking screenshot bottom row */}
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 tracking-wider rounded uppercase">VISA</div>
              <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 tracking-wider rounded uppercase">MC</div>
              <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 tracking-wider rounded uppercase">AMEX</div>
              <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 tracking-wider rounded uppercase">DISC</div>
              <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 tracking-wider rounded uppercase">APPLE</div>
              <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 tracking-wider rounded uppercase">SHOP</div>
            </div>

          </div>

          {/* Sticky Scroll to Top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute bottom-8 right-8 text-zinc-600 hover:text-white font-mono text-[9px] uppercase tracking-widest flex items-center gap-2 transition-colors border-b border-zinc-800 pb-1"
          >
            <span>BACK TO TOP</span>
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
          </button>

        </div>
      </footer>

      {/* ========================================================= */}
      {/* ==================== INTERACTIVE OVERLAYS ================ */}
      {/* ========================================================= */}

      {/* A. SLIDE-OUT SHOPPING CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-[#0c0c0c] border-l border-zinc-900 z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-black">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#c25121]" />
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider">YOUR BAG ({totalItemsCount})</h3>
                </div>
                <button 
                  id="close-cart-btn"
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-full border border-zinc-800 text-gray-400 hover:text-white hover:border-white transition-all cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Your shipping bag is empty</p>
                    <button 
                      onClick={() => { setCartOpen(false); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="px-6 py-2.5 bg-[#c25121] hover:bg-[#a34117] text-white text-[10px] font-mono uppercase tracking-widest font-bold transition-all shadow-md"
                    >
                      EXPLORE PRODUCTS
                    </button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.hex}`}
                      className="flex gap-4 border-b border-zinc-900 pb-4 last:border-b-0 last:pb-0 group"
                    >
                      {/* Thumbnail Container */}
                      <div className="w-20 h-24 bg-gradient-to-tr from-[#f4ebe1] to-[#fdf6f0] flex-shrink-0 flex items-center justify-center p-2 rounded shadow-md relative border border-white/5">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-xs text-white uppercase tracking-wider font-display line-clamp-1">{item.product.name}</h4>
                            <button 
                              onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor.hex)}
                              className="text-zinc-600 hover:text-red-500 transition-colors p-0.5"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 font-mono mt-1 uppercase">
                            <span>Size: <strong className="text-white">{item.selectedSize}</strong></span>
                            <span className="flex items-center gap-1">
                              Color: 
                              <span 
                                className="w-2.5 h-2.5 rounded-full inline-block border border-white/30" 
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              <strong className="text-white">{item.selectedColor.name}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity control */}
                          <div className="flex items-center border border-zinc-800 bg-black/50 rounded overflow-hidden">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor.hex, -1)}
                              className="p-1 hover:bg-zinc-950 text-gray-500 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor.hex, 1)}
                              className="p-1 hover:bg-zinc-950 text-gray-500 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price calculation */}
                          <span className="text-[#c25121] font-mono text-xs font-bold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-900 bg-black space-y-4 font-mono text-xs">
                  
                  {/* Shipping promotion progress bar */}
                  <div className="space-y-1 pb-2">
                    <div className="flex justify-between text-[10px] uppercase">
                      <span>{cartSubtotal >= 200 ? '🎉 Free Shipping Unlocked!' : `Add $${(200 - cartSubtotal).toFixed(2)} more for FREE shipping`}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#c25121] transition-all duration-300" 
                        style={{ width: `${Math.min(100, (cartSubtotal / 200) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 text-gray-400">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span className="text-white">${cartSubtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>COUPON DISCOUNT (20%):</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>SHIPPING:</span>
                      <span className="text-white">{cartShipping === 0 ? 'FREE' : `$${cartShipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm border-t border-zinc-900 pt-2.5">
                      <span>TOTAL EST:</span>
                      <span className="text-[#c25121]">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text" 
                      placeholder="PROMO CODE" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow bg-[#050505] border border-zinc-800 px-3 py-2 text-xs uppercase rounded text-white tracking-widest outline-none focus:border-[#c25121]"
                    />
                    <button 
                      onClick={applyPromo}
                      className="px-4 py-2 border border-zinc-800 hover:border-[#c25121] hover:text-[#c25121] bg-black text-[10px] tracking-widest uppercase transition-all"
                    >
                      APPLY
                    </button>
                  </div>
                  {promoMessage && (
                    <span className={`text-[10px] block ${discountPercent > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {promoMessage}
                    </span>
                  )}

                  {/* Checkout Button */}
                  <button 
                    id="checkout-btn"
                    onClick={() => {
                      setCheckoutOpen(true);
                      setCartOpen(false);
                    }}
                    className="w-full bg-[#c25121] hover:bg-[#a34117] text-white py-3 rounded font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 text-xs shadow-lg cursor-pointer"
                  >
                    PROCEED TO CHECKOUT
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <span className="text-[9px] text-zinc-600 block text-center uppercase tracking-widest">
                    🔒 SSL SECURE 256-BIT ENCRYPTED CHECKOUT
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* B. SEARCH ENGINE OVERLAY BAR */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 p-6 flex flex-col"
          >
            {/* Header / Dismiss */}
            <div className="max-w-7xl mx-auto w-full flex justify-between items-center mb-16">
              <span className="text-2xl font-extrabold tracking-widest text-white font-display">VIBEX ENGINE</span>
              <button 
                id="close-search-btn"
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-2 rounded-full border border-zinc-800 text-gray-400 hover:text-white hover:border-white transition-all cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input */}
            <div className="max-w-3xl mx-auto w-full text-center">
              <div className="relative border-b-2 border-zinc-800 focus-within:border-[#c25121] transition-colors pb-4 flex items-center">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#c25121] mr-4 shrink-0" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Type to search streetwear..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xl sm:text-3xl text-white tracking-widest outline-none border-none placeholder-zinc-700 uppercase"
                />
              </div>

              <div className="flex gap-2 flex-wrap justify-center mt-6 text-xs font-mono text-zinc-500">
                <span>SUGGESTIONS:</span>
                {['TEE', 'PANT', 'JACKET', 'KIDS', 'ACCESSORIES'].map((sug) => (
                  <button 
                    key={sug}
                    onClick={() => setSearchQuery(sug)}
                    className="text-zinc-400 hover:text-[#c25121] underline uppercase"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Results view */}
            <div className="max-w-5xl mx-auto w-full flex-grow mt-12 overflow-y-auto pb-12">
              {searchQuery && (
                <div className="space-y-4">
                  <h4 className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                    SEARCH RESULTS FOR "{searchQuery}" ({filteredProducts.length} FOUND)
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredProducts.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setSelectedSize(p.sizes ? p.sizes[0] : '');
                          setSelectedColor(p.colors ? p.colors[0] : null);
                          setQuantity(1);
                          setSearchOpen(false);
                        }}
                        className="p-3 bg-[#0a0a0a] border border-zinc-900 rounded hover:border-[#c25121] cursor-pointer transition-all flex flex-col text-left"
                      >
                        <div className="aspect-square bg-gradient-to-tr from-[#f4ebe1] to-[#fdf6f0] flex items-center justify-center p-3 rounded mb-2">
                          <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain filter drop-shadow-sm" referrerPolicy="no-referrer" />
                        </div>
                        <h5 className="font-bold text-xs text-white uppercase truncate font-display">{p.name}</h5>
                        <span className="text-[#c25121] font-mono text-xs mt-1">${p.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* C. QUICK VIEW / PRODUCT DETAIL DIALOG */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[85vw] sm:max-w-4xl sm:h-[80vh] bg-[#0c0a09] border border-zinc-900 z-50 shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
              {/* Image side - Peach background */}
              <div className="md:w-1/2 relative bg-gradient-to-tr from-[#f4ebe1] via-[#fdf6f0] to-[#e4f0f6] flex items-center justify-center p-12 overflow-hidden border-b md:border-b-0 md:border-r border-zinc-900">
                {/* Visual corners */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-black/15"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-black/15"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-black/15"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-black/15"></div>

                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="max-h-[85%] max-w-[85%] object-contain filter drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Information / Selection Panel */}
              <div className="md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto bg-black text-white justify-between">
                <div>
                  {/* Category & Close */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                      {selectedProduct.category}
                    </span>
                    <button 
                      id="close-product-btn"
                      onClick={() => setSelectedProduct(null)}
                      className="p-1 rounded-full border border-zinc-800 text-gray-400 hover:text-white hover:border-white transition-all cursor-pointer"
                      aria-label="Close product details"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Title & Price */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-wider text-white uppercase font-display mb-1">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[#c25121] text-xl font-mono font-bold">${selectedProduct.price.toFixed(2)}</span>
                    <span className="text-zinc-500 text-xs line-through">${(selectedProduct.price * 1.25).toFixed(2)}</span>
                  </div>

                  {/* Star Rating summary */}
                  <div className="flex items-center gap-2 mb-6 text-xs">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </div>
                    <span className="text-gray-400 font-mono">({selectedProduct.rating.toFixed(1)} / {selectedProduct.reviews} customer ratings)</span>
                  </div>

                  {/* Tabs: Details vs Reviews */}
                  <div className="flex border-b border-zinc-900 mb-6 font-mono text-[10px]">
                    <button 
                      onClick={() => setActiveTab('details')}
                      className={`px-4 py-2 border-b-2 uppercase tracking-widest ${activeTab === 'details' ? 'border-[#c25121] text-white font-bold' : 'border-transparent text-zinc-500 hover:text-gray-300'}`}
                    >
                      SPECIFICATIONS
                    </button>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className={`px-4 py-2 border-b-2 uppercase tracking-widest ${activeTab === 'reviews' ? 'border-[#c25121] text-white font-bold' : 'border-transparent text-zinc-500 hover:text-gray-300'}`}
                    >
                      REVIEWS ({selectedProduct.reviews})
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {activeTab === 'details' ? (
                    <div className="space-y-6">
                      <p className="text-xs text-gray-300 font-light leading-relaxed">
                        {selectedProduct.desc}
                      </p>

                      {/* Color Selector */}
                      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div>
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">
                            COLORWAY: <strong className="text-white">{selectedColor?.name}</strong>
                          </span>
                          <div className="flex gap-2">
                            {selectedProduct.colors.map((col) => (
                              <button
                                key={col.hex}
                                onClick={() => setSelectedColor(col)}
                                className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${
                                  selectedColor?.hex === col.hex ? 'border-[#c25121] scale-105' : 'border-zinc-800 hover:border-zinc-500'
                                }`}
                                aria-label={`Select color ${col.name}`}
                              >
                                <span 
                                  className="w-full h-full rounded-full inline-block" 
                                  style={{ backgroundColor: col.hex }} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size Selector */}
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div>
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">
                            SIZE SELECTION: <strong className="text-white">{selectedSize}</strong>
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedProduct.sizes.map((sz) => (
                              <button
                                key={sz}
                                onClick={() => setSelectedSize(sz)}
                                className={`py-2 text-xs font-mono border rounded uppercase transition-all ${
                                  selectedSize === sz 
                                    ? 'bg-[#c25121] border-[#c25121] text-white font-bold' 
                                    : 'border-zinc-800 hover:border-zinc-500 text-gray-400'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                      {mockReviews.map((r) => (
                        <div key={r.id} className="p-3 bg-zinc-950/50 border border-zinc-900 rounded">
                          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                            <span>{r.author}</span>
                            <span>{r.date}</span>
                          </div>
                          <div className="flex text-amber-500 my-1">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <h6 className="text-xs font-bold text-white uppercase font-display">{r.title}</h6>
                          <p className="text-[11px] text-gray-400 mt-1 font-light leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Bottom Buying Buttons Area */}
                {activeTab === 'details' && (
                  <div className="border-t border-zinc-900 pt-6 mt-6 flex items-center gap-4">
                    
                    {/* Quantity Adjustment Selector */}
                    <div className="flex items-center border border-zinc-800 rounded bg-[#0a0a0a] overflow-hidden shrink-0">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-3 hover:bg-zinc-900 text-gray-500 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-3 hover:bg-zinc-900 text-gray-500 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Add to Bag CTA button */}
                    <button
                      onClick={() => addToCart(selectedProduct, selectedSize, selectedColor!, quantity)}
                      className="flex-grow bg-[#c25121] hover:bg-[#a34117] text-white py-3.5 rounded font-mono text-xs uppercase tracking-[0.25em] font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      ADD TO SHIPPING BAG
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* D. URBAN STORY FILM OVERLAY PLAYER */}
      <AnimatePresence>
        {storyOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-50 flex flex-col justify-between p-6"
          >
            {/* Header / Dismiss */}
            <div className="max-w-7xl mx-auto w-full flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">CAMPAIGN STORY PROJECT</span>
              </div>
              <button 
                id="close-story-btn"
                onClick={() => { setStoryOpen(false); setStoryPlaying(false); }}
                className="p-2 rounded-full border border-zinc-800 text-gray-400 hover:text-white hover:border-white transition-all cursor-pointer"
                aria-label="Close story player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Canvas Stage Area */}
            <div className="max-w-4xl mx-auto w-full aspect-[16/9] border border-zinc-800 relative bg-[#0a0a0a] rounded overflow-hidden flex items-center justify-center">
              
              {/* Loop styled dynamic landscape image or video mockup */}
              <img 
                src="/src/assets/images/vibex_new_hero_1782337863329.jpg" 
                alt="Campaign reel scene" 
                className={`w-full h-full object-cover brightness-[0.7] ${storyPlaying ? 'scale-100' : 'scale-[1.03] blur-sm'} transition-all duration-1000`}
                referrerPolicy="no-referrer"
              />

              {/* Status overlays inside stage */}
              <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-ping"></span>
                LIVE REEL
              </div>

              {/* Audio visual equalizer mockup if playing */}
              {storyPlaying && (
                <div className="absolute bottom-6 right-6 flex items-end gap-1 h-6">
                  <div className="w-1 bg-[#c25121] h-[80%] animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-1 bg-[#c25121] h-[40%] animate-bounce [animation-delay:0.3s]"></div>
                  <div className="w-1 bg-[#c25121] h-[95%] animate-bounce [animation-delay:0.5s]"></div>
                  <div className="w-1 bg-[#c25121] h-[60%] animate-bounce [animation-delay:0.2s]"></div>
                </div>
              )}

              {/* Center controls triggers */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setStoryPlaying(!storyPlaying)}
                  className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#c25121] hover:text-white hover:border-[#c25121] transition-all flex items-center justify-center shadow-2xl"
                >
                  {storyPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
              </div>

            </div>

            {/* Bottom Scrub Controls Bar */}
            <div className="max-w-4xl mx-auto w-full font-mono text-[10px] space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <span>00:12</span>
                <div className="flex-grow h-1 bg-zinc-800 rounded relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-[#c25121] w-[28%]"></div>
                </div>
                <span>02:15</span>
              </div>

              <div className="flex items-center justify-between text-zinc-500 uppercase">
                <span>TRACK: CITY BEATS COLLECTION SOUNDTRACK</span>
                <span className="text-zinc-300">AUDIO OUT: STEREO SURROUND</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* E. ACCOUNT DETAILS & REWARDS PROFILE */}
      <AnimatePresence>
        {accountOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setAccountOpen(false);
                setAuthError('');
              }}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[500px] sm:max-h-[85vh] overflow-y-auto bg-zinc-950 border border-zinc-900 z-50 p-6 sm:p-8 shadow-2xl rounded flex flex-col scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#c25121]" />
                  <h3 className="text-base font-bold font-display uppercase tracking-wider">
                    {currentUser ? 'MEMBER PROFILE' : 'INSIDER HUB LOGIN'}
                  </h3>
                </div>
                <button 
                  id="close-account-btn"
                  onClick={() => {
                    setAccountOpen(false);
                    setAuthError('');
                  }}
                  className="p-1 rounded-full border border-zinc-800 text-gray-400 hover:text-white hover:border-white transition-all cursor-pointer"
                  aria-label="Close profile"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUser ? (
                /* LOGGED IN VIEW */
                <div className="space-y-6">
                  {currentUser.isAdmin ? (
                    /* ADMIN VIEW */
                    <div className="space-y-4">
                      <div className="bg-[#c25121]/10 border border-[#c25121]/30 p-4 rounded text-center">
                        <span className="text-[10px] text-orange-400 block font-mono font-bold tracking-widest uppercase mb-1">SYSTEM CONTROLLER MODE</span>
                        <h4 className="text-lg font-black text-white font-display uppercase">WELCOME, ADMIN JOHN ALEX!</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">Full read/write permissions for lookbook & orders</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-zinc-900 border border-zinc-900 p-3 rounded">
                          <span className="text-[9px] text-zinc-500 uppercase font-mono block">TOTAL PIECES</span>
                          <span className="text-lg font-bold text-white font-mono">{allProducts.length} items</span>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-900 p-3 rounded">
                          <span className="text-[9px] text-zinc-500 uppercase font-mono block">TOTAL ORDERS</span>
                          <span className="text-lg font-bold text-white font-mono">{orders.length} orders</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setAccountOpen(false);
                          setIsAdminOpen(true);
                        }}
                        className="w-full bg-[#c25121] hover:bg-[#a34117] text-white py-3 rounded font-mono font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Shield className="w-4 h-4 animate-pulse" />
                        LAUNCH CONTROL DASHBOARD
                      </button>
                    </div>
                  ) : (
                    /* NORMAL USER VIEW */
                    <div className="space-y-6">
                      {/* Loyalty reward Card */}
                      <div className="bg-gradient-to-r from-[#c25121] to-[#e76f51] p-5 rounded text-white relative overflow-hidden shadow-lg">
                        <div className="absolute right-0 bottom-0 opacity-10 font-display font-black text-7xl select-none">VIBEX</div>
                        <span className="font-mono text-[9px] uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">LOYALTY CREDITS</span>
                        <h4 className="text-2xl font-black mt-2 font-display">{currentUser.points} CREDITS</h4>
                        <p className="text-[10px] opacity-80 mt-1 font-mono uppercase">
                          TIER LEVEL: {currentUser.points < 200 ? 'BRONZE INSIDER' : currentUser.points < 500 ? 'SILVER INSIDER' : 'GOLD PREMIUM'}
                        </p>

                        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] font-mono">
                          <span>{currentUser.points < 500 ? `NEXT LEVEL REWARD AT 500 CREDITS` : 'MAXIMUM PRESTIGE LEVEL REACHED'}</span>
                          <span className="underline cursor-pointer hover:text-black" onClick={() => triggerToast('Exclusive loyalty rewards are automatically calculated in checkout!')}>VIEW BENEFITS</span>
                        </div>
                      </div>

                      {/* User Profile fields */}
                      <div className="space-y-3 font-mono text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-zinc-500 uppercase text-[9px] mb-1">MEMBER NAME</label>
                            <div className="w-full bg-zinc-900 border border-zinc-900 rounded px-3 py-2 text-white font-bold">{currentUser.name}</div>
                          </div>
                          <div>
                            <label className="block text-zinc-500 uppercase text-[9px] mb-1">MEMBER EMAIL</label>
                            <div className="w-full bg-zinc-900 border border-zinc-900 rounded px-3 py-2 text-white truncate">{currentUser.email}</div>
                          </div>
                        </div>

                        {/* Order Tracking Section */}
                        <div className="pt-4 border-t border-zinc-900 mt-4">
                          <h5 className="font-bold text-white text-[10px] uppercase tracking-wider mb-3">YOUR ORDER STATUS & TRACKING</h5>
                          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                            {(() => {
                              const userOrders = orders.filter(o => o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase());
                              if (userOrders.length === 0) {
                                return (
                                  <div className="text-center py-6 text-zinc-500 bg-zinc-900/30 border border-zinc-900 rounded">
                                    <p className="text-[10px]">No orders found for {currentUser.email}.</p>
                                    <p className="text-[9px] mt-1 text-zinc-600">Place an order with this email address to track it here!</p>
                                  </div>
                                );
                              }
                              return userOrders.map(o => {
                                const steps = ['Pending', 'Shipped', 'Delivered'];
                                const stepIdx = steps.indexOf(o.status);
                                return (
                                  <div key={o.id} className="bg-black border border-zinc-900 p-4 rounded space-y-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <div>
                                        <span className="font-bold text-orange-500">ORDER #{o.id.toUpperCase()}</span>
                                        <span className="text-zinc-500 block text-[9px]">{o.date}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-white font-bold block">${o.total.toFixed(2)}</span>
                                        <span className="text-[8px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                          {o.status}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Tracking Status Timeline */}
                                    <div className="pt-1">
                                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase">
                                        <span className={stepIdx >= 0 ? 'text-orange-500 font-bold' : ''}>Pending</span>
                                        <span className={stepIdx >= 1 ? 'text-orange-500 font-bold' : ''}>Shipped</span>
                                        <span className={stepIdx >= 2 ? 'text-orange-500 font-bold' : ''}>Delivered</span>
                                      </div>
                                      <div className="h-1 bg-zinc-900 rounded-full flex mt-1 overflow-hidden">
                                        <div 
                                          className="bg-orange-500 h-full transition-all duration-300" 
                                          style={{ width: o.status === 'Pending' ? '15%' : o.status === 'Shipped' ? '50%' : '100%' }}
                                        />
                                      </div>
                                    </div>

                                    {/* Order items inside tracking card */}
                                    <div className="space-y-1 pt-1.5 border-t border-zinc-900">
                                      {o.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[9px] text-zinc-400">
                                          <img 
                                            referrerPolicy="no-referrer"
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-6 h-6 rounded object-cover border border-zinc-800"
                                          />
                                          <div className="flex-grow min-w-0">
                                            <p className="truncate font-bold text-zinc-300">{item.name}</p>
                                            <p className="text-[8px] text-zinc-500">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Sign Out Action Button */}
                  <button 
                    onClick={() => {
                      setCurrentUser(null);
                      localStorage.removeItem('vibex_current_user');
                      triggerToast('Signed out of the Insider Hub.');
                    }}
                    className="w-full py-2.5 border border-zinc-800 hover:border-red-500/30 hover:text-red-500 text-gray-400 rounded text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer"
                  >
                    SIGN OUT OF INSIDER HUB
                  </button>
                </div>
              ) : (
                /* AUTHENTICATION FLOW (LOGIN/REGISTER TABS) */
                <div className="space-y-5">
                  <div className="flex border-b border-zinc-900">
                    <button
                      onClick={() => { setAuthTab('login'); setAuthError(''); }}
                      className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
                        authTab === 'login' 
                          ? 'border-[#c25121] text-white' 
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      LOG IN
                    </button>
                    <button
                      onClick={() => { setAuthTab('register'); setAuthError(''); }}
                      className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
                        authTab === 'register' 
                          ? 'border-[#c25121] text-white' 
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      CREATE ACCOUNT
                    </button>
                  </div>

                  {authError && (
                    <div className="bg-red-950/40 border border-red-900/60 p-3 rounded text-red-400 text-[10px] font-mono text-center flex items-center justify-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      {authError}
                    </div>
                  )}

                  {authTab === 'login' ? (
                    /* LOGIN FORM */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setAuthError('');
                        if (!authEmail || !authPassword) {
                          setAuthError('Please enter both email and password.');
                          return;
                        }
                        const emailLower = authEmail.trim().toLowerCase();
                        
                        // Check fixed admin
                        if (emailLower === 'johnalex@gmail.com' && authPassword === 'johnalex123') {
                          const adminUser = { email: 'johnalex@gmail.com', name: 'John Alex', points: 9999, isAdmin: true };
                          setCurrentUser(adminUser);
                          localStorage.setItem('vibex_current_user', JSON.stringify(adminUser));
                          triggerToast('Welcome Admin John Alex!');
                          setAuthEmail('');
                          setAuthPassword('');
                          setAccountOpen(false); // Close login modal
                          setIsAdminOpen(true);  // Open Admin Dashboard directly
                          return;
                        }
                        
                        // Check registered users
                        const matched = registeredUsers.find(u => u.email.toLowerCase() === emailLower && u.password === authPassword);
                        if (matched) {
                          const loggedUser = { email: matched.email, name: matched.name, points: matched.points || 0 };
                          setCurrentUser(loggedUser);
                          localStorage.setItem('vibex_current_user', JSON.stringify(loggedUser));
                          triggerToast(`Welcome back, ${matched.name}!`);
                          setAuthEmail('');
                          setAuthPassword('');
                        } else {
                          setAuthError('Invalid email or password.');
                        }
                      }}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          required
                          placeholder="e.g. customer@example.com" 
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">PASSWORD</label>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••" 
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#c25121] hover:bg-[#a34117] text-white py-3 rounded font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                      >
                        SIGN INTO THE HUB
                      </button>
                    </form>
                  ) : (
                    /* REGISTER FORM */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setAuthError('');
                        if (!authName || !authEmail || !authPassword || !authConfirmPassword) {
                          setAuthError('Please fill in all registration fields.');
                          return;
                        }
                        const emailLower = authEmail.trim().toLowerCase();
                        
                        if (authPassword !== authConfirmPassword) {
                          setAuthError('Passwords do not match.');
                          return;
                        }
                        
                        if (emailLower === 'johnalex@gmail.com') {
                          setAuthError('This email is reserved.');
                          return;
                        }
                        
                        if (registeredUsers.some(u => u.email.toLowerCase() === emailLower)) {
                          setAuthError('Email already registered.');
                          return;
                        }
                        
                        const newUser = {
                          name: authName.trim(),
                          email: emailLower,
                          password: authPassword,
                          points: 200 // Welcome points!
                        };
                        
                        const updatedUsers = [...registeredUsers, newUser];
                        setRegisteredUsers(updatedUsers);
                        localStorage.setItem('vibex_registered_users', JSON.stringify(updatedUsers));
                        
                        if (isSupabaseConfigured) {
                          dbUpsertUser({
                            email: newUser.email,
                            name: newUser.name,
                            password: newUser.password,
                            points: newUser.points,
                            isAdmin: false
                          });
                        }

                        const sessionUser = { name: newUser.name, email: newUser.email, points: newUser.points };
                        setCurrentUser(sessionUser);
                        localStorage.setItem('vibex_current_user', JSON.stringify(sessionUser));
                        
                        triggerToast('Account created successfully! 200 credits rewarded.');
                        setAuthName('');
                        setAuthEmail('');
                        setAuthPassword('');
                        setAuthConfirmPassword('');
                      }}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">FULL NAME</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Ehtisham Khalid" 
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          required
                          placeholder="e.g. customer@example.com" 
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">PASSWORD</label>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••" 
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 uppercase text-[9px] font-mono mb-1">CONFIRM PASSWORD</label>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••" 
                          value={authConfirmPassword}
                          onChange={(e) => setAuthConfirmPassword(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all text-xs font-mono"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#c25121] hover:bg-[#a34117] text-white py-3 rounded font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                      >
                        CREATE INSIDER ACCOUNT
                      </button>
                    </form>
                  )}
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADMIN DASHBOARD CONSOLE OVERLAY */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminDashboard 
            products={allProducts}
            setProducts={setAllProducts}
            orders={orders}
            setOrders={setOrders}
            categories={categories}
            setCategories={setCategories}
            onClose={() => setIsAdminOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* CHECKOUT SYSTEM FORM MODAL */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[500px] bg-[#0c0a09] border border-zinc-900 z-50 p-6 sm:p-8 shadow-2xl rounded flex flex-col font-mono text-xs max-h-[90vh] overflow-y-auto text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#c25121]" />
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">SECURE CHECKOUT</h3>
                </div>
                <button 
                  onClick={() => setCheckoutOpen(false)}
                  className="p-1 rounded-full border border-zinc-800 text-gray-400 hover:text-white hover:border-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order summary small banner */}
              <div className="bg-zinc-900/60 p-4 border border-zinc-900 rounded mb-6 text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">TOTAL FULFILLMENT DUE:</span>
                <span className="text-lg font-black text-orange-500 font-display">${cartTotal.toFixed(2)}</span>
                <span className="text-[9px] text-zinc-400 block mt-1 uppercase">{totalItemsCount} pieces in shipping bag</span>
              </div>

              {/* Form fields */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!buyerName || !buyerEmail || !buyerAddress || !buyerPhone) {
                    triggerToast('Please fill in all required checkout fields.');
                    return;
                  }

                  const newOrder: Order = {
                    id: 'vbx-' + Math.floor(1000 + Math.random() * 9000),
                    buyerName,
                    buyerEmail,
                    buyerAddress,
                    buyerPhone,
                    items: cart.map(item => ({
                      productId: item.product.id,
                      name: item.product.name,
                      quantity: item.quantity,
                      selectedSize: item.selectedSize,
                      selectedColor: item.selectedColor,
                      price: item.product.price,
                      image: item.product.image
                    })),
                    subtotal: cartSubtotal,
                    shipping: cartShipping,
                    discount: discountAmount,
                    total: cartTotal,
                    status: 'Pending',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  };

                  setOrders(prev => {
                    const updated = [newOrder, ...prev];
                    localStorage.setItem('vibex_orders', JSON.stringify(updated));
                    return updated;
                  });

                  if (isSupabaseConfigured) {
                    dbUpsertOrder(newOrder).then(res => {
                      if (res && res.success) {
                        triggerToast('Order placed & synchronized with Supabase! ID: #' + newOrder.id);
                      } else {
                        const errMsg = res?.error?.message || res?.error || 'Database table/schema issue';
                        console.error('Supabase Sync Error:', res?.error);
                        triggerToast(`Order placed locally! Supabase Sync Failed: ${errMsg}`);
                      }
                    });
                  } else {
                    triggerToast('Order placed successfully (Offline Mode)! ID: #' + newOrder.id);
                  }

                  if (currentUser) {
                    const pointsEarned = Math.round(cartTotal);
                    const updatedUser = {
                      ...currentUser,
                      points: currentUser.points + pointsEarned
                    };
                    setCurrentUser(updatedUser);
                    localStorage.setItem('vibex_current_user', JSON.stringify(updatedUser));
                    
                    if (isSupabaseConfigured) {
                      dbUpsertUser(updatedUser).then(res => {
                        if (res && !res.success) {
                          console.error('Failed to sync user points to Supabase:', res.error);
                        }
                      });
                    }
                    
                    setRegisteredUsers(prevUsers => {
                      const updatedUsers = prevUsers.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? {
                        ...u,
                        points: u.points + pointsEarned
                      } : u);
                      localStorage.setItem('vibex_registered_users', JSON.stringify(updatedUsers));
                      return updatedUsers;
                    });
                  }

                  setCart([]);
                  setCheckoutOpen(false);
                  
                  // Reset fields
                  setBuyerName('');
                  setBuyerEmail('');
                  setBuyerAddress('');
                  setBuyerPhone('');
                }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="block text-zinc-500 uppercase text-[9px] mb-1">YOUR FULL NAME *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ehtisham Khalid" 
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 uppercase text-[9px] mb-1">EMAIL ADDRESS *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. customer@example.com" 
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 uppercase text-[9px] mb-1">PHONE NUMBER *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. +92 300 1234567" 
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 uppercase text-[9px] mb-1">SHIPPING ADDRESS *</label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="e.g. House 45, Street 2, Sector G-11, Islamabad" 
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-[#c25121] transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
                  <button 
                    type="submit"
                    className="w-full bg-[#c25121] hover:bg-[#a34117] text-white py-3.5 rounded font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>PLACE SANDBOX ORDER</span>
                  </button>
                  
                  <span className="text-[8px] text-zinc-600 block text-center uppercase tracking-widest">
                    🔒 SSL SECURE 256-BIT SANDBOX ORDER PLACEMENT
                  </span>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
