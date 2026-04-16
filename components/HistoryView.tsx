
import React, { useState } from 'react';
import { Transaction, Expense, PaymentMethod } from '../types';

interface HistoryViewProps {
  transactions: Transaction[];
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions, expenses, onAddExpense }) => {
  const [viewTab, setViewTab] = useState<'analytics' | 'transactions'>('analytics');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: 0, category: 'Operasional' });
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  // Perhitungan Keuangan Akumulasi
  const totalRevenue = transactions.reduce((a, b) => a + b.total, 0);
  const totalCost = transactions.reduce((a, b) => a + b.totalCost, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const totalCashOut = totalCost + totalExpenses;
  const netProfit = totalRevenue - totalCashOut;

  // Analisis Aliran Kas 7 Hari Terakhir
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const cashFlowData = getLast7Days().map(date => {
    const dayTrx = transactions.filter(t => new Date(t.timestamp).toDateString() === date.toDateString());
    const dayExp = expenses.filter(e => new Date(e.timestamp).toDateString() === date.toDateString());
    
    const inflow = dayTrx.reduce((a, b) => a + b.total, 0);
    const outflow = dayTrx.reduce((a, b) => a + b.totalCost, 0) + dayExp.reduce((a, b) => a + b.amount, 0);
    
    return {
      label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      inflow,
      outflow,
      net: inflow - outflow
    };
  });

  const maxFlow = Math.max(...cashFlowData.map(d => Math.max(d.inflow, d.outflow)), 10000);

  const handlePrintReport = () => {
    window.print();
  };

  const handleAddExpense = () => {
    if (!expenseForm.description || expenseForm.amount <= 0) return;
    onAddExpense({
      id: Date.now().toString(),
      timestamp: new Date(),
      ...expenseForm
    });
    setIsAddingExpense(false);
    setExpenseForm({ description: '', amount: 0, category: 'Operasional' });
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header Laporan */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 no-print px-2">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Laporan Kas & Profit</h2>
          <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Cash Flow & Financial Intelligence</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setViewTab('analytics')} 
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Analisis Kas
            </button>
            <button 
              onClick={() => setViewTab('transactions')} 
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewTab === 'transactions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Log Transaksi
            </button>
          </div>
          <button 
            onClick={handlePrintReport}
            className="bg-white text-slate-950 px-6 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            🖨️ Cetak Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-10">
        
        {/* PRINT ONLY HEADER */}
        <div className="hidden print:block text-black text-center mb-10 border-b-2 border-black pb-6">
           <h1 className="text-3xl font-black uppercase">LAPORAN ARUS KAS & LABA RUGI</h1>
           <p className="text-xl font-bold">MAZIYYAH MART - UNIT {new Date().getFullYear()}</p>
           <p className="text-sm mt-1">Periode: {getLast7Days()[0].toLocaleDateString()} - {new Date().toLocaleDateString()}</p>
        </div>

        {viewTab === 'analytics' ? (
          <div className="space-y-8">
            {/* Metrik Aliran Kas Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="obsidian-card p-8 rounded-[2.5rem] bg-slate-900/40 border border-emerald-500/20">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Total Cash Inflow</p>
                    <span className="text-xl">📥</span>
                 </div>
                 <p className="text-3xl font-black text-white">Rp {totalRevenue.toLocaleString()}</p>
                 <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Total Penjualan Terkumpul</p>
              </div>

              <div className="obsidian-card p-8 rounded-[2.5rem] bg-slate-900/40 border border-rose-500/20">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Total Cash Outflow</p>
                    <span className="text-xl">📤</span>
                 </div>
                 <p className="text-3xl font-black text-white">Rp {totalCashOut.toLocaleString()}</p>
                 <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Modal Barang + Biaya Operasional</p>
              </div>

              <div className={`obsidian-card p-8 rounded-[2.5rem] shadow-2xl ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10' : 'bg-rose-500/10 border-rose-500/30'}`}>
                 <div className="flex justify-between items-start mb-4">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Net Cash Balance (Laba)</p>
                    <span className="text-xl">{netProfit >= 0 ? '💎' : '⚠️'}</span>
                 </div>
                 <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Rp {netProfit.toLocaleString()}</p>
                 <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Keuntungan Bersih Siap Tarik</p>
              </div>
            </div>

            {/* Visualisasi Arus Kas Per Hari (In vs Out) */}
            <div className="obsidian-card p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Visualisasi Aliran Kas 7 Hari</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Perbandingan Dana Masuk vs Dana Keluar Harian</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-[8px] font-black text-slate-500 uppercase">Inflow</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-[8px] font-black text-slate-500 uppercase">Outflow</span>
                     </div>
                  </div>
               </div>

               <div className="h-64 flex items-end justify-between gap-6 px-4">
                  {cashFlowData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                       {/* Tooltip Hover */}
                       <div className="absolute -top-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-white/10 p-3 rounded-2xl shadow-2xl z-30 pointer-events-none min-w-[140px]">
                          <p className="text-[8px] font-black text-white uppercase mb-2 border-b border-white/10 pb-1">{day.label}</p>
                          <div className="flex justify-between text-[9px] mb-1"><span className="text-emerald-500">IN:</span> <span className="font-black">Rp {day.inflow.toLocaleString()}</span></div>
                          <div className="flex justify-between text-[9px]"><span className="text-rose-500">OUT:</span> <span className="font-black">Rp {day.outflow.toLocaleString()}</span></div>
                       </div>

                       <div className="w-full flex items-end justify-center gap-2 h-48">
                          <div 
                            className="w-[18%] bg-emerald-500 rounded-t-md transition-all duration-700 shadow-glow-green" 
                            style={{ height: `${(day.inflow / maxFlow) * 100}%`, minHeight: '4px' }}
                          ></div>
                          <div 
                            className="w-[18%] bg-rose-500 rounded-t-md transition-all duration-700" 
                            style={{ height: `${(day.outflow / maxFlow) * 100}%`, minHeight: '4px' }}
                          ></div>
                       </div>
                       <span className="text-[9px] font-black text-slate-500 mt-4 uppercase">{day.label}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* List Biaya & Operasional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="obsidian-card p-8 rounded-[2.5rem]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Pengeluaran Operasional</h3>
                    <button 
                      onClick={() => setIsAddingExpense(true)} 
                      className="no-print w-10 h-10 rounded-xl bg-rose-600/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-black hover:bg-rose-600 hover:text-white transition-all"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                     {expenses.length === 0 ? (
                       <div className="py-10 text-center opacity-20">
                          <span className="text-4xl">🧾</span>
                          <p className="text-[10px] font-black mt-2 uppercase">Belum ada biaya tercatat</p>
                       </div>
                     ) : (
                       expenses.map(exp => (
                         <div key={exp.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-rose-500/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-rose-500">💸</div>
                              <div>
                                <p className="text-xs font-black text-white uppercase">{exp.description}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{exp.timestamp.toLocaleTimeString()}</p>
                              </div>
                           </div>
                           <span className="text-sm font-black text-rose-500">- Rp {exp.amount.toLocaleString()}</span>
                         </div>
                       ))
                     )}
                  </div>
               </div>

               <div className="obsidian-card p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 flex flex-col justify-center">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Efisiensi Profitabilitas</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                           <span>Rasio Biaya vs Pendapatan</span>
                           <span className="text-white">{totalRevenue > 0 ? ((totalCashOut / totalRevenue) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-rose-600 shadow-lg" style={{ width: `${Math.min(100, (totalCashOut / totalRevenue) * 100)}%` }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                           <span>Margin Laba Bersih</span>
                           <span className="text-emerald-500">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 shadow-glow-green" style={{ width: `${Math.max(0, (netProfit / totalRevenue) * 100)}%` }}></div>
                        </div>
                     </div>
                     <p className="text-[8px] text-slate-600 italic uppercase leading-relaxed pt-4 border-t border-white/5">
                        * Semakin tinggi Margin Laba Bersih, semakin sehat bisnis Maziyyah Mart Anda. Target ideal minimarket: 15-25%.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="obsidian-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
             <table className="w-full text-left print:text-black">
                <thead className="bg-slate-800/50 print:bg-slate-100 border-b border-white/5 print:border-black">
                   <tr>
                      <th className="p-6 text-[9px] font-black text-slate-500 print:text-black uppercase tracking-widest">ID / Pelanggan</th>
                      <th className="p-6 text-[9px] font-black text-slate-500 print:text-black uppercase tracking-widest">Waktu & Metode</th>
                      <th className="p-6 text-[9px] font-black text-slate-500 print:text-black uppercase tracking-widest">Jumlah Barang</th>
                      <th className="p-6 text-[9px] font-black text-slate-500 print:text-black uppercase tracking-widest text-right">Settled Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-slate-200">
                   {transactions.map(t => (
                     <tr 
                      key={t.id} 
                      onClick={() => setSelectedTrx(t)}
                      className="hover:bg-white/10 cursor-pointer transition-all group"
                     >
                        <td className="p-6">
                           <p className="text-xs font-black text-white print:text-black uppercase">{t.id}</p>
                           <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">{t.customerName || 'Umum'}</p>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-300">{t.timestamp.toLocaleTimeString()}</span>
                             <span className="text-[8px] font-black uppercase text-blue-500 mt-1">{t.paymentMethod}</span>
                           </div>
                        </td>
                        <td className="p-6 text-[10px] text-slate-400 print:text-slate-700">
                           {t.items.length} Produk <br/>
                           <span className="text-[8px] opacity-50 uppercase">{t.items.map(i => i.name).join(', ').slice(0, 30)}...</span>
                        </td>
                        <td className="p-6 text-right">
                           <span className="text-lg font-black text-white print:text-black">Rp {t.total.toLocaleString()}</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* PRINT ONLY FOOTER SUMMARY */}
        <div className="hidden print:block mt-12 border-t-2 border-black pt-8 space-y-3">
           <div className="flex justify-between text-lg font-bold">
              <span>Total Pemasukan (Cash In):</span>
              <span>Rp {totalRevenue.toLocaleString()}</span>
           </div>
           <div className="flex justify-between text-lg">
              <span>Total Harga Pokok Barang:</span>
              <span>(Rp {totalCost.toLocaleString()})</span>
           </div>
           <div className="flex justify-between text-lg">
              <span>Biaya Operasional Toko:</span>
              <span>(Rp {totalExpenses.toLocaleString()})</span>
           </div>
           <div className="flex justify-between text-2xl font-black pt-4 border-t border-black">
              <span>LABA BERSIH AKHIR:</span>
              <span className="text-emerald-700">Rp {netProfit.toLocaleString()}</span>
           </div>
           
           <div className="mt-20 flex justify-between">
              <div className="text-center w-64 border-t border-black pt-2">
                 <p className="font-bold">Kasir Bertugas,</p>
                 <div className="h-20"></div>
                 <p>( Anam )</p>
              </div>
              <div className="text-center w-64 border-t border-black pt-2">
                 <p className="font-bold">Pemilik Toko,</p>
                 <div className="h-20"></div>
                 <p>( ____________________ )</p>
              </div>
           </div>
        </div>
      </div>

      {/* Modal Transaction Detail */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[250] p-4 no-print animate-in fade-in duration-300">
           <div className="bg-slate-900 rounded-[3rem] p-10 w-full max-w-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Detail Transaksi</h3>
                   <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full">{selectedTrx.id}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedTrx.timestamp.toLocaleString('id-ID')}</span>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedTrx(null)} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  ✕
                </button>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar space-y-8 pr-2">
                 {/* Customer & Info Section */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Pelanggan</p>
                       <p className="text-sm font-black text-white uppercase">{selectedTrx.customerName || 'Umum'}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Metode Bayar</p>
                       <div className="flex items-center gap-2">
                          <span className="text-sm">💳</span>
                          <p className="text-sm font-black text-blue-500 uppercase">{selectedTrx.paymentMethod}</p>
                       </div>
                    </div>
                 </div>

                 {/* Items Table */}
                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rincian Belanja ({selectedTrx.items.length} Item)</p>
                    <div className="space-y-2">
                       {selectedTrx.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center p-5 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                                  <img src={item.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={item.name} />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-white uppercase">{item.name}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-white">Rp {(item.quantity * item.price).toLocaleString()}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Financial Summary Detail */}
                 <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span>Subtotal Bruto</span>
                       <span className="text-slate-300">Rp {selectedTrx.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span>Pajak PPN (11%)</span>
                       <span className="text-slate-300">Rp {selectedTrx.tax.toLocaleString()}</span>
                    </div>
                    {selectedTrx.discount > 0 && (
                      <div className="flex justify-between text-[10px] font-black text-rose-500 uppercase tracking-widest">
                         <span>Diskon Promo</span>
                         <span>- Rp {selectedTrx.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                       <div>
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Total Terbayar</p>
                          <p className="text-3xl font-black text-white tracking-tighter">Rp {selectedTrx.total.toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Kembalian Tunai</p>
                          <p className="text-lg font-black text-emerald-500">Rp {selectedTrx.change.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="relative z-10 mt-10 flex gap-4">
                 <button 
                  onClick={() => setSelectedTrx(null)} 
                  className="flex-1 py-5 bg-slate-800 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
                 >
                   Kembali Ke Daftar
                 </button>
                 <button 
                  className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-glow-green hover:brightness-110 active:scale-95 transition-all"
                  onClick={() => window.print()}
                 >
                   🖨️ Cetak Ulang Struk
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Add Expense */}
      {isAddingExpense && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 no-print border-t border-white/5">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-md border border-white/10 animate-in zoom-in duration-300 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Input Operasional</h3>
                <button onClick={() => setIsAddingExpense(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deskripsi Biaya</label>
                    <input 
                      type="text" 
                      placeholder="Misal: Listrik, Gaji, Wi-Fi..."
                      autoFocus
                      value={expenseForm.description}
                      onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white font-bold outline-none focus:border-rose-500/50"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nominal Pembayaran (Rp)</label>
                    <input 
                      type="number" 
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({...expenseForm, amount: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-5 text-2xl text-white font-black outline-none focus:border-rose-500/50 text-center"
                    />
                 </div>
              </div>
              <div className="mt-10 flex gap-4">
                 <button onClick={() => setIsAddingExpense(false)} className="flex-1 py-4 bg-slate-800 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest">Batal</button>
                 <button onClick={handleAddExpense} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-glow-orange tracking-widest active:scale-95 transition-all">Simpan Dana Keluar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
