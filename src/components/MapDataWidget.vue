<template>
  <div id="data">
    <v-card class="mx-auto" max-width="220" min-width="220" color="#23374AC0">
    <v-card-actions>
      <v-btn color="white" @click="show = !show">Informations</v-btn>
      
      <v-spacer></v-spacer>

      <v-btn class="ma-0 pa-0"
        :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="show = !show"
      ></v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="show" class="pa-0">
        <v-divider></v-divider>
          <div class="text-body-1 ma-2">Distance : {{distance}} / {{distanceTotale}} Km</div>

        <v-divider></v-divider>
          <div class="text-body-1 ma-2">Altitude : {{altitude}} m </div>

        <v-divider></v-divider>
          <div class="text-body-1 ma-2">D+ : 122 / 1345 m</div>

        <v-divider></v-divider>
          <div class="text-body-1 ma-2">Pente : 5% </div>
      </div>
    </v-expand-transition>
  </v-card>
  </div>
</template>

<script setup>

import { ref } from 'vue';
  const props = defineProps({
    distanceTotale: String,
    denivTotal: Number,
    distance: String,
    altitude: Number,
    pente: Number,
    deniv: Number
  })

  
  const show = ref(false)

</script>

<style >
  #data {
    padding: 6px;
    z-index: 1;
    position: absolute;
    top:  0;
    right: 0;
  }

  .v-card-actions {
    padding: 0;
  }

</style>