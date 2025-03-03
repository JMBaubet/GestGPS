<template>
  <div id="mapCmd" >
  <v-card class="mx-auto"  color="#23374A00"> 
    <v-card-text> 
      <v-row justify="start" class="pl-0">
        <div v-if="disabledPlayPause">
          <v-btn class="ml-2"
            size="large" 
            color="#00000000"
            icon="" 
          > </v-btn>
        </div>
        <div v-else>
          <v-btn v-if="pause" class="ml-2"
            @click="emit('playPause')"
            :disabled=disabledPlayPause
            size="large" 
            color="cyan-darken-1"
            icon="mdi-play" 
          >  
          </v-btn>
          <v-btn  v-else class="ml-2"
            @click="emit('playPause')"
            :disabled=disabledPlayPause
            size="large" 
            color="deep-orange-lighten-1"
            icon="mdi-pause" 
          >  
          </v-btn>
        </div>
        <div id="reprise">
          <v-btn v-if="disabledReprise"  class="ml-2"
            size="large" 
            color="#00000000"
            icon="" 
          >  
          </v-btn>
          <v-btn v-else class="ml-2"
            
            @click="emit('reprise')"
            :disabled=disabledReprise            
            size="large" 
            color="red-accent-4"
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

import { ref } from 'vue';

const emit = defineEmits(['playPause', 'reprise'])

const props = defineProps({
  pause: Boolean,
  disabledPlayPause: Boolean,
  disabledReprise: Boolean
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