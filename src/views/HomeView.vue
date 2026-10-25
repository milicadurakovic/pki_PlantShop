<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Plant } from '../models/plant.model';
import { PlantService } from '../services/plant.service';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';
import { WishlistService } from '../services/whishlist.service';

const router = useRouter();
const plants = ref<Plant[]>([]);
const loading = ref(true);
const notification = ref('');


const availableTargetGroups = [
  'Početnike ',
  'Dom i porodicu ',
  'Poslovni prostor ',
  'Iskusne uzgajivače ',
  'Sve uzgajivače '
];

const searchName = ref('');
const maxPrice = ref<number | null>(null);
const searchType = ref('');
const searchSeason = ref('');
const selectedTargetGroups = ref<string[]>([]);
const searchDate = ref('');
const minRating = ref<number>(0);

const loadPlants = async () => {
  loading.value = true;
  plants.value = await PlantService.getAllPlants();
  loading.value = false;
};
/*const loadPlants = async () => {
  loading.value = true;
  try {
    const data = await PlantService.getAllPlants();
    plants.value = data || [];
  } catch (error) {
    console.error('Greška pri učitavanju:', error);
  } finally {
    loading.value = false;
  }
};*/

onMounted(() => {
  loadPlants();
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'Nije navedeno';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}.`;
};

const formatTargetGroup = (targetGroup: string) => {
  if (!targetGroup) return 'Za sve uzgajivače';
  const tg = targetGroup.toLowerCase();
  
  if (tg.includes('početnik') || tg.includes('pocetnik') || tg.includes('hobist')) return 'Za početnike i hobiste';
  if (tg.includes('porodic') || tg.includes('deca') || tg.includes('ljubitelj')) return 'Za dom i porodicu';
  if (tg.includes('kancelarij') || tg.includes('poslovni')) return 'Za poslovni prostor';
  if (tg.includes('iskusni') || tg.includes('iskusne')) return 'Za iskusne uzgajivače';
  
  return 'Za sve uzgajivače';
};

const getAverageRating = (plant: Plant) => {
  if (!plant.reviews || plant.reviews.length === 0) return 0;
  const sum = plant.reviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
  return sum / plant.reviews.length;
};

const isWishlisted = (plantId: number) => {
  const user = UserService.getCurrentUser();
  return user ? WishlistService.isInWishlist(user.id, plantId) : false;
};

const toggleWishlist = (plant: Plant, event: Event) => {
  event.stopPropagation();
  const user = UserService.getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }
  
  WishlistService.toggleWishlist(user.id, plant);
  notification.value = isWishlisted(plant.id) 
    ? `Dodato u listu želja: ${plant.name} ❤️` 
    : `Uklonjeno iz liste želja: ${plant.name}`;
  setTimeout(() => (notification.value = ''), 3000);
};

const matchesTargetGroup = (plant: Plant, selectedOption: string) => {
  const target = (plant.targetGroup || '').toLowerCase();
  const name = (plant.name || '').toLowerCase();
  const desc = (plant.description || '').toLowerCase();
  const type = (plant.type || '').toLowerCase();
  const option = selectedOption.toLowerCase();

  const fullText = `${target} ${name} ${desc} ${type}`;

  
  const isForExperiencedOnly = target.includes('iskusn') || desc.includes('zahtevn') || desc.includes('egzotič');

  
  if (option.includes('početn') || option.includes('pocetn') || option.includes('hobist')) {
    if (isForExperiencedOnly) return false;
    return (
      target.includes('početn') ||
      target.includes('pocetn') ||
      target.includes('hobist') ||
      desc.includes('početn') ||
      desc.includes('pocetn') ||
      desc.includes('hobist') ||
      desc.includes('lako') ||
      desc.includes('otporn') ||
      desc.includes('skromn') ||
      desc.includes('jednostavn')
    );
  }

  
  if (option.includes('porodic') || option.includes('dom') || option.includes('deca')) {
    if (isForExperiencedOnly) return false;
    return (
      target.includes('porodic') ||
      target.includes('deca') ||
      target.includes('dom') ||
      desc.includes('netoksič') ||
      desc.includes('sigurno za decu') ||
      desc.includes('porodic') ||
      desc.includes('deca')
    );
  }

  
  if (option.includes('poslovni') || option.includes('kancelarij')) {
    return (
      target.includes('kancelarij') ||
      target.includes('poslovni') ||
      desc.includes('kancelarij') ||
      desc.includes('radni sto') ||
      desc.includes('enterijer')
    );
  }

 
  if (option.includes('iskusne') || option.includes('iskusni')) {
    return (
      target.includes('iskusn') ||
      desc.includes('iskusn') ||
      desc.includes('zahtevn') ||
      desc.includes('egzotič') ||
      desc.includes('orhidej') ||
      desc.includes('bonsai')
    );
  }

  
  if (option.includes('sve') || option.includes('svi')) {
    return true;
  }

  return fullText.includes(option);
};
const filteredPlants = computed(() => {
  return plants.value.filter((plant) => {
    const nameMatches = !searchName.value || 
      plant.name.toLowerCase().includes(searchName.value.toLowerCase()) ||
      (plant.latinName && plant.latinName.toLowerCase().includes(searchName.value.toLowerCase()));

    const priceMatches = maxPrice.value === null || maxPrice.value === undefined || maxPrice.value === 0 || plant.price <= maxPrice.value;

    const typeMatches = !searchType.value || 
      plant.type.toLowerCase().includes(searchType.value.toLowerCase()) ||
      (plant.category && plant.category.toLowerCase().includes(searchType.value.toLowerCase()));

    const seasonMatches = !searchSeason.value || 
      (plant.season && plant.season.toLowerCase().includes(searchSeason.value.toLowerCase()));

    const targetMatches = selectedTargetGroups.value.length === 0 || 
      selectedTargetGroups.value.some((selectedGroup) => 
        matchesTargetGroup(plant, selectedGroup)
      );

    const dateMatches = !searchDate.value || plant.productionDate >= searchDate.value;

    const avgRating = getAverageRating(plant);
    const ratingMatches = minRating.value === 0 || avgRating >= minRating.value;

    return nameMatches && priceMatches && typeMatches && seasonMatches && targetMatches && dateMatches && ratingMatches;
  });
});

const handleReserve = (plant: Plant) => {
  const user = UserService.getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }
  OrderService.addToCart(user.id, plant, 1);
  notification.value = `Rezervisano: ${plant.name}! Dodato u korpu.`;
  setTimeout(() => (notification.value = ''), 3000);
};

const viewDetails = (id: number) => {
  router.push(`/plant/${id}`);
};

const resetFilters = () => {
  searchName.value = '';
  maxPrice.value = null;
  searchType.value = '';
  searchSeason.value = '';
  selectedTargetGroups.value = [];
  searchDate.value = '';
  minRating.value = 0;
};
</script>
<template>
  <div class="home-container">
    <div v-if="notification" class="toast-notification">
      {{ notification }}
    </div>

    
    <aside class="filters-sidebar">
      <div class="sidebar-header">
        <h3>Pretraži katalog</h3>
        <button @click="resetFilters" class="btn-reset">Poništi</button>
      </div>

      
      <div class="filter-group">
        <label>Naziv biljke</label>
        <input v-model="searchName" type="text" placeholder="Ruža, Rosa..." />
      </div>

      
      <div class="filter-group">
        <label>Maksimalna cena</label>
        <input v-model.number="maxPrice" type="number" placeholder="Npr. 1500" />
      </div>

      
      <div class="filter-group">
        <label>Minimalna ocena</label>
        <select v-model.number="minRating">
          <option :value="0">Sve ocene</option>
          <option :value="3">⭐ 3+ </option>
          <option :value="4">⭐ 4+ </option>
          <option :value="5">⭐ 5 </option>
        </select>
      </div>

      
      <div class="filter-group">
        <label class="group-label">Idealna biljka za:</label>
        <div class="checkbox-group">
          <label v-for="groupOption in availableTargetGroups" :key="groupOption" class="checkbox-item">
            <input 
              type="checkbox" 
              :value="groupOption" 
              v-model="selectedTargetGroups" 
            />
            <span>{{ groupOption }}</span>
          </label>
        </div>
      </div>

      
      <div class="filter-group">
        <label>Tip biljke</label>
        <input v-model="searchType" type="text" placeholder="Sadnica, Seme, Saksijska..." />
      </div>

      
      <div class="filter-group">
        <label>Sezona</label>
        <input v-model="searchSeason" type="text" placeholder="Proleće, Leto, Zima..." />
      </div>

     
      <div class="filter-group">
        <label>Datum proizvodnje nakon</label>
        <input v-model="searchDate" type="date" class="date-picker-input" />
      </div>
    </aside>

    
    <main class="plants-grid-wrapper">
      <div class="catalog-header">
        <h2 style="color: #B7D894;">Biljni kutak 🪴 </h2>
        <span class="count-badge">{{ filteredPlants.length }} biljaka</span>
      </div>

      <div v-if="loading" class="loading-state">
        <p>Učitavanje kataloga...</p>
      </div>

      <div v-else-if="filteredPlants.length === 0" class="empty-state">
        <p>Nema biljaka koje odgovaraju zadatim kriterijumima.</p>
        <button @click="resetFilters" class="btn-primary">Prikaži sve biljke</button>
      </div>

      <div v-else class="plants-grid">
        <div v-for="plant in filteredPlants" :key="plant.id" class="info-card">
          <div class="card-image-wrapper">
            <img :src="plant.imageUrl" :alt="plant.name" class="card-img" />
            <span class="type-tag">{{ plant.type }}</span>

           
            <button 
              @click="toggleWishlist(plant, $event)" 
              class="btn-card-wishlist" 
              :class="{ 'active': isWishlisted(plant.id) }"
              title="Dodaj u listu želja"
            >
              <i :class="isWishlisted(plant.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            </button>
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ plant.name }}</h3>
            <p v-if="plant.latinName" class="card-latin"><i>{{ plant.latinName }}</i></p>
            

            <div class="card-meta">
              
              <span><i class="fa-solid fa-crosshairs"></i> {{ plant.targetGroup || 'Svi uzgajivači' }}</span>
              <span><i class="fa-regular fa-calendar-days"></i> {{ formatDate(plant.productionDate) }}</span>
              
            </div>

            
            <div class="card-rating">
              <template v-if="getAverageRating(plant) > 0">
                ⭐ {{ getAverageRating(plant).toFixed(1) }} / 5.0 ({{ plant.reviews?.length }})
              </template>
              <template v-else>
                ⭐ Nema ocena
              </template>
            </div>

            <div class="card-footer">
              <div class="price-tag">{{ plant.price }} RSD</div>
              <div class="btn-group">
                <button @click="viewDetails(plant.id)" class="btn-secondary">Detalji</button>
                <button @click="handleReserve(plant)" class="btn-primary">Rezerviši</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  background-color: #B7D894;
  color: #202734;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  z-index: 1000;
}

.filters-sidebar {
  width: 260px;
  background-color: #202734;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #36415A;
  height: fit-content;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sidebar-header h3 {
  color: #B7D894;
  font-size: 1.1rem;
  margin: 0;
}

.btn-reset {
  background: none;
  border: 1px solid #36415A;
  color: #B7D894;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-reset:hover {
  background-color: #36415A;
  color: #E0F8C7;
}

.filter-group {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
}

.filter-group label,
.group-label {
  font-size: 0.75rem;
  margin-bottom: 4px;
  color: #E0F8C7;
  font-weight: 500;
}

.filter-group input[type="text"],
.filter-group input[type="number"],
.filter-group input[type="date"],
.filter-group select {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #36415A;
  background-color: #181d27;
  color: #E0F8C7;
  font-size: 0.85rem;
}

.date-picker-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: #181d27;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #36415A;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #a0aec0;
  cursor: pointer;
  user-select: none;
}

.checkbox-item input[type="checkbox"] {
  accent-color: #B7D894;
  cursor: pointer;
  width: 14px;
  height: 14px;
}

.checkbox-item:hover {
  color: #E0F8C7;
}

.plants-grid-wrapper {
  flex: 1;
}

.catalog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.count-badge {
  background-color: #36415A;
  color: #B7D894;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
}

.loading-state, .empty-state {
  color: #B7D894;
  font-size: 1.1rem;
  padding: 40px;
  text-align: center;
}

.empty-state p {
  margin-bottom: 16px;
  color: #a0aec0;
}

.plants-grid-wrapper .plants-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.info-card {
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 0;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 210px;
  background-color: #181d27;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.btn-card-wishlist {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(32, 39, 52, 0.85);
  color: #a0aec0;
  border: 1px solid #36415A;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.btn-card-wishlist:hover {
  transform: scale(1.1);
  color: #e53e3e;
}

.btn-card-wishlist.active {
  color: #e53e3e;
  border-color: #e53e3e;
  background-color: rgba(229, 62, 62, 0.15);
}

.type-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(32, 39, 52, 0.85);
  color: #B7D894;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  backdrop-filter: blur(4px);
  border: 1px solid #36415A;
}

.card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  color: #E0F8C7;
  font-size: 1.05rem;
  margin-bottom: 2px;
}

.card-latin {
  font-size: 0.8rem;
  color: #B7D894;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 0.85rem;
  color: #a0aec0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 8px;
}

.card-rating {
  font-size: 0.85rem;
  font-weight: bold;
  color: #B7D894;
  margin-bottom: 14px;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #36415A;
}

.price-tag {
  font-size: 1rem;
  font-weight: bold;
  color: #E0F8C7;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.btn-secondary {
  background-color: #36415A;
  color: #E0F8C7;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-secondary:hover {
  background-color: #4a5878;
}

.btn-primary {
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-primary:hover {
  background-color: #E0F8C7;
}

@media (max-width: 1024px) {
  .plants-grid-wrapper .plants-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-container {
    flex-direction: column;
  }
  .filters-sidebar {
    width: 100%;
  }
  .plants-grid-wrapper .plants-grid {
    grid-template-columns: 1fr;
  }
}
</style>