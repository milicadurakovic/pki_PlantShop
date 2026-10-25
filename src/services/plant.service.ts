import type { Plant, Review } from '../models/plant.model';

const BASE_URL = 'https://plants.pequla.com/api';
const LOCAL_REVIEWS_KEY = 'plant_shop_local_reviews';

export class PlantService {
  
  private static getLocalReviews(plantId: number): Review[] {
    try {
      const data = localStorage.getItem(`${LOCAL_REVIEWS_KEY}_${plantId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

 
  private static saveLocalReview(plantId: number, review: Review) {
    const existing = this.getLocalReviews(plantId);
    existing.push(review);
    localStorage.setItem(`${LOCAL_REVIEWS_KEY}_${plantId}`, JSON.stringify(existing));
  }

  
  static async getAllPlants(): Promise<Plant[]> {
    try {
      const catRes = await fetch(`${BASE_URL}/categories`);
      let categories: any[] = [];
      if (catRes.ok) {
        categories = await catRes.json();
      }

      const allRawPlants: any[] = [];

      if (Array.isArray(categories) && categories.length > 0) {
        for (const cat of categories) {
          try {
            const pRes = await fetch(`${BASE_URL}/categories/${cat.id}/plants`);
            if (pRes.ok) {
              const pData = await pRes.json();
              const list = Array.isArray(pData) ? pData : (pData.content || []);
              allRawPlants.push(...list);
            }
          } catch (err) {
            console.warn(`Greska za kat ${cat.id}:`, err);
          }
        }
      }

      if (allRawPlants.length === 0) {
        const directRes = await fetch(`${BASE_URL}/plants`);
        if (directRes.ok) {
          const directData = await directRes.json();
          const list = Array.isArray(directData) ? directData : (directData.content || []);
          allRawPlants.push(...list);
        }
      }

      const uniquePlantsMap = new Map();
      allRawPlants.forEach(item => {
        if (item && item.id) {
          uniquePlantsMap.set(item.id, item);
        }
      });

      const uniqueRawList = Array.from(uniquePlantsMap.values());
      return await this.mapPlantDataWithReviews(uniqueRawList);
    } catch (error) {
      console.error('Error fetching all plants:', error);
      return [];
    }
  }

  private static async mapPlantDataWithReviews(rawList: any[]): Promise<Plant[]> {
    const mappedPlants: Plant[] = [];

    for (const item of rawList) {
      let apiReviews: Review[] = [];
      try {
        const revRes = await fetch(`${BASE_URL}/review/plant/${item.id}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          apiReviews = Array.isArray(revData) ? revData : [];
        }
      } catch (e) {
        apiReviews = item.reviews || [];
      }

      
      const localReviews = this.getLocalReviews(item.id);
      const allReviews = [...apiReviews, ...localReviews];

      const fullDescription = [
        item.description,
        item.planting_instructions ? `Sadnja: ${item.planting_instructions}` : '',
        item.care_instructions ? `Nega: ${item.care_instructions}` : ''
      ].filter(Boolean).join('\n\n');

      mappedPlants.push({
        id: item.id,
        name: item.name || 'Nepoznata biljka',
        latinName: item.latin_name || '',
        description: fullDescription || 'Nema detaljnog opisa.',
        plantingInstructions: item.planting_instructions || '',
        careInstructions: item.care_instructions || '',
        type: item.plant_type || item.category || 'Sadnica',
        targetGroup: item.target_audience || 'Svi uzgajivači',
        lightRequirement: item.light_requirement || '',
        watering: item.watering || '',
        intendedUse: item.intended_use || '',
        productionDate: item.production_date || '2026-01-01',
        price: Number(item.price) || 0,
        currency: item.currency || 'RSD',
        imageUrl: item.image_url || `https://plants.pequla.com/images/biljka-${String(item.id).padStart(3, '0')}.svg`,
        imageAlt: item.image_alt || '',
        isAvailable: item.is_available ?? true,
        stockQuantity: item.stock_quantity || 0,
        category: item.category || '',
        climate: item.climate || '',
        season: item.season || '',
        reviews: allReviews
      });
    }

    return mappedPlants;
  }

  static async getPlantById(id: number): Promise<Plant | null> {
    const all = await this.getAllPlants();
    return all.find((p) => p.id === id) || null;
  }

  static async getPlantReviews(plantId: number): Promise<Review[]> {
    try {
      const response = await fetch(`${BASE_URL}/review/plant/${plantId}`);
      let apiReviews: Review[] = [];
      if (response.ok) {
        const data = await response.json();
        apiReviews = Array.isArray(data) ? data : [];
      }
      const localReviews = this.getLocalReviews(plantId);
      return [...apiReviews, ...localReviews];
    } catch {
      return this.getLocalReviews(plantId);
    }
  }

  
  static async addReview(plantId: number, reviewData: { rating: number; comment: string; reviewer?: string }): Promise<boolean> {
    const newReview: Review = {
      id: Date.now(),
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      reviewer: reviewData.reviewer || 'Korisnik',
      createdAt: new Date().toISOString()
    } as any;

    
    this.saveLocalReview(plantId, newReview);

    
    try {
      await fetch(`${BASE_URL}/review/plant/${plantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
    } catch (e) {
      console.warn('API dodavanje nije uspelo, sačuvano lokalno:', e);
    }

    return true;
  }
}