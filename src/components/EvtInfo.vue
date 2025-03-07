<template>
  <div v-if="mask === true">

  </div>
  <div v-else id="evtPause" >
    <v-card class="mx-auto pa-0" max-width="320" min-width="320"  color="#23374AC0">
      <v-card-text>


        <v-row justify="center" >
          Gestion des informations
        </v-row>    

        <v-divider class="my-4"></v-divider>
        <v-row>
          <v-col cols = "3" class="pr-0">
            <p id="text">Départ :</p>
          </v-col>
          <v-col cols="3"  class="pa-0 ma-0"> 
            <v-switch 
              id="switchPause"
              class="pl-2"
              color="green"
              base-color="red"
              hide-details="true"
              v-tooltip="'Sélectionnez pour afficher l\'icône du point de départ.', location='top'" 
            ></v-switch>
          </v-col>
          <v-col cols = "3" class="pr-0">
            <p id="text">Arrivée :</p>
          </v-col>
          <v-col cols="3"  class="pa-0 ma-0"> 
            <v-switch 
              id="switchPause"
              class="pl-2"
              color="green"
              base-color="red"
              hide-details="true"
              v-tooltip="'Sélectionnez pour afficher l\'icône du point d\'arrivée.', location='top'" 
            ></v-switch>
          </v-col>

        </v-row>




        <v-row>
          <v-col cols = "9" class="pr-0">
            <p id="text">info distance tous les  10Km :</p>
          </v-col>
          <v-col cols="3"  class="pa-0 ma-0"> 
            <v-switch 
              id="switchPause"
              class="pl-2"
              color="green"
              base-color="red"
              hide-details="true"
              v-tooltip="'Sélectionnez pour afficher l\'icône du point de départ.', location='top'" 
            ></v-switch>
          </v-col>

        </v-row>
        <v-divider class="my-4"></v-divider>



        <v-row>

          <v-card class="mx-auto pa-0" max-width="300" min-width="300"  color="#23374A00">
    <v-card-text>


      <v-row justify="center" >
        Position de l'icone
      </v-row>    

      <v-row justify="center">
        <v-col cols="auto"> 

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
        </v-col>
        <v-col sm="2" class = "pa-0" align="center">
          <v-btn 
            @click="emit('avanceP')"
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
            @click="emit('avance')"
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
          @click="emit('capChangeLL')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-double-left" 
        >  
        </v-btn>

        <v-btn class="mr-10"
          @click="emit('capChangeL')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-left" 
        >  
        </v-btn>
      
        <v-btn class="mr-2"
          @click="emit('capChangeR')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-right" 
        >  
        </v-btn>
        <v-btn 
          @click="emit('capChangeRR')"
          size="small" 
          color="brown-lighten-2"
          icon="mdi-chevron-double-right" 
        >  
        </v-btn>
      </v-row>

      <v-row  justify="center">
        <v-btn   class="mb-2"
          @click="emit('recule')"
          size="small" 
          color="light-green-lighten-1"
          icon="mdi-chevron-down" 
        >  
        </v-btn>
      </v-row>

      <v-row justify="center">
        <v-col sm="4" class = "pa-0" >

        </v-col>

        <v-col sm="4"  class = "pa-0 mb-4" align="center">
          <v-btn 
            @click="emit('reculeP')"
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
  </v-row>





        <v-row id="pauseInput" >
          <v-col cols = "4" class="pr-0">
            <p id="text">Distance :</p>
          </v-col>
          <v-col cols="8"  class="pa-0 ma-0"> 
            <InputNumber
            :incrementMin=0.1
            :incrementMax=1
            :nombre=distance
              :min=0
              :max=21
            >
            </InputNumber>
          </v-col>
        </v-row>

        <v-row id="pauseInput" >
          <v-col cols = "4" class="pr-0">
            <p id="text">Fin :</p>

          </v-col>
          <v-col cols="8"  class="pa-0 ma-0"> 
            <InputNumber
            :incrementMin=0.1
            :incrementMax=1
            :nombre=distance
              :min=0
              :max=21
            >
            </InputNumber>
          </v-col>
        </v-row>
        <v-divider class="mb-2 mt-4"></v-divider>
        <v-row  justify="end">
        <v-btn  class="ma-2 text-none" 
          @click="emit('del')"
          :disabled=disabledDepart
          size="small" 
          min-width="90px"
          color="red-darken-2"
        > Supprimer  
        </v-btn>

        <v-btn class="ma-2 text-none"
          @click="emit('add')"
          :disabled=disabledM1k
          size="small" 
          min-width="90px"
          color="green-darken-2"
        > Ajouter
        </v-btn>
        </v-row>

        
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import InputNumber from './InputNumber.vue';
import EvtPositionWidget from './EvtPositionWidget.vue';
import { ref } from 'vue';

const mask = ref(false)
const distance = ref(15.1)

function ajout() {
  console.log(`Ajout`)
}
function sub() {
  console.log(`Sub`)
}

</script>

<style scoped>


#switchPause, .v-input--density-default {
    --v-input-control-height: 43px;
}

  #evtPause {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    right: 10px;

  }

  #text {
    text-align: end;
  }

</style>
