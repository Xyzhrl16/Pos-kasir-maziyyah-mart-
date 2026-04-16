
import React from 'react';
import { Transaction } from '../types';

interface ReceiptProps {
  transaction: Transaction;
}

export const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div className="font-mono text-[11px] w-[300px] mx-auto text-black p-4 bg-white leading-tight">
      <div className="text-center mb-6 space-y-1">
        <h1 className="font-black text-base uppercase">MAZIYYAH MART</h1>
        <p className="font-bold text-[10px]">MINIMARKET MODERN & TERLENGKAP</p>
        <p className="text-[9px]">Jl. Inovasi No. 101, Jakarta Pusat</p>
        <p className="text-[9px]">Telp: (021) 555-0123 / WA: 0812-3456-7890</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 my-4 space-y-0.5">
        <div className="flex justify-between">
          <span>NO: {transaction.id}</span>
          <span>KASIR: SUKRON</span>
        </div>
        <div className="flex justify-between">
          <span>TGL: {transaction.timestamp.toLocaleDateString('id-ID')}</span>
          <span>JAM: {transaction.timestamp.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div className="flex justify-between border-t border-black border-dashed pt-1 mt-1">
          <span>PELANGGAN:</span>
          <span className="font-bold uppercase text-black">{transaction.customerName || 'UMUM'}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {transaction.items.map(item => (
          <div key={item.id} className="text-black">
            <div className="font-bold uppercase truncate">{item.name}</div>
            <div className="flex justify-between">
              <span>{item.quantity} x {item.price.toLocaleString()}</span>
              <span>{(item.quantity * item.price).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black pt-2 space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{transaction.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>PPN (11%)</span>
          <span>{transaction.tax.toLocaleString()}</span>
        </div>
        {transaction.discount > 0 && (
          <div className="flex justify-between font-bold border-b border-black border-dotted pb-1">
            <span>DISKON TOTAL</span>
            <span>-{transaction.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-[13px] pt-2 border-t border-black mt-2">
          <span>TOTAL AKHIR</span>
          <span>Rp {transaction.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-black border-dashed space-y-1">
        <div className="flex justify-between font-bold">
          <span className="uppercase">{transaction.paymentMethod}</span>
          <span>{transaction.amountPaid.toLocaleString()}</span>
        </div>
        {transaction.change > 0 && (
          <div className="flex justify-between font-bold">
            <span>KEMBALIAN</span>
            <span>{transaction.change.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="text-center mt-10 space-y-1 border-t border-dashed border-black pt-4">
        <p className="font-bold text-[10px]">*** TERIMA KASIH ***</p>
        <p className="text-[9px]">BARANG YANG SUDAH DIBELI</p>
        <p className="text-[9px]">TIDAK DAPAT DITUKAR/DIKEMBALIKAN</p>
        <p className="pt-2 text-[9px] font-bold">Powered by SmartPOS Maziyyah Mart</p>
      </div>
      
      {/* Paper Cut Spacing */}
      <div className="h-10"></div>
    </div>
  );
};
