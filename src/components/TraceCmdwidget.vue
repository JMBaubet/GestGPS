<template>
  <div id="traceContainer" >
  <v-card class="mx-auto"  min-width="300"  color="#23374AC0">
    <v-card-text> 
      <v-row justify="center">
        Avancement de la trace : {{ distance }} km 
      </v-row>    


      <v-row  justify="center">
        <v-btn  class="ma-2 text-none" 
          @click="emit('depart')"
          :disabled=disabledDepart
          size="small" 
        > Départ  
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('moinsMille')"
          :disabled=disabledM1k
          size="small" 
        > -1 km  
        </v-btn>
      
        <v-btn  class="ma-2 text-none"
          @click="emit('moinsCent')"
          :disabled=disabledM100
          size="small" 
        > -100m
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('plusCent')"
          :disabled=disabledP100
          size="small" 
        > +100m  
        </v-btn>
        <v-btn  class="ma-2 text-none"
        @click="emit('plusMille')"
        :disabled=disabledP1k
        size="small" 
        > +1 km  
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('arrivee')"
          :disabled=disabledArrivee
          size="small" 
        > Arrivée  
        </v-btn>
      </v-row>

    </v-card-text>
  </v-card>
</div>
</template>

<script setup>

import { ref } from 'vue';

const emit = defineEmits(['depart', 'moinsMille', 'moinsCent', 'plusCent', 'plusMille', 'arrivee'])

const props = defineProps({
  disabledDepart: Boolean,
  disabledM1k: Boolean,
  disabledM100: Boolean,
  disabledP100: Boolean,
  disabledP1k: Boolean,
  disabledArrivee: Boolean,
  distance: Number
})

</script>

<style >
  #traceContainer {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    left: 330px ;
  }



</style>