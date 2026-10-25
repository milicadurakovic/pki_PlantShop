<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Order, OrderStatus } from '../models/order.model';
import { OrderService } from '../services/order.service';
import { UserService } from '../services/user.service';

const cart = ref<Order | null>(null);
const user = UserService.getCurrentUser();

const loadCart = () => {
  if (user) {
    cart.value = OrderService.getCart(user.id);
  }
};

onMounted(() => {
  loadCart();
});

const updateQty = (itemId: number, newQty: number) => {
  if (!user) return;
  cart.value = OrderService.updateQuantity(user.id, itemId, newQty);
};

const updateStatus = (itemId: number, status: OrderStatus) => {
  if (!user) return;
  cart.value = OrderService.updateStatus(user.id, itemId, status);
};

const deleteItem = (itemId: number) => {
  if (!user) return;
  cart.value = OrderService.removeItem(user.id, itemId);
};

const rateItem = (itemId: number, rating: number) => {
  if (!user) return;
  cart.value = OrderService.rateItem(user.id, itemId, rating);
};
</script>

<template>
  <div class="cart-container" v-if="cart">
    <h2>Moja korpa</h2>

    <div v-if="cart.items.length === 0" class="empty-cart-container">
      <div class="empty-icon-wrapper">
        <i class="fa-solid fa-cart-shopping empty-cart-icon"></i>
      </div>
      <h2>Vaša korpa je prazna</h2>
      <p>Izgleda da još uvek niste dodali nijednu biljku u korpu.</p>
      <router-link to="/" class="btn-browse">
        <i class="fa-solid fa-leaf"></i> Pregledaj katalog
      </router-link>
    </div>

    <div v-else>
      <div class="items-list">
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          
          <div class="img-wrapper">
            <img :src="item.plant.imageUrl || 'https://via.placeholder.com/75'" :alt="item.plant.name"
              class="item-img" />
          </div>

          <div class="item-details">
            <h4>{{ item.plant.name }}</h4>
            <p class="type">{{ item.plant.type }}</p>
            <p class="price-unit">{{ item.plant.price }} RSD / kom</p>

            <div class="status-tag" :class="item.status">
              Status: {{ item.status }}
            </div>
          </div>

          
          <div class="item-actions">
            <div v-if="item.status === 'reserved'" class="qty-controls">
              <label>Količina:</label>
              <input type="number" min="1" :value="item.quantity"
                @change="updateQty(item.id, Number(($event.target as HTMLInputElement).value))" />
            </div>

            <div class="status-change">
              <label>Promeni status:</label>
              <select :value="item.status"
                @change="updateStatus(item.id, ($event.target as HTMLSelectElement).value as OrderStatus)">
                <option value="reserved">reserved</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <div v-if="item.status === 'delivered'" class="rating-section">
              <label>Tvoja ocena:</label>
              <select :value="item.userRating || 5"
                @change="rateItem(item.id, Number(($event.target as HTMLSelectElement).value))">
                <option :value="1">⭐ 1</option>
                <option :value="2">⭐ 2</option>
                <option :value="3">⭐ 3</option>
                <option :value="4">⭐ 4</option>
                <option :value="5">⭐ 5</option>
              </select>
            </div>

            
            <div class="item-total-price">
              {{ item.plant.price * item.quantity }} RSD
            </div>

            
            <button @click="deleteItem(item.id)" class="btn-delete-outline">
              Ukloni
            </button>
          </div>
        </div>
      </div>

      
      <div class="cart-summary">
        <h3>Ukupno za naplatu: <span class="total">{{ cart.totalPrice }} RSD</span></h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
  color: #E0F8C7;
}

h2 {
  color: #B7D894;
  margin-bottom: 20px;
}

.empty-cart {
  background-color: #36415A;
  color: #E0F8C7;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  font-size: 1.1rem;
  border: 1px solid #4a5878;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #202734;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #4a5878;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.img-wrapper {
  width: 210px;
  height: 160px;
  background-color: #181d27;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 4px;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  color: #E0F8C7;
  margin-bottom: 4px;
  font-size: 1.05rem;
}

.type {
  font-size: 0.8rem;
  color: #B7D894;
  margin-bottom: 4px;
}

.price-unit {
  font-size: 0.85rem;
  color: #E0F8C7;
  font-weight: bold;
}

.status-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 6px;
  margin-top: 4px;
  text-transform: uppercase;
}

.status-tag.reserved {
  background-color: #202734;
  color: #B7D894;
  border: 1px solid #B7D894;
}

.status-tag.delivered {
  background-color: #B7D894;
  color: #202734;
}

.status-tag.cancelled {
  background-color: #ff6b6b;
  color: #ffffff;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.item-actions label {
  font-size: 0.75rem;
  color: #E0F8C7;
  margin-right: 6px;
}

input,
select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #4a5878;
  background-color: #202734;
  color: #E0F8C7;
  font-size: 0.8rem;
}


.item-total-price {
  font-size: 1.05rem;
  font-weight: bold;
  color: #B7D894;
  margin-top: 4px;
}


.btn-delete-outline {
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.btn-delete-outline:hover {
  background-color: rgba(255, 107, 107, 0.15);
  color: #ff8787;
  border-color: #ff8787;
}

.cart-summary {
  margin-top: 20px;
  text-align: right;
  background-color: #202734;
  color: #E0F8C7;
  padding: 16px 24px;
  border-radius: 12px;
  border: 1px solid #36415A;
}

.cart-summary h3 {
  margin: 0;
  font-size: 1.2rem;
}

.total {
  color: #B7D894;
  font-size: 1.4rem;
  font-weight: bold;
}

.empty-cart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}


.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}


.empty-cart-icon {
  font-size: 2.8rem;
  color: #a0aec0;
  opacity: 0.7;
}

.empty-cart-container h2 {
  color: #E0F8C7;
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.empty-cart-container p {
  color: #a0aec0;
  font-size: 0.95rem;
  margin-bottom: 24px;
}


.btn-browse {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #B7D894;
  color: #181d27;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-browse:hover {
  background-color: #E0F8C7;
  transform: translateY(-2px);
}
</style>