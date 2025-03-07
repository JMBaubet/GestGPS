<template>
  <div id="evtsWidget" >
    <v-card class="mx-auto pa-0" max-width="300" min-width="300"  color="#23374AC0">
      <v-card-text> 
        <v-row justify="center" >
          Ajouter, Modifier, Supprimer un évènement
        </v-row>    
        <v-row  justify="center">

        <v-btn  class="ma-2 text-none" min-width="80"
          @click="emit('evtPause')"
          size="medium" 
          color="grey"
          variant="outlined"
          v-tooltip="'Programmer une pause ', location='left'" 

        > Pause
        </v-btn>

        <v-btn class="ma-2 text-none " min-width="80"
          @click="emit('evtFlyTo')"
          size="small" 
          color="grey"
          variant="outlined"
          v-tooltip="'Réaliser un zoom vers un point. ', location='top'" 
        > Zoom
        </v-btn>
      
        <v-btn  class="ma-2 text-none" min-width="80"
          @click="emit('evtMarker')"
          size="small" 
          color="grey"
          variant="outlined"
          v-tooltip="'Afficher une information sous forme d\'icône', location='right'" 
        > Info.
        </v-btn>
        </v-row>

      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
const emit = defineEmits(['evtPause', 'evtFlyTo', 'evtMarker'])

</script>

<style scoped>
  #evtsWidget {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    left: 50%;
  }

</style>