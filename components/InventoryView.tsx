
import React, { useState, useRef } from 'react';
import { Product, Category } from '../types';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onAddExpense: (description: string, amount: number, category: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ products, setProducts, onAddExpense }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    category: Category.FOOD,
    price: 0,
    costPrice: 0,
    stock: 0,
    image: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.barcode || !formData.price) {
      alert("Mohon lengkapi Nama, Barcode, dan Harga Jual!");
      return;
    }
    
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
      setEditingId(null);
    } else {
      const newProduct = { 
        ...formData, 
        id: Date.now().toString(),
        costPrice: formData.costPrice || Math.round((formData.price || 0) * 0.8)
      } as Product;
      setProducts(prev => [...prev, newProduct]);
      setIsAdding(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', barcode: '', category: Category.FOOD, price: 0, costPrice: 0, stock: 0, image: '' });
  };

  const handleRestock = () => {
    if (!restockProduct || restockAmount <= 0) return;
    
    const totalCost = restockAmount * restockProduct.costPrice;
    
    // 1. Update stok produk
    setProducts(prev => prev.map(p => 
      p.id === restockProduct.id ? { ...p, stock: p.stock + restockAmount } : p
    ));
    
    // 2. Catat sebagai pengeluaran (mempengaruhi laba bersih)
    onAddExpense(
      `Restok: ${restockProduct.name} (${restockAmount} unit)`, 
      totalCost, 
      'Pengadaan Barang'
    );
    
    setRestockProduct(null);
    setRestockAmount(0);
    alert(`Stok berhasil ditambah! Biaya Rp ${totalCost.toLocaleString()} dicatat sebagai pengeluaran.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Inventory Control</h2>
          <p className="text-emerald-500 text-[8px] font-black uppercase tracking-[0.4em] mt-1">Terminal Stock Monitoring</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); setEditingId(null); }}
          className="gradient-dark-green text-white px-6 py-3 rounded-xl font-black shadow-glow-green hover:brightness-110 active:scale-95 transition-all text-[9px] uppercase tracking-widest"
        >
          Tambah Produk Baru
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-[2.5rem] bg-slate-900/50 border border-white/5 custom-scrollbar shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950/80 sticky top-0 border-b border-white/5 z-10 backdrop-blur-md">
            <tr>
              <th className="p-6 font-black text-slate-500 uppercase text-[8px] tracking-[0.3em]">Visual</th>
              <th className="p-6 font-black text-slate-500 uppercase text-[8px] tracking-[0.3em]">Item Details</th>
              <th className="p-6 font-black text-slate-500 uppercase text-[8px] tracking-[0.3em]">Category</th>
              <th className="p-6 font-black text-slate-500 uppercase text-[8px] tracking-[0.3em]">Price (Sell/Cost)</th>
              <th className="p-6 font-black text-slate-500 uppercase text-[8px] tracking-[0.3em]">Stock</th>
              <th className="p-6 font-black text-slate-500 uppercase text-[8px] tracking-[0.3em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-white/5 transition-all group">
                <td className="p-6">
                   <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl opacity-20">📦</span>
                      )}
                   </div>
                </td>
                <td className="p-6">
                  <div>
                    <div className="font-bold text-slate-100 text-[11px] uppercase tracking-tight">{product.name}</div>
                    <div className="text-[8px] font-mono text-slate-600 mt-1 tracking-tighter">{product.barcode}</div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/10">
                    {product.category}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-black text-white text-xs">Rp {product.price.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 font-bold">Cost: Rp {product.costPrice?.toLocaleString()}</span>
                  </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <span className={`font-black text-xs ${product.stock < 10 ? 'text-orange-500' : 'text-slate-100'}`}>{product.stock}</span>
                   </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <button 
                      onClick={() => setRestockProduct(product)}
                      className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Restok
                    </button>
                    <button onClick={() => { setFormData(product); setEditingId(product.id); setIsAdding(true); }} className="text-orange-500 hover:text-white text-[9px] font-black uppercase tracking-widest">Edit</button>
                    <button onClick={() => { if(confirm('Hapus produk ini?')) setProducts(p => p.filter(x => x.id !== product.id))}} className="text-slate-600 hover:text-rose-500 text-[9px] font-black uppercase tracking-widest">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RESTOCK MODAL - NEW FEATURE */}
      {restockProduct && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-sm border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px]"></div>
              
              <div className="relative z-10 text-center">
                 <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-glow-green">💰</div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">Bayar Pengadaan</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">{restockProduct.name}</p>
                 
                 <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Jumlah Stok Masuk</label>
                       <input 
                         type="number" 
                         value={restockAmount}
                         autoFocus
                         onChange={e => setRestockAmount(parseInt(e.target.value) || 0)}
                         className="w-full bg-slate-800 border-2 border-white/5 rounded-2xl py-4 text-center text-2xl font-black text-white outline-none focus:border-emerald-500/50 transition-all"
                         placeholder="0"
                       />
                    </div>

                    <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/5 space-y-3">
                       <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <span>Harga Modal / Unit</span>
                          <span className="text-slate-200">Rp {restockProduct.costPrice.toLocaleString()}</span>
                       </div>
                       <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Total Bayar</p>
                          <p className="text-xl font-black text-white tracking-tighter">Rp {(restockAmount * restockProduct.costPrice).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-10 flex gap-4">
                    <button 
                      onClick={() => setRestockProduct(null)} 
                      className="flex-1 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleRestock}
                      disabled={restockAmount <= 0}
                      className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-glow-green tracking-widest active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Bayar & Stok
                    </button>
                 </div>
                 <p className="text-[8px] text-slate-600 italic mt-4 uppercase">* Pembayaran ini akan langsung mengurangi Saldo Laba Bersih toko.</p>
              </div>
           </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-white/10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black tracking-tight uppercase text-white">{editingId ? 'Edit Data Produk' : 'Produk Baru'}</h3>
              <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-500 hover:text-white transition-all">✕</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Foto Produk</label>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-slate-800 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0 group hover:border-orange-500/50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl opacity-20 group-hover:opacity-50 transition-opacity">📷</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl py-3 text-[9px] font-black text-white uppercase tracking-widest transition-all"
                    >
                      Pilih Foto
                    </button>
                    <p className="text-[8px] text-slate-500 mt-2 italic leading-relaxed uppercase tracking-tighter">Gunakan format JPG/PNG berkualitas tinggi (Maks 2MB).</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Produk</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-800 border border-white/5 rounded-xl text-white text-xs font-bold outline-none focus:border-orange-500/50 transition-all" placeholder="Misal: Beras Premium 5kg"/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Barcode / SKU</label>
                  <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-5 py-3.5 bg-slate-800 border border-white/5 rounded-xl text-white text-[11px] font-mono outline-none focus:border-orange-500/50 transition-all" placeholder="Scan Barcode..."/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Harga Jual (Rp)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-slate-800 border border-white/5 rounded-xl text-white text-sm font-black outline-none focus:border-emerald-500/50 transition-all"/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Harga Modal (Rp)</label>
                    <input type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-slate-800 border border-white/5 rounded-xl text-white text-sm font-black outline-none focus:border-orange-500/50 transition-all"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kategori</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value as Category})}
                      className="w-full px-5 py-3.5 bg-slate-800 border border-white/5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest outline-none appearance-none"
                    >
                      {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stok Awal</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-slate-800 border border-white/5 rounded-xl text-white text-sm font-black outline-none focus:border-blue-500/50 transition-all"/>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 py-4 gradient-dark-green text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-glow-green hover:brightness-110 active:scale-95 transition-all">Simpan Produk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
