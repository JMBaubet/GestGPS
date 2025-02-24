<template>
  <div id="cameraContainer" >
  <v-card class="mx-auto pa-0" max-width="300" min-width="300"  color="#23374AC0">
    <v-card-text> 
      <v-row justify="center" >
        Réglage de la caméra
      </v-row>    

      <v-row justify="center">
        <v-col cols="auto"> 
          <span id="zoom">
            Zoom : {{ zoom }}
          </span> 

          <v-btn class="ml-2"
            @click="emit('zoomIn')"
            color="cyan-lighten-1"
            size="small" 
            icon="mdi-magnify-plus" 
          >  
          </v-btn>

          <v-btn class="ml-2"
            @click="emit('zoomOut')"
            size="small" 
            color="cyan-lighten-1"
            icon="mdi-magnify-minus" 
          >  
          </v-btn>
        </v-col>
      </v-row>


      <v-row  justify="center">
        <v-col sm="5"  >
          <span id="pitch">
            Pitch : {{ pitch }}°
          </span> 
        </v-col>
        <v-col sm="2" class = "pa-0" align="center">
          <v-btn 
            @click="emit('pitchPlusPlus')"
            :disabled=disabledPitchPPlus
            size="small" 
            color="light-green-lighten-1"
            icon="mdi-chevron-double-up" 
          >  
          </v-btn>
        </v-col>
        <v-col sm="5"class = "pa-0" align="center">
        </v-col >
      </v-row>

      <v-row  justify="center">
        <v-col sm="5"  >
          <span id="cap">
            Cap : {{ cap }}°
          </span> 
        </v-col>
        <v-col sm="2" class = "pa-0" align="center">
          <v-btn class="mt-1"
            @click="emit('pitchPlus')"
            :disabled=disabledPitchPlus
            size="small" 
            color="light-green-lighten-1"
            icon="mdi-chevron-up" 
          >  
          </v-btn>
        </v-col>
        <v-col sm="5"class = "pa-0" align="center">
        </v-col >
      </v-row>

      <v-row  justify="center">
        <v-btn  class="mr-3"
          @click="emit('capMoinsMoins')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-double-left" 
        >  
        </v-btn>

        <v-btn class="mr-10"
          @click="emit('capMoins')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-left" 
        >  
        </v-btn>
      
        <v-btn class="mr-2"
          @click="emit('capPlus')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-right" 
        >  
        </v-btn>
        <v-btn 
          @click="emit('capPlusPlus')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-double-right" 
        >  
        </v-btn>
      </v-row>

      <v-row  justify="center">
        <v-btn   class="mb-2"
          @click="emit('pitchMoins')"
          :disabled=disabledPitchMoins
          size="small" 
          color="light-green-lighten-1"
          icon="mdi-chevron-down" 
        >  
        </v-btn>
      </v-row>

      <v-row justify="center">
        <v-col sm="4" class = "pa-0" >

        </v-col>

        <v-col sm="4"  class = "pa-0" align="center">
          <v-btn 
            @click="emit('pitchMoinsMoins')"
            :disabled=disabledPitchMMoins
            size="small" 
            color="light-green-lighten-1"
            icon="mdi-chevron-double-down" 
          >  
          </v-btn>
        </v-col>

        <v-col sm="4"class = "pa-0">
        </v-col>

      </v-row>

    </v-card-text>
  </v-card>
</div>
</template>

<script setup>

import { ref } from 'vue';

const emit = defineEmits(['zoomIn', 'zoomOut', 'pitchPlusPlus', 'pitchPlus', 'capMoinsMoins', 'capMoins', 'capPlus', 'capPlusPlus', 'pitchMoins', 'pitchMoinsMoins'])

const props = defineProps({
  disabledPitchPPlus: Boolean,
  disabledPitchPlus: Boolean,
  disabledPitchMoins: Boolean,
  disabledPitchMMoins: Boolean,
  zoom: Number,
  pitch: Number,
  cap: Number
})
</script>

<style scooped>
  #cameraContainer {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    left: 10px;
  }
  #zoom {
    min-width: 80px;
    display: inline-block;
    color: #26C6DA
  }

  #pitch {
    min-width: 100px;
    text-align: right;
    display: inline-block;
    color: #9CCC65
  }

  #cap {
    min-width: 100px;
    text-align: left;
    display: inline-block;
    color: #A1887F
  }

</style>