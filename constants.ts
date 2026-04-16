
import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Kebutuhan Dapur
  { id: '1', barcode: '899123456701', name: 'Beras Premium 5kg', category: Category.KITCHEN, price: 75000, costPrice: 68000, stock: 50, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600' },
  { id: '2', barcode: '899123456702', name: 'Minyak Goreng 2L', category: Category.KITCHEN, price: 34000, costPrice: 29500, stock: 40, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600' },
  { id: '3', barcode: '899123456703', name: 'Gula Pasir 1kg', category: Category.KITCHEN, price: 16000, costPrice: 14000, stock: 100, image: 'https://images.unsplash.com/photo-1581448670548-410d255a0b3e?auto=format&fit=crop&q=80&w=600' },
  { id: '7', barcode: '899123456707', name: 'Telur Ayam 1kg', category: Category.KITCHEN, price: 28000, costPrice: 24500, stock: 30, image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600' },
  { id: '8', barcode: '899123456708', name: 'Kecap Manis 550ml', category: Category.KITCHEN, price: 22000, costPrice: 18500, stock: 45, image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?auto=format&fit=crop&q=80&w=600' },
  { id: '19', barcode: '899123456719', name: 'Garam Dapur 250g', category: Category.KITCHEN, price: 5000, costPrice: 3500, stock: 80, image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&q=80&w=600' },
  { id: '26', barcode: '899123456726', name: 'Tepung Terigu 1kg', category: Category.KITCHEN, price: 12500, costPrice: 10500, stock: 60, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600' },
  { id: '27', barcode: '899123456727', name: 'Susu Kental Manis', category: Category.KITCHEN, price: 14500, costPrice: 12000, stock: 70, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600' },
  { id: '28', barcode: '899123456728', name: 'Margarin 200g', category: Category.KITCHEN, price: 9000, costPrice: 7500, stock: 50, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb0a565ec?auto=format&fit=crop&q=80&w=600' },
  { id: '29', barcode: '899123456729', name: 'Lada Bubuk 5g', category: Category.KITCHEN, price: 2000, costPrice: 1200, stock: 150, image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600' },

  // Perlengkapan Sekolah
  { id: '4', barcode: '899123456704', name: 'Buku Tulis A5', category: Category.SCHOOL, price: 5000, costPrice: 3200, stock: 200, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600' },
  { id: '5', barcode: '899123456705', name: 'Pensil 2B', category: Category.SCHOOL, price: 3500, costPrice: 1800, stock: 150, image: 'https://images.unsplash.com/photo-1510343163148-52264c7402a1?auto=format&fit=crop&q=80&w=600' },
  { id: '11', barcode: '899123456711', name: 'Tas Punggung Hitam', category: Category.SCHOOL, price: 150000, costPrice: 110000, stock: 15, image: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=600' },
  { id: '12', barcode: '899123456712', name: 'Penggaris Besi 30cm', category: Category.SCHOOL, price: 8500, costPrice: 5000, stock: 60, image: 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?auto=format&fit=crop&q=80&w=600' },
  { id: '13', barcode: '899123456713', name: 'Pulpen Gel 0.5', category: Category.SCHOOL, price: 6000, costPrice: 3800, stock: 120, image: 'https://images.unsplash.com/photo-1585336261022-69c6e271d1ee?auto=format&fit=crop&q=80&w=600' },
  { id: '30', barcode: '899123456730', name: 'Penghapus Putih', category: Category.SCHOOL, price: 2500, costPrice: 1500, stock: 100, image: 'https://images.unsplash.com/photo-1586075010633-2a7018383e72?auto=format&fit=crop&q=80&w=600' },
  { id: '31', barcode: '899123456731', name: 'Spidol Whiteboard', category: Category.SCHOOL, price: 12000, costPrice: 9000, stock: 45, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=600' },
  { id: '32', barcode: '899123456732', name: 'Crayon 12 Warna', category: Category.SCHOOL, price: 25000, costPrice: 18000, stock: 25, image: 'https://images.unsplash.com/photo-1602738328654-51ab2339547b?auto=format&fit=crop&q=80&w=600' },

  // Kebutuhan Rumah Tangga
  { id: '14', barcode: '899123456714', name: 'Deterjen Bubuk 800g', category: Category.HOUSEHOLD, price: 21500, costPrice: 18000, stock: 55, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=600' },
  { id: '15', barcode: '899123456715', name: 'Sabun Cuci Piring 750ml', category: Category.HOUSEHOLD, price: 15500, costPrice: 12500, stock: 40, image: 'https://images.unsplash.com/photo-1626245917164-21bd21088db6?auto=format&fit=crop&q=80&w=600' },
  { id: '16', barcode: '899123456716', name: 'Tisu Wajah 250s', category: Category.HOUSEHOLD, price: 12000, costPrice: 9000, stock: 90, image: 'https://images.unsplash.com/photo-1616613343516-7d46c87e1431?auto=format&fit=crop&q=80&w=600' },
  { id: '17', barcode: '899123456717', name: 'Lampu LED 9W', category: Category.HOUSEHOLD, price: 35000, costPrice: 28000, stock: 25, image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=600' },
  { id: '33', barcode: '899123456733', name: 'Sampo Botol 170ml', category: Category.HOUSEHOLD, price: 28000, costPrice: 24000, stock: 30, image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=600' },
  { id: '34', barcode: '899123456734', name: 'Pasta Gigi 190g', category: Category.HOUSEHOLD, price: 18000, costPrice: 15500, stock: 50, image: 'https://images.unsplash.com/photo-1559599141-3816a0b721e4?auto=format&fit=crop&q=80&w=600' },
  { id: '35', barcode: '899123456735', name: 'Sabun Mandi Cair 450ml', category: Category.HOUSEHOLD, price: 24500, costPrice: 21000, stock: 35, image: 'https://images.unsplash.com/photo-1600857062241-99e5da7f21e2?auto=format&fit=crop&q=80&w=600' },
  { id: '36', barcode: '899123456736', name: 'Pembersih Lantai 750ml', category: Category.HOUSEHOLD, price: 14000, costPrice: 11500, stock: 42, image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=600' },

  // Makanan
  { id: '9', barcode: '899123456709', name: 'Mie Instan Goreng', category: Category.FOOD, price: 3100, costPrice: 2600, stock: 300, image: 'https://images.unsplash.com/photo-1612927635301-3810419357d6?auto=format&fit=crop&q=80&w=600' },
  { id: '18', barcode: '899123456718', name: 'Biskuit Cokelat', category: Category.FOOD, price: 8500, costPrice: 6500, stock: 75, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=600' },
  { id: '20', barcode: '899123456720', name: 'Keripik Kentang 68g', category: Category.FOOD, price: 11000, costPrice: 8500, stock: 65, image: 'https://images.unsplash.com/photo-1566478431375-7fe89d363d64?auto=format&fit=crop&q=80&w=600' },
  { id: '21', barcode: '899123456721', name: 'Roti Tawar Gandum', category: Category.FOOD, price: 18500, costPrice: 15000, stock: 12, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600' },
  { id: '37', barcode: '899123456737', name: 'Cokelat Batangan 60g', category: Category.FOOD, price: 15000, costPrice: 12500, stock: 40, image: 'https://images.unsplash.com/photo-1549007994-cb92ca714503?auto=format&fit=crop&q=80&w=600' },
  { id: '38', barcode: '899123456738', name: 'Sarden Kaleng 155g', category: Category.FOOD, price: 11500, costPrice: 9800, stock: 35, image: 'https://images.unsplash.com/photo-1622484210804-098522960655?auto=format&fit=crop&q=80&w=600' },
  { id: '39', barcode: '899123456739', name: 'Kacang Atom 140g', category: Category.FOOD, price: 9500, costPrice: 7800, stock: 60, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600' },

  // Minuman
  { id: '10', barcode: '899123456710', name: 'Air Mineral 600ml', category: Category.BEVERAGE, price: 3500, costPrice: 2100, stock: 120, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=600' },
  { id: '22', barcode: '899123456722', name: 'Susu UHT Full Cream 1L', category: Category.BEVERAGE, price: 19500, costPrice: 16800, stock: 35, image: 'https://images.unsplash.com/photo-1563636619-e910f64bd1cf?auto=format&fit=crop&q=80&w=600' },
  { id: '23', barcode: '899123456723', name: 'Teh Kotak 300ml', category: Category.BEVERAGE, price: 4000, costPrice: 2800, stock: 100, image: 'https://images.unsplash.com/photo-1582234080931-7e80f97063d8?auto=format&fit=crop&q=80&w=600' },
  { id: '24', barcode: '899123456724', name: 'Minuman Soda 1.5L', category: Category.BEVERAGE, price: 15500, costPrice: 13000, stock: 24, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600' },
  { id: '25', barcode: '899123456725', name: 'Kopi Kapal Api 165g', category: Category.BEVERAGE, price: 14500, costPrice: 12000, stock: 50, image: 'https://images.unsplash.com/photo-1559056191-7237f11b7d90?auto=format&fit=crop&q=80&w=600' },
  { id: '40', barcode: '899123456740', name: 'Jus Apel Kotak 250ml', category: Category.BEVERAGE, price: 6500, costPrice: 5000, stock: 60, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=600' },
  { id: '41', barcode: '899123456741', name: 'Minuman Isotonik 500ml', category: Category.BEVERAGE, price: 8500, costPrice: 6500, stock: 48, image: 'https://images.unsplash.com/photo-1622543953495-a22d64cad189?auto=format&fit=crop&q=80&w=600' },
  { id: '42', barcode: '899123456742', name: 'Teh Hijau Botol 450ml', category: Category.BEVERAGE, price: 7000, costPrice: 5500, stock: 72, image: 'https://images.unsplash.com/photo-1623062016335-5198ec4d8964?auto=format&fit=crop&q=80&w=600' },
];

export const TAX_RATE = 0.11; // 11% PPN
