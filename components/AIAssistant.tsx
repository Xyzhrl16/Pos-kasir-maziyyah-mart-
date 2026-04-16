
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Product, Transaction } from '../types';

interface AIAssistantProps {
  onClose: () => void;
  products: Product[];
  transactions: Transaction[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, products, transactions }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'ai',
        content: 'Greeting! I am your obsidian-class SmartPOS Assistant. Ask me about stock, sales reports, or business strategies for today.'
      }]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');
      const productContext = products.map(p => `- ${p.name}: Stok ${p.stock}, Harga Jual Rp ${p.price.toLocaleString()}, Modal Rp ${p.costPrice.toLocaleString()}, Kategori ${p.category}`).join('\n');
      const totalRevenue = transactions.reduce((a, b) => a + b.total, 0);
      const totalProfit = transactions.reduce((a, b) => a + (b.total - b.totalCost), 0);
      const lowStockItems = products.filter(p => p.stock < 10).map(p => p.name).join(', ');

      const systemPrompt = `Anda adalah "Maziyyah Intel", asisten bisnis elit dan konsultan strategi untuk Maziyyah Mart.
      
      TUGAS ANDA:
      1. Menganalisis data inventori dan penjualan untuk memberikan wawasan yang tajam.
      2. Memberikan saran stok ulang untuk barang yang menipis.
      3. Menghitung profitabilitas dan memberikan strategi untuk meningkatkan margin.
      4. Menjawab pertanyaan operasional kasir dengan cepat dan profesional.

      DATA REAL-TIME SAAT INI:
      - Total Pendapatan Hari Ini: Rp ${totalRevenue.toLocaleString()}
      - Estimasi Profit Bersih: Rp ${totalProfit.toLocaleString()}
      - Produk Stok Rendah (<10): ${lowStockItems || 'Semua stok aman'}
      - Daftar Produk & Harga:
      ${productContext}

      GAYA BAHASA:
      - Profesional, cerdas, dan suportif.
      - Gunakan Bahasa Indonesia yang baik dan lugas.
      - Berikan jawaban yang berbasis data (data-driven).
      - Jika ditanya strategi, berikan langkah konkret (misal: "Buat promo bundling untuk produk X").

      PENTING: Jaga jawaban tetap ringkas namun padat informasi.`;

      const model = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'ai', content: text || 'Maaf, saya sedang mengalami gangguan koneksi.' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Koneksi ke pusat data terputus. Silakan coba lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[26rem] bg-slate-950 border-l border-white/5 z-[120] flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
      <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-dark-orange flex items-center justify-center shadow-glow text-xl">✨</div>
          <div>
            <h2 className="font-black text-white tracking-tight uppercase text-sm">AI Business Intel</h2>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">Quantum Online</p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-500 hover:text-white transition-all">✕</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-950 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-none' 
                : 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-[1.5rem] rounded-tl-none flex gap-2 shadow-inner">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-slate-900">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Analyze database..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-800 border-none rounded-2xl px-6 py-5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold text-white placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="gradient-dark-orange hover:brightness-110 w-16 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center text-white shadow-glow"
          >
            🚀
          </button>
        </div>
      </div>
    </div>
  );
};
