<template>
    <p align="center" class="font-weight-thin">Gestion de la caméra.</p>  

  <v-row justify="center" class="mt-1 ml-1">
    <v-col sm="3" class="mt-2"> 
      <span id="zoom" >
        Zoom : {{ zoomActif }}
      </span> 
      </v-col>
      <v-col sm="9">
      <v-btn class="ml-7"
        @click="changeZoom(0.5)"
        :disabled=disabledZoomIn
        color="cyan-lighten-1"
        size="small" 
        icon="mdi-magnify-plus" 
      >  
      </v-btn>

      <v-btn class="ml-2"
      @click="changeZoom(-0.5)"
      :disabled=disabledZoomOut
        size="small" 
        color="cyan-lighten-1"
        icon="mdi-magnify-minus" 
      >  
      </v-btn>
    </v-col>
  </v-row>


  <v-row  justify="center" class="ml-1">
    <v-col sm="5"  >
      <span id="pitch">
        Pitch : {{ pitchActif }}°
      </span> 
    </v-col>
    <v-col sm="2" class = "pa-0" align="center">
      <v-btn 
        @click="changePitch(5)"
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

  <v-row  justify="center"  class="ml-1">
    <v-col sm="5"  >
      <span id="cap">
        Cap : {{ capActif }}° 
      </span> 
    </v-col>
    <v-col sm="2" class = "pa-0" align="center">
      <v-btn class="mt-1"
        @click="changePitch(1)"
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

  <v-row  justify="center"  class="ml-1">
    <v-btn  class="mr-3"
      @click="changeCap(-10)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-double-left" 
    >  
    </v-btn>

    <v-btn class="mr-2"
      @click="changeCap(-2)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-left" 
    >  
    </v-btn>

    <v-btn class="mr-2 mt-1"
      @click="changeCap(0)"
      size="x-small" 
      color="brown-lighten-2"
      icon="mdi-navigation" 
    >  
    </v-btn>
  
    <v-btn class="mr-2"
      @click="changeCap(+2)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-right" 
    >  
    </v-btn>
    <v-btn 
      @click="changeCap(+10)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-double-right" 
    >  
    </v-btn>
  </v-row>

  <v-row  justify="center"  class="ml-1">
    <v-btn   class="mb-2"
      @click="changePitch(-1)"
      :disabled=disabledPitchMoins
      size="small" 
      color="light-green-lighten-1"
      icon="mdi-chevron-down" 
    >  
    </v-btn>
  </v-row>

  <v-row justify="center" class="mb-2 ml-1">
    <v-col sm="4" class = "pa-0" >
    </v-col>
    <v-col sm="4"  class = "pa-0" align="center">
      <v-btn 
        @click="changePitch(-5)"
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

</template>

<script setup>

import { ref, watchEffect } from 'vue';

const emit = defineEmits(['newZoom', 'newPitch', 'newCap'])

const props = defineProps({
  zoom: Number,
  pitch: Number,
  cap: Number
})


const zoomActif = ref(props.zoom)
const disabledZoomIn = ref(false)
const disabledZoomOut = ref(false)

const pitchActif = ref(props.pitch)
const disabledPitchPPlus  = ref(false)
const disabledPitchPlus  = ref(false)
const disabledPitchMoins = ref(false)
const disabledPitchMMoins = ref(false)

const capActif = ref(props.cap)

watchEffect(() => {
  zoomActif.value = props.zoom
  pitchActif.value = props.pitch
  capActif.value = props.cap
})


function changeZoom(delta) {
  console.log(`changeZoom : ${delta}`)
  switch(delta) {
    case 0.5:
      disabledZoomOut.value = false
      zoomActif.value+=delta
      if (zoomActif.value === 20) {
        disabledZoomIn.value = true
      } 
      break
    case -0.5:
     disabledZoomIn.value = false
      zoomActif.value+=delta
      if (zoomActif.value === 2) {
        disabledZoomOut.value = true
      } 
      break
  }
  console.log(zoomActif.value)
  emit('newZoom', zoomActif.value)
}


function changePitch(delta) {
  console.log(`changePitch : ${delta}`)
  switch(delta) {
    case 5:
    case 1:
      disabledPitchMoins.value = false
      disabledPitchMMoins.value = false
      pitchActif.value += delta
      if (pitchActif.value >= 85) {
        pitchActif.value = 85
        disabledPitchPlus.value = true
        disabledPitchPPlus.value = true
      }
      break;
    case -1:
    case -5:
      disabledPitchPPlus.value = false
      disabledPitchPlus.value = false
      pitchActif.value += delta
      if (pitchActif.value <= 0) {
        pitchActif.value = 0
        disabledPitchMoins.value = true
        disabledPitchMMoins.value = true
      }
      break;
  }
  console.log(pitchActif.value)
  emit('newPitch', pitchActif.value)
}

function changeCap(delta) {
  console.log(`changeCap : ${delta}`)
  switch(delta) {
    case 10:
    case 2:
      capActif.value+=delta
      if (capActif.value > 180) capActif.value = capActif.value - 360
      break;
    case -2:
    case -10:
      capActif.value +=delta
      if (capActif.value <= -180) capActif.value = capActif.value + 360
      break;
    case 0:
      capActif.value=0
      break;
  }
  console.log(capActif.value)
  emit('newCap', capActif.value)

}


</script>

<style scooped>
  #zoom {
    min-width: 100px;
    text-align: left;
    display: inline-block;
    color: #26C6DA
  }

  #pitch {
    min-width: 100px;
    text-align: left;
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