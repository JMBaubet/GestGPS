import { createRouter, createWebHistory }from 'vue-router'
import GpxContainer from '@/views/GpxContainer.vue'
import MapContainer from '@/views/MapContainer.vue'
import AddGpxCard from '@/views/AddGpxCard.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: GpxContainer
        },
        {
            name: 'addGpx',
            path: '/addGpx',
            component: AddGpxCard
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