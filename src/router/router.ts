import { createRouter, createWebHistory }from 'vue-router'
import GpxContainer from '@/views/GpxContainer.vue'
import MapContainer from '@/views/MapContainer.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: GpxContainer
        },
        {
            name : 'map',
            path: '/map/:id',
            component: MapContainer,
            props: true
        }
    ]
})

export default router