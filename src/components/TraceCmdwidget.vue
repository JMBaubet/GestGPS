<template>
  <div id="traceContainer" >
  <v-card class="mx-auto"  min-width="300"  color="#23374AC0">
    <v-card-text> 
      <v-row justify="start" class="pl-0">
        <v-col cols="auto">
          <span id="distance">
            Distance : {{ distance }} km
          </span> 
          <span id="pov">
            Point de vue
          </span> 

          <v-btn   class="ml-2"
            @click="emit('previousRef')"
            :disabled=disabledPreviousRef
            size="x-small" 
            color="deep-orange-lighten-1"
            icon="mdi-chevron-left"
            v-tooltip="'Point de vue précédent', location='top'" 
          >          
          </v-btn>

          <v-btn   class="ml-2"
            @click="emit('nextRef')"
            :disabled=disabledNextRef
            size="x-small" 
            color="deep-orange-lighten-1"
            icon="mdi-chevron-right" 
            v-tooltip="'Point de vue suivant', location='top'" 
          >  
          </v-btn>

          <v-btn   class="ml-2"
            @click="emit('lastRef')"
            :disabled=disabledLastRef
            size="x-small" 
            color="deep-orange-lighten-1"
            icon="mdi-chevron-double-right" 
            v-tooltip="'Dernier point de vue', location='top'" 
          >  
          </v-btn>

          <v-btn   class="ml-2"
            @click="emit('reloadRef')"
            :disabled=disabledReloadRef
            size="x-small" 
            color="deep-orange-lighten-1"
            icon="mdi-reload"
            v-tooltip="'Réinitialiser le point de vue', location='top'" 
          >          
          </v-btn>

          <v-btn   v-if="reference" class="ml-2"
            @click="emit('delRef')"
            size="x-small" 
            color="deep-purple-lighten-1"
            icon="mdi-minus"
            v-tooltip="'Supprimer le point de vue', location='top'" 
          >          
          </v-btn>

          <v-btn   v-else class="ml-2"
            @click="emit('addRef')"
            size="x-small" 
            color="deep-orange-lighten-1"
            icon="mdi-plus"
            v-tooltip="'Ajouter le point de vue', location='top'" 
          >          
          </v-btn>

          <v-btn   class="ml-2"
            @click="emit('saveRef')"
            :disabled=disabledSaveRef
            size="x-small" 
            color="red-darken-3"
            icon="mdi-content-save-outline"
            v-tooltip="'Sauvegarder le scénario', location='top'" 
          >          
          </v-btn>


        </v-col>
      </v-row>    


      <v-row  justify="center">
        <v-btn  class="ma-2 text-none" 
          @click="emit('depart')"
          :disabled=disabledDepart
          size="small" 
          color="yellow-darken-2"
        > Départ  
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('moinsMille')"
          :disabled=disabledM1k
          size="small" 
          color="yellow-darken-2"
        > -1 km  
        </v-btn>
      
        <v-btn  class="ma-2 text-none"
          @click="emit('moinsCent')"
          :disabled=disabledM100
          size="small" 
          color="yellow-darken-2"
        > -100m
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('plusCent')"
          :disabled=disabledP100
          size="small" 
          color="yellow-darken-2"
        > +100m  
        </v-btn>
        <v-btn  class="ma-2 text-none"
        @click="emit('plusMille')"
        :disabled=disabledP1k
        size="small" 
        color="yellow-darken-2"
        > +1 km  
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('arrivee')"
          :disabled=disabledArrivee
          size="small" 
          color="yellow-darken-2"
        > Arrivée  
        </v-btn>
      </v-row>

    </v-card-text>
  </v-card>
</div>
</template>

<script setup>

import { ref } from 'vue';

const emit = defineEmits(['previousRef', 'nextRef', 'lastRef', 'reloadRef', 'addRef', 'delRef', 'saveRef',
'depart', 'moinsMille', 'moinsCent', 'plusCent', 'plusMille', 'arrivee'])

const props = defineProps({
  disabledPreviousRef: Boolean,
  disabledNextRef: Boolean,
  disabledLastRef: Boolean,
  disabledSaveRef: Boolean,
  disabledReloadRef: Boolean,
  disabledDepart: Boolean,
  disabledM1k: Boolean,
  disabledM100: Boolean,
  disabledP100: Boolean,
  disabledP1k: Boolean,
  disabledArrivee: Boolean,
  distance: Number,
  reference: Boolean
})

</script>

<style scooped>
  #traceContainer {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    left: 330px ;
  }

#distance {
  min-width: 150px;
  display: inline-block;
  color: #FBC02D
}

#pov {
  min-width: 60px;
  display: inline-block;
  color: #ff7043
}

#ref {
  width: 115px;
  text-align: center;
}


</style>