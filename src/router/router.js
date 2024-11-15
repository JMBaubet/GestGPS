import { createRouter, createWebHistory }from 'vue-router'
import PageTest from '@/views/PageTest'
import MapContainer from '@/views/MapContainer.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: PageTest
        },
        {
            path: '/map',
            component: MapContainer
        }
    ]
})

export default router