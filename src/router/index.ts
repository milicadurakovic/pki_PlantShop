import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PlantDetailsView from '../views/PlantDetailsView.vue';
import CartView from '../views/CartView.vue';
import ProfileView from '../views/ProfileView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { UserService } from '../services/user.service';
import WishList from '../views/WishList.vue';



const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/plant/:id', name: 'plant-details', component: PlantDetailsView },
    { path: '/wishlist', component: WishList },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true }, 
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }, 
    },
  ],
});


router.beforeEach((to, _from, next) => {
  const user = UserService.getCurrentUser();
  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else {
    next();
  }
});

export default router;