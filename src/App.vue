<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { UserService } from './services/user.service';
import { OrderService } from './services/order.service';
import { WishlistService } from './services/whishlist.service';
import Swal from 'sweetalert2';
import ChatAgent from './views/ChatAgent.vue';


const router = useRouter();
const currentUser = ref(UserService.getCurrentUser());
const cartCount = ref(0);
const wishlistCount = ref(0);




const updateNavStats = () => {
  currentUser.value = UserService.getCurrentUser();
  if (currentUser.value) {

    const cart = OrderService.getCart(currentUser.value.id);
    cartCount.value = cart.items
      .filter((i) => i.status === 'reserved')
      .reduce((sum, i) => sum + i.quantity, 0);


    const wishlist = WishlistService.getWishlist(currentUser.value.id);
    wishlistCount.value = wishlist.length;
  } else {
    cartCount.value = 0;
    wishlistCount.value = 0;
  }
};

let intervalId: number;

onMounted(() => {
  updateNavStats();
  intervalId = window.setInterval(updateNavStats, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

/*const handleLogout = () => {
  UserService.logout();
  updateNavStats();
  router.push('/login');
};*/



const handleLogout = () => {
  Swal.fire({
    title: 'Da li ste sigurni?',
    text: 'Bićete odjavljeni sa svog naloga.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#B7D894',
    cancelButtonColor: '#36415A',
    confirmButtonText: '<span style="color: #181d27; font-weight: bold;">Da, odjavi me</span>',
    cancelButtonText: 'Otkaži',
    background: '#202734',
    color: '#E0F8C7'
  }).then((result) => {
    if (result.isConfirmed) {
      UserService.logout();
      updateNavStats();
      router.push('/login');
    }
  });
};
</script>

<template>
  <div id="app-root">

    <header class="navbar-header">
      <div class="navbar-container">

        <router-link to="/" class="brand-logo">
          <i class="fa-brands fa-pagelines"></i> PlantShop
        </router-link>


        <nav class="nav-links">
          <router-link to="/" class="nav-btn">
            <i class="fa-solid fa-house"></i>

          </router-link>

          <router-link to="/wishlist" class="nav-btn">
            <i class="fa-solid fa-heart"></i>

            <span v-if="wishlistCount > 0" class="nav-badge">{{ wishlistCount }}</span>
          </router-link>

          <router-link to="/cart" class="nav-btn">
            <i class="fa-solid fa-cart-shopping"></i>

            <span v-if="cartCount > 0" class="nav-badge">{{ cartCount }}</span>
          </router-link>

          <router-link v-if="currentUser" to="/profile" class="nav-btn">
            <i class="fa-solid fa-user"></i>
            <span>{{ currentUser.firstName || 'Nalog' }}</span>
          </router-link>

          <button v-if="currentUser" @click="handleLogout" class="nav-btn btn-logout" title="Odjavi se">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>

          <router-link v-else to="/login" class="nav-btn">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Prijava</span>
          </router-link>

          <router-link v-if="!currentUser" to="/register" class="nav-btn btn-register">
            <i class="fa-solid fa-user-plus"></i>
            <span>Registracija</span>
          </router-link>
        </nav>
      </div>
    </header>


    <main class="main-content">
      <ChatAgent />
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #181d27;
  color: #E0F8C7;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}


.navbar-header {
  background-color: #202734;
  border-bottom: 1px solid #36415A;
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  font-size: 1.3rem;
  font-weight: bold;
  color: #B7D894;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.brand-logo:hover {
  transform: scale(1.02);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 10px;
}


.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #181d27;
  color: #E0F8C7;
  border: 1px solid #36415A;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  position: relative;
  cursor: pointer;
  line-height: 1;
}

.nav-btn i {
  color: #B7D894;
  font-size: 0.95rem;
  transition: transform 0.2s;
}


.nav-btn:hover {
  background-color: #36415A;
  color: #FFFFFF;
  border-color: #B7D894;
  transform: translateY(-1px);
}

.nav-btn:hover i {
  transform: scale(1.1);
}


.router-link-exact-active.nav-btn {
  background-color: #36415A;
  border-color: #B7D894;
  color: #B7D894;
  box-shadow: 0 0 10px rgba(183, 216, 148, 0.15);
}


.nav-badge {
  background-color: #B7D894;
  color: #202734;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.btn-logout {
  background-color: transparent;
}

.btn-logout:hover {
  border-color: #e53e3e;
}

.btn-logout:hover i {
  color: #e53e3e;
}

.main-content {
  flex: 1;
}

@media (max-width: 640px) {
  .nav-btn span:not(.nav-badge) {
    display: none;
  }

  .nav-btn {
    padding: 8px 10px;
  }
}
</style>