import type { Plant } from '../models/plant.model';

const WISHLIST_KEY = 'plant_shop_wishlist';

export class WishlistService {
  
  static getWishlist(userId: number): Plant[] {
    try {
      const data = localStorage.getItem(`${WISHLIST_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

 
  static isInWishlist(userId: number, plantId: number): boolean {
    const list = this.getWishlist(userId);
    return list.some((p) => p.id === plantId);
  }

  
  static toggleWishlist(userId: number, plant: Plant): Plant[] {
    let list = this.getWishlist(userId);
    const index = list.findIndex((p) => p.id === plant.id);

    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(plant); 
    }

    localStorage.setItem(`${WISHLIST_KEY}_${userId}`, JSON.stringify(list));
    return list;
  }

  
  static removeFromWishlist(userId: number, plantId: number): Plant[] {
    let list = this.getWishlist(userId);
    list = list.filter((p) => p.id !== plantId);
    localStorage.setItem(`${WISHLIST_KEY}_${userId}`, JSON.stringify(list));
    return list;
  }
}