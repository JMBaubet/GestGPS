<template>
  <v-card width="580">
    <v-img :src=vignette class="align-end text-white" cover>
    </v-img>
    <v-card-item class="pa-0">
      <v-card-text class="py-0">
        <v-row class="ma-0">
          <v-col class="pb-2 pl-0" cols="12" sm="10">
            <h2>{{ name }}</h2>
          </v-col>
          <v-col class="pa-0 text-right" cols="12" sm="2">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
              </template>
              <v-list>
                <v-list-item value="aff">
                  <v-list-item-title>Afficher les informations</v-list-item-title>
                </v-list-item>
                <v-list-item value="3d">
                  <v-list-item-title>Voir la 3D</v-list-item-title>
                </v-list-item>
                <v-list-item value="sel">
                  <v-list-item-title>Sélectionner pour comparer</v-list-item-title>
                </v-list-item>
                <v-list-item disabled value="com">
                  <v-list-item-title>Comparer</v-list-item-title>
                </v-list-item>
                <v-list-item value="mod">
                  <v-list-item-title>Modifier la fiche</v-list-item-title>
                </v-list-item>
                <v-list-item value="sup">
                  <v-list-item-title @click="delCircuit">Supprimer</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>

        <div class=" text-subtitle-1">
          <v-row class="ma-0">
            <v-col class="pa-0" cols="12" sm="6">Distance : {{ distance }} km</v-col>
            <v-col class="pa-0 text-right" cols="12" sm="6">Dénivelé + : {{ denivele }} m</v-col>
            <v-col class="pa-0" cols="12" sm="6">
              <v-row align="center" class=" ma-0">
                <div class="text-subtitle-1">Dificulté : &nbsp;</div>
                <v-rating :model-value="3.0" color="yellow" density="compact" size="small" half-increments readonly>
                </v-rating>
              </v-row>
            </v-col>
            <v-col class="pa-0 text-right" cols="12" sm="6">
              <h5>Sommet : {{ top }} m à {{ topDistance }} km</h5>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  //id: Number,
  vignette: String,
  name: String,
  distance: String,
  denivele: Number,
  top: Number,
  topDistance: String,
})

const emit = defineEmits(['confirmDelGpxFile'])

function delCircuit() {
  emit('confirmDelGpxFile')
}
</script>