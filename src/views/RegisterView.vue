<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '../models/user.model';
import { UserService } from '../services/user.service';

const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const address = ref('');
const errorMessage = ref('');

const handleRegister = () => {
  if (!firstName.value || !email.value || !password.value) {
    errorMessage.value = 'Molimo vas da popunite sva obavezna polja!';
    return;
  }

  
  const newUser: User = {
    id: Date.now(),
    username: username.value || email.value.split('@')[0],
    firstName: firstName.value,
    lastName: lastName.value || 'Korisnik',
    email: email.value,
    phone: phone.value || '',
    address: address.value || 'Nije navedeno',
    favoritePlantTypes: []
  };

  
  UserService.saveCurrentUser(newUser);

  
  router.push('/').then(() => {
    window.location.reload();
  });
};
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Registracija</h2>
      <p class="subtitle">Napravite nalog i uživajte u kupovini biljaka!</p>

      <div v-if="errorMessage" class="error-msg">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Ime *</label>
          <input 
            v-model="firstName" 
            type="text" 
            placeholder="Marko" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Prezime</label>
          <input 
            v-model="lastName" 
            type="text" 
            placeholder="Jovanović" 
          />
        </div>

        <div class="form-group">
          <label>Korisničko ime</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="marko12" 
          />
        </div>

        <div class="form-group">
          <label>Email adresa *</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="imeprezime@example.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Broj telefona</label>
          <input 
            v-model="phone" 
            type="tel" 
            placeholder="0601234567" 
          />
        </div>

        <div class="form-group">
          <label>Lozinka *</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Adresa</label>
          <input 
            v-model="address" 
            type="text" 
            placeholder="Knez Mihailova 10, Beograd" 
          />
        </div>

        <button type="submit" class="btn-submit">Registruj se!</button>
      </form>

      <p class="redirect-text">
        Već imate nalog? <router-link to="/login">Prijavite se!</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;

  
  background-image: linear-gradient(
      rgba(24, 29, 39, 0.45), 
      rgba(24, 29, 39, 0.45)
    ),
    url('../assets/plant1-bg.jpg'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /*filter: contrast(1.1) saturate(1.15);*/
}

.register-box {
  background-color: rgba(32, 39, 52, 0.55); 
  backdrop-filter: blur(8px); 
  border: 1px solid #36415A;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

h2 {
  color: #B7D894;
  margin-bottom: 4px;
}

.subtitle {
  color: #a0aec0;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.error-msg {
  background-color: rgba(255, 107, 107, 0.2);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 16px;
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
  background-color: rgba(24, 29, 39, 0.9);
  color: #E0F8C7;
  font-size: 0.88rem;
}

input:focus {
  outline: none;
  border-color: #B7D894;
}

.btn-submit {
  width: 100%;
  background-color: #B7D894;
  color: #202734;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #E0F8C7;
}

.redirect-text {
  font-size: 0.85rem;
  color: #a0aec0;
  text-align: center;
  margin-top: 20px;
}

.redirect-text a {
  color: #B7D894;
  text-decoration: none;
  font-weight: bold;
}

.redirect-text a:hover {
  color: #E0F8C7;
}
</style>