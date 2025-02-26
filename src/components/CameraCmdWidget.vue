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
            @click="zoomIn()"
            :disabled=disabledZoomIn
            color="cyan-lighten-1"
            size="small" 
            icon="mdi-magnify-plus" 
          >  
          </v-btn>

          <v-btn class="ml-2"
          @click="zoomOut()"
          :disabled=disabledZoomOut
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
            @click="pitchPlusPlus()"
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
            @click="pitchPlus()"
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
          @click="pitchMoins()"
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
            @click="pitchMoinsMoins()"
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
  zoom: Number,
  pitch: Number,
  cap: Number
})

const disabledZoomIn = ref(false)
const disabledZoomOut = ref(false)
const disabledPitchPPlus  = ref(false)
const disabledPitchPlus  = ref(false)
const disabledPitchMoins = ref(false)
const disabledPitchMMoins = ref(false)


function zoomIn() {
  if (props.zoom === 19.5) { disabledZoomIn.value = true}
  disabledZoomOut.value = false
  emit('zoomIn')
}

function zoomOut() {
  if (props.zoom === 2.5) { disabledZoomOut.value = true}
  disabledZoomIn.value = false
  emit('zoomOut')
}

function pitchPlusPlus() {
  if (props.pitch >= 76) { disabledPitchPPlus.value = true}
  if (props.pitch >= 84) { disabledPitchPlus.value = true}
  disabledPitchMoins.value = false
  disabledPitchMMoins.value = false
  emit('pitchPlusPlus')  
}

function pitchPlus() {
  if (props.pitch >= 80) { disabledPitchPPlus.value = true}
  if (props.pitch >= 84) { disabledPitchPlus.value = true}
  disabledPitchMoins.value = false
  if (props.pitch >= 4) { disabledPitchMMoins.value = false}
  emit('pitchPlus')
}

function pitchMoins() {
  if (props.pitch === 1) {disabledPitchMoins.value=true}
  if (props.pitch === 5) {disabledPitchMMoins.value=true}
  if (props.pitch === 81 ) disabledPitchPPlus.value = false
  disabledPitchPlus.value = false
  emit('pitchMoins')
}

function pitchMoinsMoins() {
  if (props.pitch === 0) {disabledPitchMoins.value=true}
  if (props.pitch <= 9) {disabledPitchMMoins.value=true}
  disabledPitchPlus.value = false
  disabledPitchPPlus.value = false
  emit('pitchMoinsMoins')
}
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