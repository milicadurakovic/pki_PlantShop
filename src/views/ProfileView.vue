<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '../models/user.model';
import { UserService } from '../services/user.service';

const router = useRouter();
const currentUser = ref<User | null>(null);
const isEditing = ref(false);


const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const phone = ref('');
const address = ref('');
const favoritePlantTypes = ref<string[]>([]);
const newPlantTypeInput = ref('');

const notification = ref('');
const errorMessage = ref('');

const loadUserData = () => {
  const user = UserService.getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }

  currentUser.value = user;
  firstName.value = user.firstName || '';
  lastName.value = user.lastName || '';
  username.value = user.username || '';
  email.value = user.email || '';
  phone.value = user.phone || '';
  address.value = user.address || '';
  favoritePlantTypes.value = user.favoritePlantTypes ? [...user.favoritePlantTypes] : [];
};

onMounted(() => {
  loadUserData();
});

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    loadUserData(); // 
  }
};

const addFavoriteType = () => {
  const trimmed = newPlantTypeInput.value.trim();
  if (trimmed && !favoritePlantTypes.value.includes(trimmed)) {
    favoritePlantTypes.value.push(trimmed);
    newPlantTypeInput.value = '';
  }
};

const removeFavoriteType = (index: number) => {
  favoritePlantTypes.value.splice(index, 1);
};

const handleUpdateProfile = () => {
  if (!firstName.value || !email.value) {
    errorMessage.value = 'Ime i email adresa su obavezni.';
    return;
  }

  const updated = UserService.updateUserProfile({
    firstName: firstName.value,
    lastName: lastName.value,
    username: username.value,
    email: email.value,
    phone: phone.value,
    address: address.value,
    favoritePlantTypes: favoritePlantTypes.value
  });

  if (updated) {
    currentUser.value = updated;
    errorMessage.value = '';
    isEditing.value = false;
    notification.value = 'Uspešno ste ažurirali profil!';
    setTimeout(() => {
      notification.value = '';
      window.location.reload();
    }, 1200);
  }
};
</script>

<template>
  <div class="profile-container" v-if="currentUser">
    <div v-if="notification" class="toast-notification">
      {{ notification }}
    </div>

    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-large">
          <i class="fa-solid fa-user"></i>
        </div>
        <h2>{{ currentUser.firstName }} {{ currentUser.lastName }}</h2>
        <p class="subtitle">@{{ currentUser.username }}</p>
      </div>

      
      <div v-if="!isEditing" class="profile-display">
        <div class="info-row">
          <span class="info-label"><i class="fa-solid fa-envelope"></i> Email:</span>
          <span class="info-value">{{ currentUser.email }}</span>
        </div>

        <div class="info-row">
          <span class="info-label"><i class="fa-solid fa-phone"></i> Telefon:</span>
          <span class="info-value">{{ currentUser.phone || 'Nije uneto' }}</span>
        </div>

        <div class="info-row">
          <span class="info-label"><i class="fa-solid fa-location-dot"></i> Adresa:</span>
          <span class="info-value">{{ currentUser.address || 'Nije uneto' }}</span>
        </div>

        <div class="favorites-section">
          <span class="info-label"><i class="fa-solid fa-seedling"></i> Omiljene biljke:</span>
          <div class="tags-list" v-if="currentUser.favoritePlantTypes && currentUser.favoritePlantTypes.length > 0">
            <span v-for="(type, idx) in currentUser.favoritePlantTypes" :key="idx" class="plant-tag">
              🌿 {{ type }}
            </span>
          </div>
          <p v-else class="empty-favorites">Nemate omiljene biljke :(</p>
        </div>

        <button @click="toggleEdit" class="btn-edit-toggle">
          <i class="fa-solid fa-pen-to-square"></i>
          Izmeni profil
        </button>
      </div>

      
      <div v-else class="profile-edit-form">
        <div v-if="errorMessage" class="error-msg">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label>Ime *</label>
            <input v-model="firstName" type="text" required />
          </div>

          <div class="form-group">
            <label>Prezime</label>
            <input v-model="lastName" type="text" />
          </div>

          <div class="form-group">
            <label>Korisničko ime</label>
            <input v-model="username" type="text" />
          </div>

          <div class="form-group">
            <label>Email adresa *</label>
            <input v-model="email" type="email" required />
          </div>

          <div class="form-group">
            <label>Broj telefona</label>
            <input v-model="phone" type="tel" />
          </div>

          <div class="form-group">
            <label>Adresa za dostavu</label>
            <input v-model="address" type="text" />
          </div>

          <div class="form-group">
            <label>Omiljene vrste biljaka</label>
            <div class="tag-input-wrapper">
              <input 
                v-model="newPlantTypeInput" 
                type="text" 
                placeholder="Dodaj novu vrstu..." 
                @keydown.enter.prevent="addFavoriteType"
              />
              <button type="button" @click="addFavoriteType" class="btn-add-tag">
                Dodaj
              </button>
            </div>

            <div class="tags-list editable-tags" v-if="favoritePlantTypes.length > 0">
              <span v-for="(type, index) in favoritePlantTypes" :key="index" class="plant-tag">
                🌿 {{ type }}
                <button type="button" @click="removeFavoriteType(index)" class="btn-remove-tag">✕</button>
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="toggleEdit" class="btn-cancel">
              Otkaži
            </button>
            <button type="submit" class="btn-save">
              <i class="fa-solid fa-seedling"></i>
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.profile-card {
  background-color: #202734;
  border: 1px solid #36415A;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.profile-header {
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #36415A;
  padding-bottom: 16px;
}

.avatar-large {
  width: 70px;
  height: 70px;
  background-color: #36415A;
  color: #B7D894;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 12px;
  border: 2px solid #4a5878;
}

h2 {
  color: #B7D894;
  margin: 0;
  font-size: 1.5rem;
}

.subtitle {
  color: #a0aec0;
  font-size: 0.85rem;
  margin-top: 4px;
}


.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #36415A;
  font-size: 0.9rem;
}

.info-label {
  color: #B7D894;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  color: #E0F8C7;
  font-weight: 400;
}

.favorites-section {
  margin-top: 16px;
  margin-bottom: 24px;
}

.empty-favorites {
  color: #a0aec0;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 6px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.plant-tag {
  background-color: #36415A;
  color: #B7D894;
  border: 1px solid #4a5878;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-edit-toggle {
  width: 100%;
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-edit-toggle:hover {
  background-color: #E0F8C7;
}


.error-msg {
  background-color: rgba(255, 107, 107, 0.2);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 16px;
  text-align: center;
}

.form-group {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.8rem;
  color: #E0F8C7;
  margin-bottom: 4px;
}

input {
  padding: 9px 12px;
  border-radius: 6px;
  border: 1px solid #36415A;
  background-color: #181d27;
  color: #E0F8C7;
  font-size: 0.88rem;
}

input:focus {
  outline: none;
  border-color: #B7D894;
}

.tag-input-wrapper {
  display: flex;
  gap: 8px;
}

.tag-input-wrapper input {
  flex: 1;
}

.btn-add-tag {
  background-color: #36415A;
  color: #E0F8C7;
  border: 1px solid #4a5878;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.8rem;
}

.btn-add-tag:hover {
  background-color: #4a5878;
}

.btn-remove-tag {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0 2px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-cancel {
  flex: 1;
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: rgba(255, 107, 107, 0.15);
}

.btn-save {
  flex: 2;
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-save:hover {
  background-color: #E0F8C7;
}
</style>