export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Plant {
  id: number;
  name: string;
  latinName?: string;
  description: string;
  plantingInstructions?: string;
  careInstructions?: string;
  type: string; 
  targetGroup: string; 
  lightRequirement?: string;
  watering?: string;
  intendedUse?: string;
  productionDate: string;
  price: number;
  currency: string;
  imageUrl: string;
  imageAlt?: string;
  isAvailable?: boolean;
  stockQuantity?: number;
  category?: string;
  climate?: string;
  season?: string;
  reviews?: Review[];
}