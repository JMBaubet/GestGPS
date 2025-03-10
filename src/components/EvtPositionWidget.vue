<template>

  <v-row  class="ma-0">
    <v-col cols="4" class="mt-2 mb-0"> 
      <span id="zoom" >
        Zoom : {{ zoomActif }}
      </span> 
    </v-col>

     <v-col cols="5" class="px-0 mt-0" > 
      <v-btn class="ml-2"
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
    <v-col cols="3" class="mt-0"> </v-col>
  </v-row>


  <v-row  justify="center">
    <v-col sm="5"  >
    </v-col>
    <v-col sm="2" class = "pa-0" align="center">
      <v-btn 
        @click="deplacement(-100)"
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
    </v-col>
    <v-col sm="2" class = "pa-0" align="center">
      <v-btn class="mt-1"
        @click="deplacement(-10)"
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
      @click="changeCap(-10)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-double-left" 
    > </v-btn>

    <v-btn class="mr-10"
      @click="changeCap(-3)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-left" 
    > </v-btn>
  
    <v-btn class="mr-2"
      @click="changeCap(3)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-right" 
    > </v-btn>
    <v-btn 
      @click="changeCap(10)"
      size="small" 
      color="brown-lighten-2"
      icon="mdi-chevron-double-right" 
    > </v-btn>
  </v-row>

  <v-row  justify="center">
    <v-btn   class="mb-2"
      @click="deplacement(10)"
      size="small" 
      color="light-green-lighten-1"
      icon="mdi-chevron-down" 
    > </v-btn>
  </v-row>

  <v-row justify="center">
    <v-col sm="4" class = "pa-0" ></v-col>

    <v-col sm="4"  class = "pa-0 mb-4" align="center">
      <v-btn 
        @click="deplacement(100)"
        size="small" 
        color="light-green-lighten-1"
        icon="mdi-chevron-double-down" 
      > </v-btn>
    </v-col>

    <v-col sm="4"class = "pa-0">
    </v-col>
  </v-row>
</template>

<script setup>

import { ref, watch } from 'vue';

const props = defineProps({
  zoom: Number,
  cap: Number,
  map: Object,
})

const emit = defineEmits(['newZoom', 'newCap'])

const disabledZoomIn = ref(false)
const disabledZoomOut = ref(false)
const zoomActif=ref(props.zoom)
const capActif=ref(props.cap)




watch(() => props.zoom, (newvalue, oldValue) => {
  zoomActif.value = props.zoom
})

watch(() => props.cap, (newvalue, oldValue) => {
  capActif.value = props.cap
})

function changeZoom(delta) {
  console.log(`EvtPositionWidget - changeZoom : ${delta}`)
  // console.log(`changeZoom : ${delta}`)
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
  emit('newZoom', zoomActif.value)
}

function changeCap(delta) {
  console.log(`EvtPositionWidget - changeCap : ${delta}`)
  // console.log(`changeCap : ${delta}`)
  switch(delta) {
    case 10:
    case 3:
      capActif.value+=delta
      if (capActif.value > 180) capActif.value = capActif.value - 360
      break;
    case -3:
    case -10:
      capActif.value +=delta
      if (capActif.value <= -180) capActif.value = capActif.value + 360
      break;
    case 0:
      capActif.value=0
      break;
  }
  emit('newCap', capActif.value)  
}

function deplacement(delta) {
  console.log(`EvtPositionWidget - deplacement : ${delta}`)
  props.map.panBy([0, delta, {easing: capActif.value}])
}


</script>

<style scooped>
</style>