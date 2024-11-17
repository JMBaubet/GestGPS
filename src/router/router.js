import { createRouter, createWebHistory }from 'vue-router'
import PageTest from '@/views/PageTest'
import MapContainer from '@/views/MapContainer.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: PageTest
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