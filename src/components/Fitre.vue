<template>
  <div class="pa-0">
    <v-toolbar compact floating class="pa-1" color="grey-darken-3">
      <v-combobox :items=itemsVilles @update:menu="selectVille" v-model="ville" max-width="200"
        label="Ville de Départ"></v-combobox>
      <v-divider class="mx-1 align-self-center" thickness="5" vertical></v-divider>

      <v-combobox :items=itemsTraceurs @update:menu="selectTraceur" v-model="traceur" label="Traceur"
        max-width="200"></v-combobox>
      <v-divider class="mx-1 align-self-center" thickness="5" vertical></v-divider>
      <Slider :min="distMin" :max="distMax" step=5 label="Dist. " unite="km">
      </Slider>
      <v-divider class="mx-1 align-self-center" thickness="5" vertical></v-divider>

      <Slider :min="denivMin" :max="denivMax" step=20 label="D+ " unite="m">
      </Slider>
    </v-toolbar>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Slider from './Slider.vue';

const DISTANCE_MIN = parseInt(import.meta.env.VITE_FILTRE_DISTANCE_MIN)
const DISTANCE_MAX = parseInt(import.meta.env.VITE_FILTRE_DISTANCE_MAX)
const DENIV_MIN = parseInt(import.meta.env.VITE_FILTRE_DENIV_MIN)
const DENIV_MAX = parseInt(import.meta.env.VITE_FILTRE_DENIV_MAX)

const props = defineProps({
  itemsVilles: Array,
  itemsTraceurs: Array
  // #TODO voir pourquoi on ne peut pas passer les min et max en properties
  // distMin : Number,
  // distMax : Number,
  // denivMin : Number,
  // denivMax : Number
})

const emit = defineEmits(['filtrerVille', 'filtrerTraceur', 'filtreDistance', 'filtreDeniv'])

const ville = ref(null)
const traceur = ref(null)
const distMin = ref(DISTANCE_MIN)
const distMax = ref(DISTANCE_MAX)
const denivMin = ref(DENIV_MIN)
const denivMax = ref(DENIV_MAX)

let villePrecedente = null
let traceurPrecedent = null

function selectVille() {
  if (ville.value !== villePrecedente) {
    console.log(`Filtre.vue ${ville.value}`)
    villePrecedente = ville.value
    // On peut emettre le signal avec la ville en paramètre
    emit('filtrerVille', ville.value)
  }
}

function selectTraceur() {
  if (traceur.value !== traceurPrecedent) {
    console.log(`Filtre.vue ${traceur.value}`)
    traceurPrecedent = traceur.value
    // On peut emettre le signal avec le traceur en paramètre
    emit('filtrerTraceur', traceur.value)
  }
}
</script>
