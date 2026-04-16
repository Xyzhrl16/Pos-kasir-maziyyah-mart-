
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Category, Transaction, PaymentMethod, Expense } from './types';
import { INITIAL_PRODUCTS, TAX_RATE } from './constants';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { HistoryView } from './components/HistoryView';
import { Receipt } from './components/Receipt';
import { AIAssistant } from './components/AIAssistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory' | 'history'>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleBarcodeSubmit = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      handleAddToCart(product);
      return true;
    }
    return false;
  };

  const handleAddExpense = (description: string, amount: number, category: string) => {
    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      timestamp: new Date(),
      description,
      amount,
      category
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleCheckout = (paymentMethod: PaymentMethod, amountPaid: number, discount: number = 0, customerName: string = '') => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalCost = cart.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = Math.round(subtotal + tax - discount);
    const change = amountPaid - total;

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      timestamp: new Date(),
      items: [...cart],
      subtotal,
      tax,
      discount,
      total,
      totalCost,
      paymentMethod,
      amountPaid,
      change,
      customerName
    };

    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));

    setTransactions(prev => [newTransaction, ...prev]);
    setLastTransaction(newTransaction);
    setCart([]);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-20 md:w-56 glass-dark flex flex-col z-30 no-print">
        <div className="h-20 flex items-center px-6">
          <div className="w-10 h-10 gradient-dark-orange rounded-xl flex items-center justify-center shadow-glow-orange shrink-0">
            <span className="text-white font-black text-xl">M</span>
          </div>
          <div className="ml-3 hidden md:block overflow-hidden">
            <h1 className="font-extrabold text-white text-sm leading-none truncate">Maziyyah Mart</h1>
            <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest mt-1">PRO System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-8">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'pos', icon: '🛒', label: 'Kasir', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'inventory', icon: '📦', label: 'Stok', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'history', icon: '📊', label: 'Laporan', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full group flex items-center p-3.5 rounded-xl transition-all ${activeTab === item.id ? `${item.bg} ${item.color} border border-white/5 shadow-glow-orange` : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="ml-3 hidden md:block font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setIsAIOpen(true)}
            className="w-full bg-slate-800/50 border border-white/5 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
          >
            <span className="text-base">✨</span>
            <span className="hidden md:block font-extrabold text-[9px] uppercase tracking-widest text-orange-400">Tanya AI</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 no-print border-b border-white/5 bg-slate-950/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-white capitalize tracking-tight">
              {activeTab === 'dashboard' ? 'Overview Bisnis' : activeTab === 'pos' ? 'Terminal Kasir' : activeTab === 'inventory' ? 'Inventori & Stok' : 'Laporan Bisnis'}
            </h2>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Active</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Revenue Today</p>
              <p className="font-black text-white text-lg leading-tight">Rp {transactions.reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5">
               <div className="w-7 h-7 rounded-lg gradient-dark-orange flex items-center justify-center text-white text-[10px] font-bold">A</div>
               <div className="hidden lg:block text-left">
                  <p className="text-[8px] font-black text-slate-500 uppercase leading-none">Login As</p>
                  <p className="text-[10px] font-bold text-slate-300 mt-0.5">Anam (Kasir)</p>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-[#020617] no-print">
          {activeTab === 'dashboard' && (
            <DashboardView 
              transactions={transactions} 
              products={products} 
              expenses={expenses}
              onNavigateToPos={() => setActiveTab('pos')}
              onNavigateToInventory={() => setActiveTab('inventory')}
            />
          )}
          {activeTab === 'pos' && (
            <POSView 
              products={products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={(id) => setCart(prev => prev.filter(i => i.id !== id))}
              onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))}
              onClearCart={() => setCart([])}
              onCheckout={handleCheckout}
              barcodeInputRef={barcodeInputRef}
              onBarcodeSubmit={handleBarcodeSubmit}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryView 
              products={products} 
              setProducts={setProducts} 
              onAddExpense={handleAddExpense} 
            />
          )}
          {activeTab === 'history' && (
            <HistoryView 
              transactions={transactions} 
              expenses={expenses} 
              onAddExpense={(e) => setExpenses(prev => [e, ...prev])} 
            />
          )}
        </main>
      </div>

      {isAIOpen && (
        <div className="no-print">
          <AIAssistant onClose={() => setIsAIOpen(false)} products={products} transactions={transactions} />
        </div>
      )}
      
      {isReceiptOpen && lastTransaction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 no-print">
           <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
              <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                <Receipt transaction={lastTransaction} />
              </div>
              <div className="mt-8 flex gap-3">
                 <button onClick={() => window.print()} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:brightness-110 transition-all text-xs uppercase tracking-widest">Cetak Struk</button>
                 <button onClick={() => setIsReceiptOpen(false)} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Tutup</button>
              </div>
           </div>
        </div>
      )}
      {isReceiptOpen && lastTransaction && (
        <div className="print-only">
          <Receipt transaction={lastTransaction} />
        </div>
      )}
    </div>
  );
};

export default App;
