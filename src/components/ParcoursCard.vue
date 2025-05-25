<template>
  <v-card width="560">
    <v-img :src="dataDirectory + circuit.circuitId + '/vignette.png'" class="align-end text-white" cover>
    </v-img>
    <v-card-item class="pa-0">
      <v-card-text class="py-0">
        <v-row class="ma-0">
          <v-col class="pb-2 pl-0" cols="12" sm="10">
            <h2>{{ circuit.nom }}</h2>
          </v-col>
          <v-col class="pa-0 text-right" cols="12" sm="2">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical"  variant="text" v-bind="props"></v-btn>
              </template>
              <v-list>
                <v-list-item value="aff">
                  <v-list-item-title @click="  emit('informations')">Informations</v-list-item-title>
                </v-list-item>
                <v-list-item value="camera">
                  <v-list-item-title @click="emit('modCameraFile')">Editer</v-list-item-title>
                </v-list-item>
                <v-list-item value="3d">
                  <v-list-item-title @click="emit('affiche3D')">Visualiser</v-list-item-title>
                </v-list-item>
                <!-- <v-list-item disabled value="sel">
                  <v-list-item-title>Sélectionner pour comparer</v-list-item-title>
                </v-list-item>
                <v-list-item disabled value="com">
                  <v-list-item-title>Comparer</v-list-item-title>
                </v-list-item> -->
                <v-list-item value="sup" base-color="red">
                  <v-list-item-title @click="emit('confirmDelGpxFile')">Supprimer</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>

        <div class=" text-subtitle-1">
          <v-row class="ma-0">
            <v-col class="pa-0" cols="12" sm="6">Distance : {{ circuit.distance }} km</v-col>
            <v-col class="pa-0 text-right" cols="12" sm="6">Dénivelé + : {{ circuit.denivele }} m</v-col>
            <v-col class="pa-0 " cols="12" sm="8">
              Sommet : {{ circuit.sommet.altitude }} m à {{ circuit.sommet.km }} km
            </v-col>
            <v-col class="pa-0" cols="12" sm="2">
              Edition : 
            </v-col>
            <v-col class="pt-3 text-right pa-0 ma-0" cols="12" sm="2">
              <v-progress-linear
                :location="null"
                bg-color="#FFFFFF"
                buffer-color="#802020"
                buffer-opacity="1"
                :buffer-value="lg"
                color="#40FF40"
                height="8"
                :max="lg"
                min="0"
                :model-value="lgEdition"
                rounded
              ></v-progress-linear>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const dataDirectory = import.meta.env.VITE_DATA_DIRECTORY

const props = defineProps({
  //id: Number,
  circuit: Object,
})

const lg = ref(parseInt(props.circuit.distance))
const lgEdition = ref(parseInt(props.circuit.lgEdition/10))

const emit = defineEmits(['informations', 'confirmDelGpxFile', 'modCameraFile', 'affiche3D'])


//router.push({ path: `/map/${id}` })
</script>