<template>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Gestion des pauses"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showPause ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showPause = !showPause; showInfo=false; showZoom=false"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showPause">
          <v-divider></v-divider>
          <EvtPause></EvtPause>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Gestion des informations"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showInfo = !showInfo; showPause=false; showZoom=false"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showInfo">
          <v-divider></v-divider>
          <p>&nbsp; A faire</p>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn   class="text-none" text="Gestion des zooms"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showZoom ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showZoom = !showZoom; showInfo= false; showPause=false"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showZoom">
          <v-divider></v-divider>
          <p>&nbsp; A faire</p>
        </div>
      </v-expand-transition>
    </v-card>


</template>

<script setup>
import EvtPause from './EvtPause.vue';
import { ref } from 'vue';

const showPause = ref(false)
const showInfo = ref(false)
const showZoom = ref(false)

</script>

<style lang="css" scoped>

</style>