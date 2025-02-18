<template>
  <div id="cameraContainer" >
  <v-card class="mx-auto" max-width="300" min-width="300"  color="#23374AC0">
    <v-card-text> 
      <v-row justify="center">
        Position de la caméra
      </v-row>    

      <v-row justify="center">
        <v-col cols="auto"> 
          Zoom : 
          <v-btn class="ml-2"
            @click="emit('zoomIn')"
            size="small" 
            icon="mdi-magnify-plus" 
          >  
          </v-btn>

          <v-btn class="ml-2"
            @click="emit('zoomOut')"
            size="small" 
            icon="mdi-magnify-minus" 
          >  
          </v-btn>
        </v-col>
      </v-row>


      <v-row  justify="center">
        <v-btn 
          @click="emit('pitchPlusPlus')"
          :disabled=disabledPitchPPlus
          size="small" 
          icon="mdi-chevron-double-up" 
        >  
        </v-btn>
      </v-row>
      <v-row  justify="center">
        <v-btn class="mt-1"
          @click="emit('pitchPlus')"
          :disabled=disabledPitchPlus
          size="small" 
          icon="mdi-chevron-up" 
        >  
        </v-btn>
      </v-row>

      <v-row  justify="center">
        <v-btn  class="mr-2"
          @click="emit('capMoinsMoins')"
          size="small" 
          icon="mdi-chevron-double-left" 
        >  
        </v-btn>

        <v-btn class="mr-10"
          @click="emit('capMoins')"
          size="small" 
          icon="mdi-chevron-left" 
        >  
        </v-btn>
      
        <v-btn class="mr-2"
          @click="emit('capPlus')"
          size="small" 
          icon="mdi-chevron-right" 
        >  
        </v-btn>
        <v-btn 
          @click="emit('capPlusPlus')"
          size="small" 
          icon="mdi-chevron-double-right" 
        >  
        </v-btn>
      </v-row>

      <v-row  justify="center">
        <v-col sm="4" class = "pa-0" align="center"></v-col>
        <v-col sm="4" class = "pa-0" align="center">

          <v-btn   class="mb-1"
            @click="emit('pitchMoins')"
            :disabled=disabledPitchMoins
            size="small" 
            icon="mdi-chevron-down" 
          >  
          </v-btn>
        </v-col>
        <v-col sm="4" class = "pa-0" align="center">
          <v-btn  class="ma-2 text-none"
              @click="emit('check')"
              :disabled=disabledVerifier
              size="small"
              color="primary" 
            > Vérifier
          </v-btn>

        </v-col>


      </v-row>

      <v-row justify="center">
        <v-col sm="4" class = "pa-0" >
          <v-btn  class="ma-2 text-none"
              @click="emit('save')"
              :disabled=disabledSave
              size="small" 
              color="red"
            > Sauvegarder
          </v-btn>

        </v-col>

        <v-col sm="4"  class = "pa-0" align="center">
          <v-btn 
            @click="emit('pitchMoinsMoins')"
            :disabled=disabledPitchMMoins
            size="small" 
            icon="mdi-chevron-double-down" 
          >  
          </v-btn>
        </v-col>

        <v-col sm="4"class = "pa-0">
          <v-btn  class="ma-2 text-none"
            @click="emit('positionCamera')"
            size="small" 
            color="success"
          > &nbsp;Valider&nbsp;
          </v-btn>
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
</div>
</template>

<script setup>

import { ref } from 'vue';

const emit = defineEmits(['zoomIn', 'zoomOut', 'pitchPlusPlus', 'pitchPlus', 'capMoinsMoins', 'capMoins', 'capPlus', 'capPlusPlus', 'pitchMoins', 'pitchMoinsMoins', 'positionCamera', 'save', 'check'])

const props = defineProps({
  disabledPitchPPlus: Boolean,
  disabledPitchPlus: Boolean,
  disabledPitchMoins: Boolean,
  disabledPitchMMoins: Boolean,
  disabledSave: Boolean,
  disabledVerifier: Boolean
})
</script>

<style >
  #cameraContainer {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    left: 10px;
  }

</style>