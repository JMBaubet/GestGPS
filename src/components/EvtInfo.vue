<template>
  <EvtPositionWidget
   :zoom
   :cap
   :map
   @new-zoom="newZoom"
   @new-cap="newCap"
  ></EvtPositionWidget>

  <v-divider class="mt-0"></v-divider>
  
  <v-row class="mx-0">
    <v-col sm="7"  class="mt-3">
      <span  style="float:right;">
        Afficher du km {{ debut }}
      </span> 
    </v-col>
    <v-col sm="5"  class="mb-1">
      <InputNumber
        :min="0"
        :max="props.longueur"
        :increment-min="1"
        :increment-max="10"
        :nombre="props.position - preVisu"
        @new-number="newDebut"
      ></InputNumber>
    </v-col>
  </v-row>

  <v-row class="ma-0">
    <v-col sm="7"  class="mt-3">
      <span  style="float:right;">
        au km {{ fin }}
     </span> 
     </v-col>
    <v-col sm="5"  class="mb-0 mt-0 pb-0">
     <InputNumber
      :min="0"
      :max="props.longueur"
      :increment-min="1"
      :increment-max="10"
      :nombre="props.position + postVisu"
      @new-number="newFin"
     ></InputNumber>
    </v-col>
  </v-row>


  <v-divider class="mt-0"></v-divider>

  <v-row class="mt-0">
    <v-col cols = "3" class="pr-0 mt-0" >
      <p id="text">Départ :</p>
    </v-col>
    <v-col cols="3"  class="pa-0 mt-0" > 
      <v-switch 
        v-model="affDepart"
        id="switchPause"
        class="pl-2"
        color="green"
        base-color="grey"
        hide-details="true"
        v-tooltip="'Sélectionnez pour avoir l\'information de départ.', location='bottom'" 
      ></v-switch>
    </v-col>
    <v-col cols = "3" class="pr-0 mt-0" >
      <p id="text">Arrivée :</p>
    </v-col>
    <v-col cols="3"  class="pa-0 mt-0" > 
      <v-switch 
        v-model="affArrivee"
        id="switchPause"
        class="pl-2"
        color="red"
        base-color="grey"
        hide-details="true"
        v-tooltip="'Sélectionnez pour avoir l\'information d\'arrivée.', location='bottom'" 
      ></v-switch>
    </v-col>

  </v-row>


  <v-row class="mt-0">
    <v-col cols = "9" class="pr-0 mt-0" >
      <p id="text">Borne tous les 10 km :</p>
    </v-col>
    <v-col cols="3"  class="pa-0 mt-0" > 
      <v-switch 
        v-model="aff10km"
        id="switchPause"
        class="pl-2"
        color="green"
        base-color="grey"
        hide-details="true"
        v-tooltip="'Sélectionnez pour avoir une information de distance tous les 10 km.', location='bottom'" 
      ></v-switch>
    </v-col>

  </v-row>



  <v-divider class="mt-0"></v-divider>

  <v-row   class="mx-0 my-1">
    <v-col sm="6"  class="my-0 pa-1">
      <v-btn v-if="isPresent"class="mb-1 text-none  ml-3" 
        :disabled=disabledAddDel
        @click="del(props.position)"
        size="small" 
        min-width="90px"
        color="red-darken-2"
      > Supprimer l'info.
      </v-btn>
      <v-btn v-else   class="mb-1 text-none ml-3" 
        :disabled=disabledAddDel
        @click="add(props.position)"
        size="small" 
        min-width="90px"
        color="green-darken-2"
      > Ajouter une info.
      </v-btn>
      </v-col>
      <v-col sm="6" class="my-0  py-0 pl-4">
      <v-btn  class="ml-2"
          @click="precedent()"
          :disabled=disabledPrecedent
          size="x-small" 
          color="grey-darken-4"
          icon="mdi-chevron-left"
          v-tooltip="'Aller à l\'information précédente', location='bottom'" 
        > 
        </v-btn>
        <v-btn  class="ml-2"
          @click="suivant()"
          :disabled=disabledSuivant
          size="x-small" 
          color="grey-darken-4"
          icon="mdi-chevron-right"
          v-tooltip="'Aller à l\'information suivante', location='bottom'" 
        > 
        </v-btn>

        <v-btn  class="ml-2 "
          @click="save()"
          size="small" 
          color="red-darken-4"
          icon="mdi-content-save-outline"
          v-tooltip="'Sauvegarder les informations', location='bottom'" 
        > 
        </v-btn>

   </v-col> 


  </v-row>   



</template>

<script setup>
import InputNumber from './InputNumber.vue';
import EvtPositionWidget from './EvtPositionWidget.vue';
import { ref, watch } from 'vue';
import { de } from 'vuetify/locale';

const props = defineProps({
  position: Number,
  longueur: Number,
  infos: Object,
  zoom:Number,
  cap: Number,
  map: Object,
})

const emit = defineEmits(['newPosition', 'save', 'newZoom', 'newCap'])

const preVisu = parseInt(import.meta.env.VITE_EVT_INFO_PRE_VISU)
const postVisu = parseInt(import.meta.env.VITE_EVT_INFO_POST_VISU)


const mask = ref(false)
const distance = ref(0)
const isPresent = ref(true)
const debut = ref(0)
const fin = ref(0)
const affDepart = ref(true)
const affArrivee = ref(true)
const aff10km = ref(true)
const disabledAddDel = ref(false)
const disabledPrecedent = ref(false)
const disabledSuivant = ref(false)

console.log(`EvtInfo.vue - longueur : ${props.longueur}`)


debut.value = (props.position - preVisu) / 10
if (debut.value < 0) debut.value = 0
fin.value = (props.position + postVisu) / 10
if (fin.value*10  >  props.distance) fin.value = props.distance/10

watch(() => props.position, (newvalue, oldValue) => {
  console.log(`EvtInfo - watch props.position : ${props.position} ${typeof(postVisu)}`)

  debut.value = (props.position - preVisu) / 10
  if (debut.value < 0 ) debut.value=0

  fin.value = (props.position + postVisu) / 10
  console.log(`Fin : ${fin.value}`)
  if (fin.value*10 > props.longueur )  fin.value=props.longueur/10
})


function newDebut(number) {
  console.log(`newDebut : ${number}`)
  debut.value=number/10
}

function newFin(number) {
  console.log(`newFin : ${number}`)
  fin.value=number/10
}

function positionInfo() {

}

function newZoom(newZoom) {
  console.log(`EvtInfo - newZoom : ${newZoom}`)
  emit('newZoom', newZoom)
}

function newCap(newCap) {
  console.log(`EvtInfo - newCap : ${newCap}`)
  emit('newCap', newCap)  
}


function save() {
  // recupration des coordonnées du curseur
  const coordonnees = props.map.getCenter()

}
</script>


<style scoped>
#switchPause, .v-input--density-default {
    --v-input-control-height: 43px;
}



  #text {
    text-align: end;
  }
 
  #distance {
    text-align: right
  }
</style>
