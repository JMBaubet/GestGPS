<template>
  <div id="mapCmd" v-show="showBtn">
  <v-card class="mx-auto"  color="#23374A00"> 
    <v-card-text> 
      <v-row justify="start" class="pl-0">
        <div id="reprise">
          <v-btn  class="ml-2" v-show="showArriere"            
            @click="emit('arriere')"
            size="large" 
            color="cyan-darken-1"
            icon="mdi-chevron-left" 
          >  
          </v-btn>
        </div>
        <div >
          <v-btn v-if="btnPlayPause === 'run'" class="ml-2"
            @click="emit('playPause')"
            size="large" 
            color="cyan-darken-1"
            icon="mdi-play" 
          >  
          </v-btn>
          <v-btn  v-else-if="btnPlayPause === 'pause'" class="ml-2"
            @click="emit('playPause')"
            size="large" 
            color="deep-orange-lighten-1"
            icon="mdi-pause" 
          >  
          </v-btn>
          <v-btn  v-else class="ml-2"
            @click="emit('playPause')"
            size="large" 
            color="green-lighten-1"
            icon="mdi-restart" 
          >  
          </v-btn>
        </div>
      </v-row>    
    </v-card-text>
  </v-card>
</div>
</template>

<script setup>

import { ref, watch } from 'vue';

const emit = defineEmits(['playPause', 'reprise', 'arriere'])

const props = defineProps({
  etat: String,
})

const showBtn=ref(false)
const showArriere=ref(false)
const btnPlayPause=ref("run")

watch(() => props.etat, (newValue, oldValue) => {
  // console.log(`etat :${ props.etat}`)
  switch(props.etat) {
    case  "init" :
      showArriere.value = false
      btnPlayPause.value = "run"
    break
    case  "run" :
      showBtn.value = true
      showArriere.value = true
      btnPlayPause.value = "pause"
    break
    case  "pause" :
      showBtn.value = true
      showArriere.value = true
      btnPlayPause.value = "run"
    break
    case  "flyto" :
     showBtn.value = false
     showArriere.value = false
     btnPlayPause.value = "run"
     break
    case  "wait" :
      showBtn.value = true
      showArriere.value = false
      btnPlayPause.value = "run"
    break
    case  "end" :
      showBtn.value = true
      showArriere.value = false
      btnPlayPause.value = "restart"
    break
    default :

  }



})

</script>

<style scooped>
  #mapCmd {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  10px;
    left: 50% ;
    transform: translateX(-50%);
  }

</style>