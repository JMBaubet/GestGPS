<template>
  <!-- <div v-if="mask === true">

  </div>
  <div v-else id="evtPause" >
    <v-card class="mx-auto pa-0" max-width="320" min-width="320"  color="#23374AC0">
      <v-card-text>


        <v-row justify="center" >
          Gestion des pauses
        </v-row>    

        <v-divider class="my-4"></v-divider> -->
        <v-row>
          <v-col cols = "4" class="pr-0">
            <p id="text">KM 0 :</p>

          </v-col>
          <v-col cols="8"  class="pa-0 ma-0"> 
            <v-switch 
              id="switchPause"
              class="pl-2"
              color="green"
              base-color="red"
              hide-details="true"
              v-tooltip="'Sélectionnez pour avoir une pause au lancement.', location='top'" 

            ></v-switch>
          </v-col>
        </v-row>

        <v-row id="pauseInput" >
          <v-col cols = "4" class="pr-0">
            <p id="text">Distance :</p>
          </v-col>
          <v-col cols="8"  class="pa-0 ma-0"> 
            <InputNumber
            :incrementMin=0.1
            :incrementMax=1
            :nombre=distance
              :min=0
              :max=21
            >
            </InputNumber>
          </v-col>
        </v-row>

        
        <v-row  justify="end" class="ma-1">
        <v-btn  class="ma-2 text-none" 
          @click="emit('del')"
          :disabled=disabledDepart
          size="small" 
          min-width="90px"
          color="red-darken-2"
        > Supprimer  
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('add')"
          :disabled=disabledM1k
          size="small" 
          min-width="90px"
          color="green-darken-2"
        > Ajouter
        </v-btn>
        </v-row>

        
      <!-- </v-card-text>
    </v-card>
  </div> -->
</template>

<script setup>
import InputNumber from './InputNumber.vue';
import { ref } from 'vue';
const emit = defineEmits(['del', 'add'])

const mask = ref(false)
const distance = ref(15.1)

function ajout() {
  console.log(`Ajout`)
}
function sub() {
  console.log(`Sub`)
}

</script>

<style scoped>


#switchPause, .v-input--density-default {
    --v-input-control-height: 43px;
}

  /* #evtPause {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    right: 10px;

  } */

  #text {
    text-align: end;
  }

</style>
