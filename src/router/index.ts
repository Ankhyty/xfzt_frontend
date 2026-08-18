import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import GalleryView from '../views/GalleryView.vue'
import CardDetailView from '../views/CardDetailView.vue'
import StudioView from '../views/StudioView.vue'
import AdminView from '../views/AdminView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Gallery',
    component: GalleryView
  },
  {
    path: '/cards/:card_id',
    name: 'CardDetail',
    component: CardDetailView
  },
  {
    path: '/studio',
    name: 'Studio',
    component: StudioView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})
