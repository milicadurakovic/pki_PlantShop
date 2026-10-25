<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserService } from '../services/user.service';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = () => {
  if (!email.value) {
    errorMessage.value = 'Molimo unesite email adresu.';
    return;
  }

  
  UserService.login(email.value);
  
  
  router.push('/').then(() => {
    window.location.reload(); 
  });
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Prijavi se!</h2>
      <p class="subtitle">Dobrodošli nazad u Plant Shop</p>

      <div v-if="errorMessage" class="error-msg">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email adresa</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="imeprezime@example.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Lozinka</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button type="submit" class="btn-submit">Prijavi se</button>
      </form>

      <p class="redirect-text">
        Nemate nalog? <router-link to="/register">Registrujte se</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); 
  padding: 20px;

 
  background-image: linear-gradient(
      rgba(24, 29, 39, 0.45), 
      rgba(24, 29, 39, 0.45)
    ),
    url('../assets/monstera-bg.jpg'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-box {
  background-color: rgba(32, 39, 52, 0.55); 
  backdrop-filter: blur(8px); 
  border: 1px solid #36415A;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
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
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.8rem;
  color: #E0F8C7;
  margin-bottom: 6px;
}

input {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #36415A;
  background-color: #181d27;
  color: #E0F8C7;
  font-size: 0.9rem;
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
</style>