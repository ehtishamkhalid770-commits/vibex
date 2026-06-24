export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Tees' | 'Jackets' | 'Pants' | 'Accessories' | 'Kids' | 'All' | string;
  gender: 'Men' | 'Women' | 'Kids' | 'Unisex';
  image: string;
  rating: number;
  desc: string;
  reviews: number;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  price: number;
  image: string;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  buyerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}
