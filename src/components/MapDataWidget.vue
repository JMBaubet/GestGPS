<template>
  <div id="data" v-show="showData">
   <v-sheet 
    class=" px-0 py-1 mx-auto"
    color="#23374AC0"
    min-width="250"
    max-width="250"
    rounded="lg"
    border="md"
  >
    <v-col cols="12">
      <div class="text-body-1 ma-0 text-center">Distance : {{distance}} / {{distanceTotale}} Km</div>
      <v-progress-linear
        :location="null"
        bg-color="#92aed9"
        buffer-color="red"
        buffer-opacity="1"
        :buffer-value=distanceTotale
        color="yellow-lighten-2"
        height="6"
        :max=distanceTotale
        min="0"
        :model-value=distance
        rounded
      ></v-progress-linear>
    </v-col>
  </v-sheet>
</div>
</template>

<script setup>
import { ref } from 'vue';
  const props = defineProps({
    showData: Boolean,
    distanceTotale: String,
    denivTotal: Number,
    distance: String,
    altitude: Number,
    pente: Number,
    deniv: Number
  })

</script>

<style lang="css" scoped>
  #data {
    padding: 2px;
    z-index: 1;
    position: absolute;
    top:  0;
    right: 50% ;
    transform: translateX(50%);
  }

</style>