<template>
  <div class="pa-0" v-if="props.showFiltre">
    <v-toolbar  compact floating class="pa-0" color="grey-darken-3">

      <v-btn 
        :disabled="props.disabledBtnFiltre"
        @click= "emit('resetFiltre')"
        icon 
      >
        <v-icon color="primary">mdi-filter-variant-remove</v-icon>
        <v-tooltip activator="parent" location="bottom">
        Effacer les filtres.
      </v-tooltip>
      </v-btn>

      <v-divider class="align-self-center" thickness="2" vertical></v-divider>
      <v-btn 
        :disabled="props.disabledBtnFiltre"
        @click= "emit('filtreCircuits')"
        icon 
      >
        <v-icon color="primary">mdi-filter-variant</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Filtrer.
        </v-tooltip>
      </v-btn>

      <v-divider class="align-self-center" thickness="15" vertical></v-divider>

      <v-combobox 
        :items=itemsVilles 
        @update:menu="selectVille" 
        v-model="ville" 
        max-width="200"
        label="Ville de Départ" 
        hide-details="true">
      </v-combobox>
            
      <v-divider class="mx-1 align-self-center" thickness="5" vertical></v-divider>

      <v-combobox 
        :items=itemsTraceurs 
        @update:menu="selectTraceur" 
        v-model="traceur" 
        label="Traceur"
        max-width="200" 
        hide-details="true"
      >
      </v-combobox>

      <Slider 
        :min="distMin" 
        :max="distMax" 
        :reset
        @update="updateDistance"
        step=5 
        label="Dist. " 
        unite="km"
      >
      </Slider>
      <v-divider class="mx-1 align-self-center" thickness="5" vertical></v-divider>

      <Slider 
        :min="denivMin" 
        :max="denivMax" 
        :reset
        @update="updateDenivele"
        step=20 
        label="D+ " 
        unite="m"
        >
      </Slider>

    </v-toolbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Slider from './Slider.vue';

const DISTANCE_MIN = parseInt(import.meta.env.VITE_FILTRE_DISTANCE_MIN)
const DISTANCE_MAX = parseInt(import.meta.env.VITE_FILTRE_DISTANCE_MAX)
const DENIV_MIN = parseInt(import.meta.env.VITE_FILTRE_DENIV_MIN)
const DENIV_MAX = parseInt(import.meta.env.VITE_FILTRE_DENIV_MAX)

const props = defineProps({
  showFiltre: Boolean,
  itemsVilles: Array,
  itemsTraceurs: Array,
  reset: Boolean,
  // #TODO voir pourquoi on ne peut pas passer les min et max en properties
  // distMin : Number,
  // distMax : Number,
  // denivMin : Number,
  // denivMax : Number
})


const emit = defineEmits(['filtrerVille', 'filtrerTraceur', 'filtrerDistance', 'filtrerDenivele', 'resetFiltre', 'filtreCircuits'])

watch(() => props.reset, (newValue, oldValue) => {
  ville.value = []
  traceur.value = []

  emit('filtrerVille', " ")
  emit('filtrerTraceur', " ")
  emit('filtrerDistance', [ DISTANCE_MIN, DISTANCE_MAX])
  emit('filtrerDenivele', [ DENIV_MIN, DENIV_MAX])

  emit('filtreCircuits')
})


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
    // console.log(`Filtre.vue ${ville.value}`)
    villePrecedente = ville.value
    // On peut emettre le signal avec la ville en paramètre
    emit('filtrerVille', ville.value)
    
  }
}

function selectTraceur() {
  if (traceur.value !== traceurPrecedent) {
    // console.log(`Filtre.vue ${traceur.value}`)
    traceurPrecedent = traceur.value
    // On peut emettre le signal avec le traceur en paramètre
    emit('filtrerTraceur', traceur.value)
  }
}

function updateDistance(range) {
  // console.table(range)
  emit('filtrerDistance', range)
}

function updateDenivele(range) {
  // console.table(range)
  emit('filtrerDenivele', range)
}

</script>
