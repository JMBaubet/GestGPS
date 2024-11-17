<template>
    <h2>Page de test</h2>
    <router-link :to="{name: 'map', params: {id: 1 }}">Carte Calp</router-link>
    <v-btn width="100" @click="myMap()">TEST</v-btn>

    <h2>test des colonnes</h2>
    <v-container  v-if="width < 960">
    <v-row justify="space-between">
        <v-col  class="d-flex justify-center">
      <ParcoursCard></ParcoursCard></v-col>
    </v-row>
  </v-container>
    <v-container  v-if=" width > 959 && width < 1280">
    <v-row 
      justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 2" :key="n" cols="12" sm="6">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
    <v-container min-width=1280   v-if="width > 1279 && width < 1920">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 3" :key="n" cols="12" sm="4">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-container  v-if="width > 1919">
    <v-row  justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 4" :key="n" cols="12" sm="3">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>


</template>

<script setup>
import { useRouter } from 'vue-router';
import ParcoursCard from '@/components/ParcoursCard.vue';
const router = useRouter()

function myMap() {
    const id = 2
    router.push({path: `/map/${id}`})
}


import { useWindowSize } from '@vueuse/core';

const { width } = useWindowSize()
</script>