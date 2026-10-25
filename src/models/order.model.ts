import type { Plant } from './plant.model';

export type OrderStatus = 'reserved' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  orderId: number;
  plantId: number;
  plant: Plant;
  quantity: number;
  status: OrderStatus; 
  userRating?: number; 
}

export interface Order {
  id: number;
  userId: number;
  createdAt: string;
  items: OrderItem[];
  totalPrice: number; 
}