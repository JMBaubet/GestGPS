import { createRouter, createWebHistory } from 'vue-router'
import GpxContainer from '@/views/GpxContainer.vue'
import MapContainer from '@/views/MapContainer.vue'
import CameraContainer from '@/views/CameraContainer.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'home',
      path: '/',
      component: GpxContainer
    },
    {
      name: 'map',
      path: '/map/:id',
      component: MapContainer,
      props: true
    },
    {
      name: 'camera',
      path: '/camera/:id',
      component: CameraContainer,
      props: true
    }

  ]
})

export default router