import type { Order, OrderItem, OrderStatus } from '../models/order.model';
import type { Plant } from '../models/plant.model';

const CART_KEY = 'plant_shop_cart';

export class OrderService {
  
  static getCart(userId: number): Order {
    const data = localStorage.getItem(`${CART_KEY}_${userId}`);
    if (data) {
      const order: Order = JSON.parse(data);
      order.totalPrice = this.calculateTotal(order.items);
      return order;
    }
    return {
      id: Date.now(),
      userId,
      createdAt: new Date().toISOString(),
      items: [],
      totalPrice: 0,
    };
  }

  static saveCart(order: Order): void {
    order.totalPrice = this.calculateTotal(order.items);
    localStorage.setItem(`${CART_KEY}_${order.userId}`, JSON.stringify(order));
  }

  static addToCart(userId: number, plant: Plant, quantity: number = 1): Order {
    const cart = this.getCart(userId);
    const existingItem = cart.items.find((item) => item.plantId === plant.id && item.status === 'reserved');

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: OrderItem = {
        id: Date.now(),
        orderId: cart.id,
        plantId: plant.id,
        plant,
        quantity,
        status: 'reserved', 
      };
      cart.items.push(newItem);
    }

    this.saveCart(cart);
    return cart;
  }

 
  static updateQuantity(userId: number, itemId: number, newQuantity: number): Order {
    const cart = this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (item && item.status === 'reserved' && newQuantity > 0) {
      item.quantity = newQuantity;
      this.saveCart(cart);
    }
    return cart;
  }

  static updateStatus(userId: number, itemId: number, status: OrderStatus): Order {
    const cart = this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (item) {
      item.status = status;
      this.saveCart(cart);
    }
    return cart;
  }

  static removeItem(userId: number, itemId: number): Order {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter((item) => item.id !== itemId);
    this.saveCart(cart);
    return cart;
  }

  static rateItem(userId: number, itemId: number, rating: number): Order {
    const cart = this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (item && item.status.toLowerCase() === 'delivered') {
      item.userRating = rating;
      this.saveCart(cart);
    }
    return cart;
  }

  
  static userHasDeliveredPlant(userId: number, plantId: number): boolean {
    const cart = this.getCart(userId);
    if (!cart || !cart.items) return false;

    return cart.items.some(
      (item) =>
        (item.plantId === plantId || item.plant?.id === plantId) &&
        item.status.toLowerCase() === 'delivered'
    );
  }

  private static calculateTotal(items: OrderItem[]): number {
    return items
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + item.plant.price * item.quantity, 0);
  }
}