<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Plant } from '../models/plant.model';
import { WishlistService } from '../services/whishlist.service';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';

const router = useRouter();
const wishlistPlants = ref<Plant[]>([]);
const notification = ref('');

const loadWishlist = () => {
  const user = UserService.getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }
  wishlistPlants.value = WishlistService.getWishlist(user.id);
};

onMounted(() => {
  loadWishlist();
});


const handleReserve = (plant: Plant) => {
  const user = UserService.getCurrentUser();
  if (!user) return;

  OrderService.addToCart(user.id, plant, 1);
  notification.value = `Rezervisano: ${plant.name}! Dodato u korpu.`;
  setTimeout(() => (notification.value = ''), 3000);
};


const handleRemove = (plantId: number) => {
  const user = UserService.getCurrentUser();
  if (!user) return;

  wishlistPlants.value = WishlistService.removeFromWishlist(user.id, plantId);
  notification.value = 'Biljka je uklonjena iz liste želja.';
  setTimeout(() => (notification.value = ''), 3000);
};

const viewDetails = (id: number) => {
  router.push(`/plant/${id}`);
};
</script>

<template>
  <div class="wishlist-container">
    <div v-if="notification" class="toast-notification">
      {{ notification }}
    </div>

    <div class="header-box">
      <div class="page-header">
      <h2><i class="fa-solid fa-heart text-danger"></i> Moja Lista Želja</h2>
      <p>Biljke koje ste sačuvali za kasniju kupovinu ili rezervaciju.</p>
      </div>
    </div>

   
    <div v-if="wishlistPlants.length === 0" class="empty-wishlist-container">
      <div class="empty-icon-wrapper">
        <i class="fa-solid fa-heart empty-wishlist-icon"></i>
      </div>
      <h2>Vaša lista želja je prazna</h2>
      <p>Nemate sačuvanih biljaka. Dodajte omiljene biljke kako biste ih lakše pronašli kasnije!</p>
      <router-link to="/" class="btn-browse">
        <i class="fa-solid fa-leaf"></i> Istraži biljke
      </router-link>
    </div>


    
    <div v-else class="plants-grid">
      <div v-for="plant in wishlistPlants" :key="plant.id" class="info-card">
        <div class="card-image-wrapper">
          <img :src="plant.imageUrl" :alt="plant.name" class="card-img" />
          <button @click="handleRemove(plant.id)" class="btn-remove-wishlist" title="Ukloni iz liste želja">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>

        <div class="card-body">
          <h3 class="card-title">{{ plant.name }}</h3>
          <p v-if="plant.latinName" class="card-latin"><i>{{ plant.latinName }}</i></p>
          <p class="card-desc">{{ plant.description }}</p>

          <div class="card-footer">
            <div class="price-tag">{{ plant.price }} RSD</div>
            <div class="btn-group">
              <button @click="viewDetails(plant.id)" class="btn-secondary">Detalji</button>
              <button @click="handleReserve(plant)" class="btn-primary">
                <i class="fa-solid fa-cart-shopping"></i> Rezerviši
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wishlist-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}


.page-header {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
}

.page-header h2 {
  color: #B7D894;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}


.empty-wishlist-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 70px;
  height: 70px;
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-wishlist-icon {
  font-size: 1.8rem;
  color: #a0aec0;
  opacity: 0.7;
}

.empty-wishlist-container h2 {
  color: #E0F8C7;
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.empty-wishlist-container p {
  color: #a0aec0;
  font-size: 0.88rem;
  max-width: 360px;
  margin-bottom: 20px;
  line-height: 1.4;
}

.btn-browse {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #B7D894;
  color: #181d27;
  padding: 9px 18px;
  font-size: 0.88rem;
  border-radius: 6px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-browse:hover {
  background-color: #E0F8C7;
  transform: translateY(-2px);
}


.plants-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.info-card {
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #181d27;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-wishlist {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(32, 39, 52, 0.85);
  color: #e53e3e;
  border: 1px solid #36415A;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-wishlist:hover {
  background-color: #e53e3e;
  color: #fff;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  color: #E0F8C7;
  font-size: 1.1rem;
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
  margin-bottom: 16px;
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
  font-size: 1.1rem;
  font-weight: bold;
  color: #E0F8C7;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn-secondary {
  background-color: #36415A;
  color: #E0F8C7;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
}

.btn-primary {
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #E0F8C7;
}


@media (max-width: 900px) {
  .plants-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .plants-grid {
    grid-template-columns: 1fr;
  }
}
</style>
