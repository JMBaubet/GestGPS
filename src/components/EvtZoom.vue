<template>
  <EvtPositionWidget
  ></EvtPositionWidget>
  

  <v-divider class="mt-2"></v-divider>



  <v-row class="mt-0">
    <v-col cols = "5" class="pr-0 mt-2" >
      
    </v-col>
    <v-col cols="6"  class="pr-0" align="end">
      <v-btn  class="ml-2"
          @click="precedent()"
          :disabled=disabledPrecedent
          size="x-small" 
          color="grey-darken-4"
          icon="mdi-chevron-left"
          v-tooltip="'Aller au zoom précédent', location='bottom'" 
        > 
        </v-btn>
        <v-btn  class="ml-2"
          @click="suivant()"
          :disabled=disabledSuivant
          size="x-small" 
          color="grey-darken-4"
          icon="mdi-chevron-right"
          v-tooltip="'Aller au zoom suivant', location='bottom'" 
        > 
        </v-btn>

        <v-btn  class="ml-6"
          @click="save()"
          size="small" 
          color="red-darken-4"
          icon="mdi-content-save-outline"
          v-tooltip="'Sauvegarder les zooms', location='bottom'" 
        > 
        </v-btn>

   </v-col> 

  </v-row>

  <v-divider class="my-2"></v-divider>




  <v-row  v-if="isPresent" class="mx-0">
    <v-col sm="4"  class="my-0">
      <v-btn class="mb-2 text-none" 
        :disabled=disabledAddDel
        @click="del(props.position)"
        size="small" 
        min-width="90px"
        color="red-darken-2"
      > Supprimer  
      </v-btn>
    </v-col>
    <v-col sm="8" class="mt-1" >
      <span id="distance">
        le zoom du km <b>{{ distance }} </b>
      </span> 
    </v-col>
  </v-row>
  <v-row  v-else class="mx-0">
    <v-col  sm="4"  class="my-0">
      <v-btn  class="mb-2 text-none" 
        :disabled=disabledAddDel
        @click="add(props.position)"
        size="small" 
        min-width="90px"
        color="green-darken-2"
      > Ajouter  
      </v-btn>
    </v-col>
    <v-col sm="8" class="mt-1" >
      <span id="distance">
        un zoom au km <b>{{ distance }} </b>
      </span> 
    </v-col>
  </v-row>   

</template>

<script setup>
import EvtPositionWidget from './EvtPositionWidget.vue';
import { ref } from 'vue';

const disabledAddDel = ref(false)
const distance = ref(0)
const isPresent = ref(true)
const disabledPrecedent = ref(false)
const disabledSuivant = ref(false)

</script>

<style scoped>


</style>
