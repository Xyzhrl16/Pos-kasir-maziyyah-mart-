
import React, { useState, useEffect } from 'react';
import { Product, CartItem, Category, PaymentMethod } from '../types';
import { TAX_RATE } from '../constants';

interface POSViewProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onClearCart: () => void;
  onCheckout: (paymentMethod: PaymentMethod, amountPaid: number, discount: number, customerName: string) => void;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
  onBarcodeSubmit: (code: string) => boolean;
}

export const POSView: React.FC<POSViewProps> = ({ 
  products, cart, onAddToCart, onRemoveFromCart, onUpdateQuantity, onClearCart, onCheckout, barcodeInputRef, onBarcodeSubmit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountPaid, setAmountPaid] = useState('');
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [showCancelOrderConfirm, setShowCancelOrderConfirm] = useState(false);
  
  // State untuk konfirmasi hapus item
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Promo & Customer State
  const [activeDiscount, setActiveDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoUnlocked, setIsPromoUnlocked] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('Umum');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const totalBeforeDiscount = Math.round(subtotal + tax);
  const total = Math.max(0, totalBeforeDiscount - activeDiscount);

  const numericAmountPaid = parseFloat(amountPaid) || 0;
  const changeAmount = numericAmountPaid - total;
  const isAmountEnough = numericAmountPaid >= total;

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const success = onBarcodeSubmit(searchTerm);
      if (success) {
        setSearchTerm(''); 
      }
    }
  };

  const handleApplyPromoCode = () => {
    const code = promoCode.toUpperCase();
    if (code === 'HEMAT10') {
      const disc = Math.round(totalBeforeDiscount * 0.1);
      setActiveDiscount(disc);
      setIsPromoUnlocked(true);
      alert(`Kode Promo Berhasil! Diskon 10% Aktif.`);
    } else if (code === 'MAZIYYAH') {
      setActiveDiscount(50000);
      setIsPromoUnlocked(true);
      alert('Kode Promo Berhasil! Diskon Rp 50.000 Aktif.');
    } else if (code === 'MASTER') {
       setIsPromoUnlocked(true);
       alert('Mode Promo Terbuka! Silakan masukkan diskon manual.');
    } else {
      alert('Kode promo salah! Fitur diskon tetap terkunci.');
      setIsPromoUnlocked(false);
      setActiveDiscount(0);
    }
    setPromoCode('');
  };

  const handleConfirmPayment = () => {
    const paid = parseFloat(amountPaid) || total;
    if (paymentMethod === PaymentMethod.CASH && paid < total) {
      alert("Uang yang dimasukkan kurang!");
      return;
    }
    onCheckout(paymentMethod, paid, activeDiscount, selectedCustomer);
    setShowConfirmPayment(false);
    setShowCheckout(false);
    setAmountPaid('');
    setActiveDiscount(0);
    setIsPromoUnlocked(false);
  };

  const handleRemoveItem = () => {
    if (itemToDelete) {
      onRemoveFromCart(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleCancelOrder = () => {
    onClearCart();
    setShowCancelOrderConfirm(false);
    setSelectedCustomer('Umum');
    setActiveDiscount(0);
    setIsPromoUnlocked(false);
  };

  return (
    <div className="flex h-full gap-6">
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500 text-lg">🔍</span>
            <input 
              ref={barcodeInputRef}
              type="text" 
              placeholder="Cari Produk / Scan Barcode (Enter)..."
              value={searchTerm}
              onKeyDown={handleKeyDown}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-white text-sm font-semibold shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveCategory('All')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-orange-600 text-white shadow-glow-orange' : 'text-slate-500 hover:text-slate-300'}`}>SEMUA</button>
              {Object.values(Category).map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === c ? 'bg-emerald-600 text-white shadow-glow-green' : 'text-slate-500 hover:text-slate-300'}`}>{c}</button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowPromoModal(true)}
              className={`px-6 py-3 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${isPromoUnlocked ? 'bg-purple-600 text-white border-purple-400 animate-pulse' : 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
            >
              <span>{isPromoUnlocked ? '✅' : '🎁'}</span> Promo {isPromoUnlocked && 'Aktif'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pr-2 pb-10 custom-scrollbar">
          {filtered.map(p => (
            <button key={p.id} onClick={() => onAddToCart(p)} disabled={p.stock <= 0} className="obsidian-card group flex flex-col h-[380px] rounded-[2rem] p-5 text-left border border-white/5 hover:border-orange-500/50 transition-all duration-500 bg-slate-900/40 relative overflow-hidden shadow-lg">
              <div className="absolute top-4 right-4 z-10">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full shadow-lg ${p.stock < 10 ? 'bg-orange-600 text-white' : 'bg-slate-950/80 text-emerald-500 border border-emerald-500/30'}`}>Stok: {p.stock}</span>
              </div>
              <div className="mb-4 h-44 w-full bg-white rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center relative shrink-0 p-4">
                {p.image ? (
                  <img 
                    src={p.image} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={p.name}
                  />
                ) : (
                  <span className="text-4xl opacity-20">📦</span>
                )}
                {/* Overlay for better visibility of names on dark bg */}
                <div className="absolute inset-0 bg-slate-950/5 pointer-events-none"></div>
              </div>
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest mb-1 block">{p.category}</span>
                  <h3 className="font-extrabold text-white text-sm leading-tight line-clamp-2 uppercase tracking-tight">{p.name}</h3>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-500 mb-0.5">{p.barcode}</span>
                    <span className="text-xl font-black text-white tracking-tighter"><span className="text-xs text-emerald-500 mr-0.5">Rp</span>{p.price.toLocaleString()}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all text-lg font-black">+</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Keranjang */}
      <div className={`w-80 border rounded-[2rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-md shrink-0 transition-all duration-500 ${isPromoUnlocked ? 'bg-purple-950/20 border-purple-500/40 shadow-purple-500/20' : 'bg-slate-900/90 border-white/10'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Keranjang</h3>
            <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">Sesi Kasir: Sukron</p>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button 
                onClick={() => setShowCancelOrderConfirm(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-xs"
                title="Batalkan Pesanan"
              >
                🗑️
              </button>
            )}
            <span className="text-[9px] font-black px-3 py-1 bg-orange-600 rounded-full text-white">{cart.length}</span>
          </div>
        </div>

        {/* Customer Input Field */}
        <div className="p-4 bg-slate-950/30 border-b border-white/5">
           <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Nama Pembeli (Ketik Manual)</label>
           <input 
             type="text"
             value={selectedCustomer}
             onChange={(e) => setSelectedCustomer(e.target.value)}
             placeholder="Masukkan nama pelanggan..."
             className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-emerald-500/30 placeholder:text-slate-700"
           />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <span className="text-5xl mb-3">🛒</span>
              <p className="text-[9px] font-black uppercase">Kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 items-center bg-white/5 p-3 rounded-2xl border border-white/5 group transition-all relative">
                 <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-slate-800">
                    <img src={item.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] font-bold text-slate-100 truncate uppercase">{item.name}</h4>
                    <p className="text-[10px] text-emerald-500 font-black">Rp {item.price.toLocaleString()}</p>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">-</button>
                        <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">+</button>
                    </div>
                    <button 
                      onClick={() => setItemToDelete(item.id)}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 hover:text-white"
                    >
                      ✕
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-950/60 border-t border-white/5 space-y-3">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-slate-300">Rp {subtotal.toLocaleString()}</span>
          </div>
          {activeDiscount > 0 && (
            <div className="flex justify-between text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse">
              <span>Diskon Promo</span>
              <span>- Rp {activeDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between items-end mb-1">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Grand Total</p>
              <span className="text-[8px] font-black text-slate-500 uppercase truncate max-w-[100px]">{selectedCustomer.split(' ')[0]}</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">Rp {total.toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <button 
              disabled={cart.length === 0}
              onClick={() => setShowCancelOrderConfirm(true)}
              className="px-4 py-4 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-rose-600 hover:text-white"
            >
              BATAL
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="flex-1 py-4 gradient-dark-orange text-white rounded-2xl font-black text-[11px] shadow-glow-orange uppercase tracking-[0.2em] transition-all"
            >
              BAYAR SEKARANG
            </button>
          </div>
        </div>
      </div>

      {/* REMOVE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Hapus Produk?</h3>
              <p className="text-slate-400 text-xs font-medium mt-2">Produk ini akan dihapus dari daftar belanjaan pelanggan.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleRemoveItem}
                className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMO MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-sm border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Voucher & Promo</h3>
              <button onClick={() => setShowPromoModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-500 hover:text-white transition-all">✕</button>
            </div>

            <div className="space-y-6">
              {/* Promo Code Input */}
              <div className="space-y-3 p-5 bg-slate-950/50 rounded-3xl border border-white/5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center">Aktivasi Kode</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Masukkan Kode..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-purple-500/50"
                  />
                  <button 
                    onClick={handleApplyPromoCode}
                    className="bg-purple-600 text-white px-4 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-purple-900/20"
                  >
                    Cek
                  </button>
                </div>
                {!isPromoUnlocked && <p className="text-[8px] text-rose-500/70 italic text-center uppercase font-bold">Fitur diskon terkunci sampai kode valid dimasukkan</p>}
                {isPromoUnlocked && <p className="text-[8px] text-emerald-500 italic text-center uppercase font-black">✓ Kode Terverifikasi: Fitur Diskon Terbuka</p>}
              </div>

              {/* Locked Features */}
              <div className={`space-y-6 transition-all duration-500 ${isPromoUnlocked ? 'opacity-100' : 'opacity-20 pointer-events-none grayscale'}`}>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center">Pilih Nominal Cepat</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5000, 10000, 20000, 50000].map(val => (
                      <button key={val} onClick={() => setActiveDiscount(val)} className={`py-3 rounded-xl font-black text-[10px] border transition-all ${activeDiscount === val ? 'bg-purple-600 text-white border-purple-400 shadow-glow-orange' : 'bg-slate-800 text-white border-white/5 hover:bg-slate-700'}`}>
                        {val/1000}K
                      </button>
                    ))}
                    <button onClick={() => { setActiveDiscount(0); setIsPromoUnlocked(false); }} className="col-span-2 py-3 bg-rose-600/20 border border-rose-500/30 text-rose-500 font-black text-[10px] rounded-xl">RESET & KUNCI</button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center">Diskon Manual Terbuka (Rp)</label>
                   <input type="number" placeholder="0" value={activeDiscount} onChange={(e) => setActiveDiscount(parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl px-4 py-4 text-center text-xl font-black text-emerald-500 outline-none"/>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowPromoModal(false);
                  if (cart.length > 0 && !showCheckout) {
                    setShowCheckout(true);
                  }
                }}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${isPromoUnlocked ? 'bg-white text-slate-900 shadow-white/10' : 'bg-slate-800 text-slate-600'}`}
              >
                {isPromoUnlocked ? 'Gunakan & Lanjutkan Pembayaran' : 'Konfirmasi Diskon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-6 w-full max-w-[320px] border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Finalisasi Pembayaran</h3>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase truncate max-w-[150px]">{selectedCustomer}</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-500 hover:text-white transition-all">✕</button>
              </div>
              
              <div className="space-y-4">
                {/* Simplified Promo Toggle inside Checkout */}
                {!isPromoUnlocked ? (
                  <button 
                    onClick={() => setShowPromoModal(true)}
                    className="w-full py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[9px] font-black text-purple-400 py-2.5 uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                  >
                    ✨ Punya Kode Promo?
                  </button>
                ) : (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Promo Aktif! (- Rp {activeDiscount.toLocaleString()})</span>
                    <button onClick={() => { setActiveDiscount(0); setIsPromoUnlocked(false); }} className="text-emerald-500 hover:text-white text-xs">✕</button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                   {Object.values(PaymentMethod).map(m => (
                     <button key={m} onClick={() => setPaymentMethod(m)} className={`py-3 px-1 rounded-xl border transition-all flex flex-col items-center gap-1 ${paymentMethod === m ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-glow-orange' : 'border-white/5 bg-slate-800/40 text-slate-500'}`}>
                        <span className="text-xl">{m === PaymentMethod.CASH ? '💵' : m === PaymentMethod.QRIS ? '📱' : m === PaymentMethod.DEBIT ? '💳' : '👛'}</span>
                        <span className="text-[8px] font-black uppercase tracking-tight">{m}</span>
                     </button>
                   ))}
                </div>

                <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 text-center">
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Tagihan</p>
                   <p className="text-2xl font-black text-white tracking-tighter">Rp {total.toLocaleString()}</p>
                </div>

                {paymentMethod === PaymentMethod.CASH && (
                  <div className="space-y-3">
                    <input 
                      type="number" 
                      placeholder="Input Uang Tunai..."
                      value={amountPaid}
                      autoFocus
                      onChange={(e) => setAmountPaid(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && isAmountEnough && handleConfirmPayment()}
                      className="w-full py-4 bg-slate-800 border-2 border-white/5 rounded-2xl text-center text-2xl font-black text-white outline-none focus:border-orange-500/50"
                    />
                    <div className={`p-4 rounded-2xl border transition-all ${isAmountEnough ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                      <p className={`text-2xl font-black tracking-tighter text-center ${isAmountEnough ? 'text-emerald-500' : 'text-rose-500'}`}>
                        Rp {Math.abs(changeAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowConfirmPayment(true)} 
                  disabled={paymentMethod === PaymentMethod.CASH && !isAmountEnough} 
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${isAmountEnough || paymentMethod !== PaymentMethod.CASH ? 'gradient-dark-green text-white shadow-glow-green active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                >
                  LUNASKAN PESANAN
                </button>
              </div>
           </div>
        </div>
      )}

      {/* PAYMENT CONFIRMATION MODAL */}
      {showConfirmPayment && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[400] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 gradient-dark-orange"></div>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-glow-orange animate-pulse">💰</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Konfirmasi Bayar?</h3>
              <p className="text-slate-400 text-xs font-medium mt-3 leading-relaxed px-4">
                Pastikan nominal pembayaran dan metode <span className="text-orange-400 font-bold">{paymentMethod}</span> sudah benar sebelum memproses transaksi ini.
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-3xl p-6 mb-8 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                    <span className="text-xl font-black text-white tracking-tighter text-emerald-500">Rp {total.toLocaleString()}</span>
                </div>
                
                {activeDiscount > 0 && (
                   <div className="flex justify-between items-center py-2 border-t border-white/5 mt-2">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Potongan Promo</span>
                      <span className="text-xs font-bold text-purple-400">- Rp {activeDiscount.toLocaleString()}</span>
                   </div>
                )}

                {paymentMethod === PaymentMethod.CASH && (
                   <div className={`flex justify-between items-center pt-2 border-t border-white/5 ${activeDiscount === 0 ? 'mt-0' : 'mt-1'}`}>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kembalian</span>
                      <span className="text-lg font-black text-white tracking-tighter">Rp {changeAmount.toLocaleString()}</span>
                   </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmPayment}
                className="w-full py-5 bg-emerald-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
              >
                PROSES SEKARANG
              </button>
              <button 
                onClick={() => setShowConfirmPayment(false)}
                className="w-full py-4 bg-slate-800 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
              >
                Cek Ulang
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {showCancelOrderConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[350] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Batalkan Pesanan?</h3>
              <p className="text-slate-400 text-xs font-medium mt-2 leading-relaxed">Seluruh barang di keranjang akan dihapus dan transaksi akan dibatalkan.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowCancelOrderConfirm(false)}
                className="flex-1 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
              >
                Kembali
              </button>
              <button 
                onClick={handleCancelOrder}
                className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
