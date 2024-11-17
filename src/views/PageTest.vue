<template>
    <h2>Page de test</h2>
    <router-link :to="{name: 'map', params: {id: 1 }}">Carte Calp</router-link>
    <v-btn width="100" @click="myMap()">TEST</v-btn>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()

function myMap() {
    const id = 2
    router.push({path: `/map/${id}`})
}
</script>