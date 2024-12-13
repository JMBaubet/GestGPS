<template>
  <div class="pa-0" >
    <v-toolbar compact floating class="pa-1" color="grey-darken-3">
      <v-combobox
        max-width="200"
        label="Ville de Départ"
        :items=itemsVilles
      ></v-combobox>
      <v-divider
        class="mx-1 align-self-center"
        thickness="5"
        vertical
      ></v-divider>
      <v-combobox
        label="Traceur"
        max-width="200"
        :items=itemsTraceurs
      ></v-combobox>
      <v-divider
        class="mx-1 align-self-center"
        thickness="5"
        vertical
      ></v-divider>

      <v-range-slider
        v-model="valueDistance"
        min="20"
        max="250"
        step="5"
        density="compact"
        label="Dist."
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="valueDistance[0]"
            density="compact"
            style="width: 80px"
            type="number"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field
            v-model="valueDistance[1]"
            density="compact"
            style="width: 80px"
            type="number"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
      </v-range-slider>
      <v-divider
        class="mx-1 align-self-center"
        thickness="5"
        vertical
      ></v-divider>

      <v-range-slider
        v-model="valueDeniv"
        min="50"
        max="4500"
        step="5"
        density="compact"
        label="D+"
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="valueDeniv[0]"
            density="compact"
            style="width: 100px"
            type="number"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field
            v-model="valueDeniv[1]"
            density="compact"
            style="width: 100px"
            type="number"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
      </v-range-slider>
    </v-toolbar>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';



const props = defineProps({
    vueDialogGpx : Boolean,
    itemsVilles : Array,
    itemsTraceurs : Array,
  }) 

const valueDistance = ref([40,200])
const valueDeniv = ref([100,4500])

onMounted(() => {

})

</script>
