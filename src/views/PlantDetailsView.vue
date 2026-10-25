<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Plant } from '../models/plant.model';
import { PlantService } from '../services/plant.service';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';
import { WishlistService } from '../services/whishlist.service';

const route = useRoute();
const router = useRouter();

const plant = ref<Plant | null>(null);
const loading = ref(true);
const notification = ref('');


const canLeaveReview = ref(false);
const isWishlisted = ref(false);
const newRating = ref(5);
const newComment = ref('');
const averageRating = ref(0);


const formattedDescription = computed(() => {
  if (!plant.value || !plant.value.description) return '';
  
  let desc = plant.value.description;

  
  if (!desc.includes('🌱 Sadnja:')) {
    desc = desc.replace(/Sadnja:/g, '\n\n🌱 Sadnja:');
  }
  if (!desc.includes('☀️ Nega:')) {
    desc = desc.replace(/Nega:/g, '\n☀️ Nega:');
  }

  return desc.trim();
});

const calculateAverageRating = () => {
  if (!plant.value || !plant.value.reviews || plant.value.reviews.length === 0) {
    averageRating.value = 0;
    return;
  }
  const sum = plant.value.reviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
  averageRating.value = sum / plant.value.reviews.length;
};

const checkReviewEligibility = () => {
  const currentUser = UserService.getCurrentUser();
  if (currentUser && plant.value) {
    canLeaveReview.value = OrderService.userHasDeliveredPlant(currentUser.id, plant.value.id);
  } else {
    canLeaveReview.value = false;
  }
};

const checkWishlistStatus = () => {
  const currentUser = UserService.getCurrentUser();
  if (currentUser && plant.value) {
    isWishlisted.value = WishlistService.isInWishlist(currentUser.id, plant.value.id);
  } else {
    isWishlisted.value = false;
  }
};

const loadPlantDetails = async () => {
  loading.value = true;
  const id = Number(route.params.id);
  const fetchedPlant = await PlantService.getPlantById(id);
  
  if (fetchedPlant) {
    plant.value = fetchedPlant;
    calculateAverageRating();
    checkReviewEligibility();
    checkWishlistStatus();
  }
  loading.value = false;
};

onMounted(() => {
  loadPlantDetails();
});

const toggleWishlist = () => {
  if (!plant.value) return;
  const currentUser = UserService.getCurrentUser();
  if (!currentUser) {
    router.push('/login');
    return;
  }

  WishlistService.toggleWishlist(currentUser.id, plant.value);
  isWishlisted.value = !isWishlisted.value;
  
  notification.value = isWishlisted.value 
    ? `Dodato u listu želja ❤️` 
    : `Uklonjeno iz liste želja 💔`;
  setTimeout(() => (notification.value = ''), 3000);
};

const submitReview = async () => {
  if (!plant.value || !canLeaveReview.value) return;

  const currentUser = UserService.getCurrentUser();
  const reviewerName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim() 
    : 'Korisnik';

  await PlantService.addReview(plant.value.id, {
    rating: newRating.value,
    comment: newComment.value,
    reviewer: reviewerName
  });

  plant.value.reviews = await PlantService.getPlantReviews(plant.value.id);
  calculateAverageRating();

  newComment.value = '';
  newRating.value = 5;
  notification.value = 'Hvala na recenziji! Vaša ocena je sačuvana.';
  setTimeout(() => (notification.value = ''), 3000);
};

