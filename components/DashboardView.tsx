
import React, { useState } from 'react';
import { Transaction, Product, Expense, Category } from '../types';

interface DashboardViewProps {
  transactions: Transaction[];
  products: Product[];
  expenses: Expense[];
  onNavigateToPos: () => void;
  onNavigateToInventory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ transactions, products, expenses, onNavigateToPos, onNavigateToInventory }) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [compareRange, setCompareRange] = useState<'week' | 'month'>('week');

  const totalRevenue = transactions.reduce((a, b) => a + b.total, 0);
  const totalCost = transactions.reduce((a, b) => a + b.totalCost, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const netProfit = totalRevenue - totalCost - totalExpenses;
  
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStockProducts = products.filter(p => p.stock <= 0);

  // Perhitungan Keuangan
  const cogsPercent = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;
  const expensePercent = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
  const profitPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Logic Growth Comparison
  const getPeriodData = (daysBackStart: number, daysBackEnd: number) => {
    const start = new Date();
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - daysBackStart);
    
    const end = new Date();
    end.setHours(23,59,59,999);
    end.setDate(end.getDate() - daysBackEnd);

    const periodTrx = transactions.filter(t => {
      const d = new Date(t.timestamp);
      return d >= end && d <= start;
    });

    const revenue = periodTrx.reduce((a, b) => a + b.total, 0);
    const count = periodTrx.length;
    return { revenue, count, avg: count > 0 ? revenue / count : 0 };
  };

  const currentPeriod = compareRange === 'week' ? getPeriodData(0, 6) : getPeriodData(0, 29);
  const previousPeriod = compareRange === 'week' ? getPeriodData(7, 13) : getPeriodData(30, 59);

  const calculateGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const growthMetrics = [
    { label: 'Revenue', curr: currentPeriod.revenue, prev: previousPeriod.revenue, growth: calculateGrowth(currentPeriod.revenue, previousPeriod.revenue) },
    { label: 'Transaksi', curr: currentPeriod.count, prev: previousPeriod.count, growth: calculateGrowth(currentPeriod.count, previousPeriod.count) },
    { label: 'Avg Basket', curr: currentPeriod.avg, prev: previousPeriod.avg, growth: calculateGrowth(currentPeriod.avg, previousPeriod.avg) },
  ];

  // Logic 7 Hari Terakhir
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyRevenueData = last7Days.map(date => {
    const total = transactions
      .filter(t => new Date(t.timestamp).toDateString() === date.toDateString())
      .reduce((acc, t) => acc + t.total, 0);
    return {
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      value: total
    };
  });

  const maxRevenue = Math.max(...dailyRevenueData.map(d => d.value), 100000);

  // Logic Composition per Category (Donut Chart)
  const categoryData = Object.values(Category).map(cat => {
    let revenue = 0;
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (item.category === cat) {
          revenue += (item.price * item.quantity);
        }
      });
    });
    return { name: cat, value: revenue };
  });

  const totalCatRevenue = categoryData.reduce((a, b) => a + b.value, 0) || 1;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case Category.KITCHEN: return '#f97316';
      case Category.SCHOOL: return '#3b82f6';
      case Category.HOUSEHOLD: return '#a855f7';
      case Category.FOOD: return '#10b981';
      case Category.BEVERAGE: return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getCategoryTailwindColor = (cat: string) => {
    switch (cat) {
      case Category.KITCHEN: return 'bg-orange-500';
      case Category.SCHOOL: return 'bg-blue-500';
      case Category.HOUSEHOLD: return 'bg-purple-500';
      case Category.FOOD: return 'bg-emerald-500';
      case Category.BEVERAGE: return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  let cumulativePercent = 0;
  const donutSlices = categoryData.map(d => {
    const percent = (d.value / totalCatRevenue) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...d, startPercent, percent };
  });

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="obsidian-card p-10 rounded-[3rem] bg-gradient-to-b from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group flex flex-col items-center justify-center text-center min-h-[280px]">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <span className="text-[280px] select-none">🏪</span>
        </div>
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl mx-auto mb-6 shadow-glow-orange">👋</div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4">Halo, Kasir <span className="text-orange-500">Anam</span></h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">Monitoring performa toko <span className="text-white font-bold">Maziyyah Mart</span> Anda hari ini.</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button onClick={onNavigateToPos} className="px-8 py-3.5 gradient-dark-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-glow-orange hover:scale-105 transition-all">🚀 Terminal Kasir</button>
            <button onClick={onNavigateToInventory} className="px-8 py-3.5 bg-slate-800/80 backdrop-blur-md text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-slate-700 transition-all">📦 Cek Inventori</button>
          </div>
        </div>
      </div>

      {/* Growth Analysis & Comparison Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Growth Metrics Cards (2/3) */}
        <div className="xl:col-span-2 obsidian-card p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Growth Analytics</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Metrik Pertumbuhan Bisnis</p>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setCompareRange('week')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${compareRange === 'week' ? 'bg-orange-600 text-white shadow-glow-orange' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Mingguan
              </button>
              <button 
                onClick={() => setCompareRange('month')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${compareRange === 'month' ? 'bg-orange-600 text-white shadow-glow-orange' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Bulanan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {growthMetrics.map((m, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 flex flex-col justify-between group hover:border-orange-500/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${m.growth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {m.growth >= 0 ? '↗' : '↘'} {Math.abs(m.growth).toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-end gap-3">
                     <p className="text-2xl font-black text-white tracking-tighter">
                       {m.label === 'Revenue' || m.label === 'Avg Basket' ? `Rp ${Math.round(m.curr).toLocaleString()}` : m.curr}
                     </p>
                     <p className="text-[9px] font-bold text-slate-500 mb-1 uppercase">Siklus Ini</p>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${m.growth >= 0 ? 'bg-emerald-500 shadow-glow-green' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, m.growth + 50))}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-tighter">
                     <span>Prev: {m.label === 'Revenue' || m.label === 'Avg Basket' ? `Rp ${Math.round(m.prev).toLocaleString()}` : m.prev}</span>
                     <span className={m.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{m.growth >= 0 ? '+' : '-'}{Math.abs(m.growth).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual Bar Comparison Chart (1/3) - NEW SECTION */}
        <div className="xl:col-span-1 obsidian-card p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 shadow-2xl flex flex-col">
          <div className="mb-8">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Performance Snapshot</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Perbandingan Visual Periode</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-around gap-8">
            {growthMetrics.slice(0, 2).map((m, idx) => {
              const maxValue = Math.max(m.curr, m.prev, 1);
              return (
                <div key={idx} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m.label} Compare</span>
                    <span className={`text-[10px] font-black ${m.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.growth >= 0 ? 'GAINED' : 'LOST'} {Math.abs(m.growth).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Current Bar */}
                    <div className="group">
                      <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase mb-1">
                        <span>Current</span>
                        <span className="text-white group-hover:text-orange-500 transition-colors">
                          {m.label === 'Revenue' ? `Rp ${Math.round(m.curr).toLocaleString()}` : m.curr}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-lg overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-orange-600 shadow-glow-orange transition-all duration-1000 ease-out"
                          style={{ width: `${(m.curr / maxValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Previous Bar */}
                    <div className="group">
                      <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase mb-1">
                        <span>Previous</span>
                        <span className="text-slate-400">
                          {m.label === 'Revenue' ? `Rp ${Math.round(m.prev).toLocaleString()}` : m.prev}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-lg overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-slate-800 transition-all duration-1000 ease-out"
                          style={{ width: `${(m.prev / maxValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[9px] text-slate-600 text-center uppercase font-black tracking-widest italic leading-relaxed">
              * Perbandingan otomatis berdasarkan aktivitas real-time Maziyyah Mart.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pendapatan Hari Ini', value: `Rp ${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Estimasi Laba Bersih', value: `Rp ${netProfit.toLocaleString()}`, icon: '📈', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Transaksi', value: transactions.length, icon: '🛒', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Stok Habis', value: outOfStockProducts.length, icon: '⚠️', color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="obsidian-card p-6 rounded-[2rem] flex items-center gap-4 border border-white/5">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl shadow-inner`}>{stat.icon}</div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 7-Day Revenue Trend Bar Chart */}
        <div className="obsidian-card p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Tren Pendapatan 7 Hari</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sumbu Y: Rupiah | Sumbu X: Tanggal</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">Live Report</div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 px-2 relative border-l border-b border-white/10 pb-2">
            <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none flex flex-col justify-between opacity-5">
              <div className="w-full h-[1px] bg-white"></div>
              <div className="w-full h-[1px] bg-white"></div>
              <div className="w-full h-[1px] bg-white"></div>
              <div className="w-full h-[1px] bg-white"></div>
            </div>

            {dailyRevenueData.map((day, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
                onMouseEnter={() => setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className={`absolute -top-16 bg-slate-800 border border-white/10 p-3 rounded-2xl shadow-2xl z-20 pointer-events-none min-w-[120px] transition-all duration-300 ${hoveredDay === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{day.label}</p>
                   <p className="text-sm font-black text-emerald-500">Rp {day.value.toLocaleString()}</p>
                </div>

                <div 
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 relative overflow-hidden ${hoveredDay === idx ? 'bg-emerald-400 shadow-glow-green brightness-125' : 'bg-emerald-600'}`}
                  style={{ height: `${(day.value / maxRevenue) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <span className="text-[8px] font-black text-slate-500 mt-4 uppercase tracking-tighter whitespace-nowrap">{day.label}</span>
              </div>
            ))}
          </div>
          
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] pointer-events-none">
            Rupiah Trend
          </div>
        </div>

        {/* Composition Analytics (Donut Chart) */}
        <div className="obsidian-card p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Komposisi Penjualan</h3>
            <span className="text-[9px] font-black text-orange-500">Sales Mix</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
            <div className="relative w-48 h-48 shrink-0">
               <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                  {donutSlices.map((slice, i) => (
                    <circle
                      key={i}
                      cx="21" cy="21" r="15.91549430918954"
                      fill="transparent"
                      stroke={getCategoryColor(slice.name)}
                      strokeWidth="5"
                      strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
                      strokeDashoffset={-slice.startPercent}
                      className="transition-all duration-1000 cursor-pointer hover:stroke-white"
                      onMouseEnter={() => setHoveredCat(slice.name)}
                      onMouseLeave={() => setHoveredCat(null)}
                      style={{ opacity: hoveredCat && hoveredCat !== slice.name ? 0.3 : 1 }}
                    />
                  ))}
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-black text-white">{hoveredCat ? `${donutSlices.find(s => s.name === hoveredCat)?.percent.toFixed(1)}%` : '🛍️'}</p>
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{hoveredCat || 'Kategori'}</p>
               </div>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-2 w-full">
              {donutSlices.map((slice, i) => (
                <div key={i} className={`p-3 rounded-xl flex items-center justify-between border transition-all ${hoveredCat === slice.name ? 'bg-white/5 border-white/20' : 'bg-slate-950/20 border-white/5'}`}>
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getCategoryTailwindColor(slice.name)} shadow-lg`}></div>
                      <span className="text-[9px] font-black text-white uppercase truncate max-w-[100px]">{slice.name}</span>
                   </div>
                   <span className="text-[9px] font-black text-slate-400">{slice.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 obsidian-card p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Alokasi Margin Bisnis</h3>
            <p className="text-lg font-black text-white">Rp {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="space-y-6">
            <div className="w-full h-6 flex rounded-xl overflow-hidden bg-slate-950">
              <div style={{ width: `${Math.max(1, cogsPercent)}%` }} className="h-full bg-orange-600 transition-all duration-1000"></div>
              <div style={{ width: `${Math.max(1, expensePercent)}%` }} className="h-full bg-rose-600 transition-all duration-1000"></div>
              <div style={{ width: `${Math.max(1, profitPercent)}%` }} className="h-full gradient-dark-green transition-all duration-1000"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                <div>
                  <p className="text-[7px] font-black text-slate-500 uppercase">Modal (COGS)</p>
                  <p className="text-[10px] font-black text-white">{cogsPercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                <div>
                  <p className="text-[7px] font-black text-slate-500 uppercase">Operasional</p>
                  <p className="text-[10px] font-black text-white">{expensePercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green"></div>
                <div>
                  <p className="text-[7px] font-black text-slate-500 uppercase">Laba Bersih</p>
                  <p className="text-[10px] font-black text-emerald-500">{profitPercent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 obsidian-card p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Stok Alert</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
             {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
               <p className="text-[10px] text-slate-600 text-center py-10 uppercase font-black">Semua Stok Aman ✅</p>
             ) : (
               <>
                 {outOfStockProducts.map(p => (
                   <div key={p.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[8px] font-black text-rose-500 uppercase">Habis</span>
                   </div>
                 ))}
                 {lowStockProducts.map(p => (
                   <div key={p.id} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[8px] font-black text-orange-500 uppercase">Menipis</span>
                   </div>
                 ))}
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
