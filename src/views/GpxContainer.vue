<template>
    <!-- <h2>Page de test</h2>
    <router-link :to="{name: 'map', params: {id: 1 }}">Carte Calp</router-link>
    <v-btn width="100" @click="myMap()">TEST</v-btn> -->
    <MenuToolbar></MenuToolbar>

    <v-container  class="hidden-md-and-up">
    <v-row justify="space-between">
        <v-col  class="d-flex justify-center">
      <ParcoursCard></ParcoursCard></v-col>
    </v-row>
  </v-container>
    <v-container class="hidden-sm-and-down hidden-lg-and-up">
    <v-row 
      justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 2" :key="n" cols="12" sm="6">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
    <v-container class="hidden-md-and-down hidden-xl-and-up">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 3" :key="n" cols="12" sm="4">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-container  class="hidden-lg-and-down">
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
import MenuToolbar from '@/components/MenuToolbar.vue';
const router = useRouter()

function myMap() {
    const id = 2
    router.push({path: `/map/${id}`})
}


</script>