const handleReserve = () => {
  if (!plant.value) return;
  const user = UserService.getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }

  OrderService.addToCart(user.id, plant.value, 1);
  notification.value = `Uspešno dodato u korpu: ${plant.value.name}!`;
  setTimeout(() => (notification.value = ''), 3000);
};

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div class="details-container">
    <div v-if="notification" class="toast-notification">
      {{ notification }}
    </div>

    <button @click="goBack" class="btn-back">
      <i class="fa-solid fa-arrow-left"></i> Nazad na katalog
    </button>

    <div v-if="loading" class="loading-state">
      Učitavanje detalja biljke...
    </div>

    <div v-else-if="!plant" class="empty-state">
      Biljka nije pronađena.
    </div>

    <div v-else class="plant-details-wrapper">
      
      <div class="main-info-card">
        <div class="image-box">
          <img :src="plant.imageUrl" :alt="plant.name" class="plant-img" />
          <span class="type-tag">{{ plant.type }}</span>
        </div>

        <div class="content-box">
          <h1 class="plant-title">{{ plant.name }}</h1>
          <p v-if="plant.latinName" class="plant-latin"><i>{{ plant.latinName }}</i></p>

          <div class="rating-badge">
            <template v-if="averageRating > 0">
              ⭐ {{ averageRating.toFixed(1) }} (Ukupno {{ plant.reviews?.length }} recenzija)
            </template>
            <template v-else>
              ⭐ Nema ocena – budite prvi koji će oceniti!
            </template>
          </div>

          
          <p class="plant-desc">{{ formattedDescription }}</p>

          <div class="specs-grid">
            <div class="spec-item">
              <strong>Sezona:</strong> {{ plant.season || 'Sve sezone' }}
            </div>
            <div class="spec-item">
              <strong>Idealna za:</strong> {{ plant.targetGroup || 'Svi uzgajivači' }}
            </div>
            <div class="spec-item">
              <strong>Datum proizvodnje:</strong> {{ plant.productionDate }}
            </div>
            <div class="spec-item">
              <strong>Dostupnost:</strong> {{ plant.isAvailable ? 'Na stanju' : 'Rasprodato' }}
            </div>
          </div>

          <div class="purchase-box">
            <div class="price-display">{{ plant.price }} RSD</div>
            
            <div class="purchase-btn-group">
              
              <button 
                @click="toggleWishlist" 
                class="btn-detail-wishlist" 
                :class="{ 'active': isWishlisted }"
                :title="isWishlisted ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'"
              >
                <i :class="isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
              </button>

              
              <button @click="handleReserve" class="btn-primary-reserve">
                <i class="fa-solid fa-cart-shopping"></i> Dodaj u korpu
              </button>
            </div>
          </div>
        </div>
      </div>

      
      <section class="section-box">
        <h2>Recenzije kupaca</h2>

        <div v-if="canLeaveReview" class="add-review-box">
          <h3><i class="fa-solid fa-circle-check text-success"></i> Potvrđena kupovina! Ostavi svoju ocenu: </h3>
          <form @submit.prevent="submitReview" class="review-form">
            <div class="form-group">
              <label>Tvoja ocena: </label>
              <select v-model.number="newRating" required class="rating-select">
                <option :value="5">5.0⭐</option>
                <option :value="4">4.0⭐</option>
                <option :value="3">3.0⭐</option>
                <option :value="2">2.0⭐</option>
                <option :value="1">1.0⭐</option>
              </select>
            </div>

            <div class="form-group">
              <label>Komentar:</label>
              <textarea 
                v-model="newComment" 
                placeholder="Napišite vaše utiske o biljci..." 
                rows="3" 
                required
              ></textarea>
            </div>

            <button type="submit" class="btn-submit-review">
              <i class="fa-solid fa-star"></i> Pošalji recenziju
            </button>
          </form>
        </div>

        <div v-else class="review-restricted-notice">
          <i class="fa-solid fa-lock"></i>
          <span>Recenziju mogu ostaviti samo korisnici koji su kupili ovu biljku i čiji je status pošiljke <strong>DELIVERED (Dostavljeno)</strong>.</span>
        </div>

        <hr class="divider" />

        <div v-if="!plant.reviews || plant.reviews.length === 0" class="no-reviews">
          Još uvek nema recenzija za ovu biljku.
        </div>

        <div v-else class="reviews-list">
          <div v-for="(rev, index) in plant.reviews" :key="rev.id || index" class="review-card">
            <div class="rev-header">
              <strong>👤 {{ rev.userName || 'Korisnik' }} <span class="verified-badge">✓ Potvrđena kupovina</span></strong>
              <span class="stars">⭐ {{ rev.rating }} / 5</span>
            </div>
            <p class="rev-comment">{{ rev.comment || 'Nema teksta recenzije.' }}</p>
            <span v-if="rev.createdAt" class="rev-date">
              📅 {{ new Date(rev.createdAt).toLocaleDateString('sr-RS') }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.details-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
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

.btn-back {
  background: none;
  border: 1px solid #36415A;
  color: #B7D894;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-back:hover {
  background-color: #36415A;
  color: #E0F8C7;
}

.loading-state, .empty-state {
  color: #B7D894;
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.main-info-card {
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 12px;
  display: flex;
  gap: 24px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.image-box {
  position: relative;
  width: 320px;
  height: 320px;
  background-color: #181d27;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.plant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.type-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(32, 39, 52, 0.85);
  color: #B7D894;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  border: 1px solid #36415A;
}

.content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.plant-title {
  color: #E0F8C7;
  font-size: 1.8rem;
  margin: 0 0 4px 0;
}

.plant-latin {
  color: #B7D894;
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.rating-badge {
  background-color: #181d27;
  color: #B7D894;
  border: 1px solid #36415A;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.88rem;
  width: fit-content;
  margin-bottom: 16px;
}

.plant-desc {
  color: #a0aec0;
  font-size: 0.92rem;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-line; 
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  background-color: #181d27;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #36415A;
  font-size: 0.85rem;
  color: #a0aec0;
  margin-bottom: 20px;
}

.specs-grid strong {
  color: #E0F8C7;
}

.purchase-box {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #36415A;
}

.price-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #E0F8C7;
}

.purchase-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-detail-wishlist {
  background-color: #181d27;
  color: #a0aec0;
  border: 1px solid #36415A;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.btn-detail-wishlist:hover {
  border-color: #e53e3e;
  color: #e53e3e;
  transform: translateY(-1px);
}

.btn-detail-wishlist.active {
  color: #e53e3e;
  border-color: #e53e3e;
  background-color: rgba(229, 62, 62, 0.15);
}

.btn-primary-reserve {
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-primary-reserve:hover {
  background-color: #E0F8C7;
}

.section-box {
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.section-box h2 {
  color: #B7D894;
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 16px;
}

.add-review-box {
  background-color: #181d27;
  border: 1px solid #36415A;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.add-review-box h3 {
  color: #E0F8C7;
  font-size: 0.95rem;
  margin-top: 0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-success {
  color: #B7D894;
}

.review-restricted-notice {
  background-color: #181d27;
  border: 1px dashed #36415A;
  color: #a0aec0;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.review-restricted-notice i {
  color: #B7D894;
  font-size: 1.1rem;
}

.review-form .form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.review-form label {
  font-size: 0.8rem;
  color: #E0F8C7;
  margin-bottom: 4px;
}

.rating-select,
.review-form textarea {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #36415A;
  background-color: #202734;
  color: #E0F8C7;
  font-size: 0.88rem;
}

.btn-submit-review {
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 9px 16px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-submit-review:hover {
  background-color: #E0F8C7;
}

.divider {
  border: 0;
  border-top: 1px solid #36415A;
  margin: 20px 0;
}

.no-reviews {
  color: #a0aec0;
  font-style: italic;
  font-size: 0.9rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  background-color: #181d27;
  border: 1px solid #36415A;
  padding: 12px 16px;
  border-radius: 8px;
}

.rev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.rev-header strong {
  color: #E0F8C7;
  font-size: 0.9rem;
}

.verified-badge {
  font-size: 0.72rem;
  color: #B7D894;
  font-weight: normal;
  margin-left: 6px;
}

.stars {
  color: #B7D894;
  font-weight: bold;
  font-size: 0.85rem;
}

.rev-comment {
  color: #a0aec0;
  font-size: 0.88rem;
  margin: 0 0 6px 0;
}

.rev-date {
  font-size: 0.75rem;
  color: #718096;
}
</style>