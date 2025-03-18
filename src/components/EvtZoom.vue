<template>
  <EvtPositionWidget
    :showPitch="true"
    :zoom
    :cap
    :pitch
    :map
    @new-zoom="newZoom"
    @new-cap="newCap"
    @new-pitch="newPitch"
  ></EvtPositionWidget>
  <v-divider class="mt-2"></v-divider>




    <v-row class="mx-2 mt-1 " justify="space-between">
    <v-col class="text-left">
      <span class="subheading font-weight-light me-1">Durée de l'annimation :</span>
      <span class="text-h7 font-weight-light" >{{duree}} sec.</span>
    </v-col>
  </v-row>

  <v-slider 
    class="mx-4 mb-0" 
    v-model="duree" 
    :step="0.5" 
    :color
    max="10" 
    min="0.5" 
    hide-details="true"
  >
  </v-slider>

  <v-divider class="mt-0"></v-divider>

  <v-row   class="mx-0 my-1">
    <v-col sm="3"  class="my-0 pa-1">
      <v-btn v-if="isFlyingTo" class="my-1 text-none  ml-3" 
        :disabled=disabledVoirRetour
        @click="retour"
        size="small" 
        min-width="70px"
        color="deep-purple-darken-1"
      > Retour
      </v-btn>
      <v-btn v-else class="my-1 text-none  ml-3" 
        :disabled=disabledVoirRetour
        @click="voirZoom()"
        size="small" 
        min-width="70px"
        color="primary"
      > Voir
      </v-btn>
    </v-col>


    <v-col sm="3"  class="my-0 pa-1">
      <v-btn v-if="isPresent"class="my-1 text-none  ml-3" 
        :disabled=disabledAddDel
        @click="del()"
        size="small" 
        min-width="80px"
        color="red-darken-2"
      > Supprimer
      </v-btn>
      <v-btn v-else   class="my-1 text-none ml-3" 
        :disabled=disabledAddDel
        @click="add()"
        size="small" 
        min-width="80px"
        color="green-darken-2"
      > Ajouter
      </v-btn>
    </v-col> 

    <v-col sm="6" class="my-0  py-1 pl-4">
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
import EvtPositionWidget from './EvtPositionWidget.vue';
import { ref, watch, computed } from 'vue';

const props = defineProps({
  position: Number,
  zooms: Object,
  zoom:Number,
  cap: Number,
  pitch: Number,
  map: Object,
  endFlyTo: Boolean,
})

const emit = defineEmits(['newZoom', 'newCap', 'newPitch', 'newPosition', 'voirZoom', 'saveZooms'])


const disabledAddDel = ref(false)
const distance = ref(props.position/10)
const isPresent = ref(true)
const disabledVoirRetour = ref(true)
const isFlyingTo = ref(false)
const disabledPrecedent = ref(false)
const disabledSuivant = ref(false)
const duree = ref(5)

let myZooms = []

const color = computed(() => {
    if (duree.value < 2) return 'red-darken-2'
    if (duree.value < 4) return 'orange-darken-2'
    if (duree.value < 7.5) return 'green-darken-2'
    if (duree.value < 8.5) return 'orange-darken-2'
    return 'red-darken-2'
  })


watch(() => props.position, (newValue, oldValue) => {
  console.log(`EvtZoom - watch props.position : ${props.position}`)
  distance.value = props.position / 10
  majBtn()
})

watch(() => props.zooms.length, (newValue, oldValue)=> {
  initMyZooms()
})

watch(() => props.endFlyTo, (newValue, oldValue)=> {
  disabledVoirRetour.value = false
})




function newZoom(newZoom) {
  console.log(`EvtZoom - newZoom : ${newZoom}`)
  emit('newZoom', newZoom)
}

function newCap(newCap) {
  console.log(`EvtZoom - newCap : ${newCap}`)
  emit('newCap', newCap)  
}

function newPitch(newPitch) {
  console.log(`EvtZoom - newPitch : ${newPitch}`)
  emit('newPitch', newPitch)  
}

function initMyZooms() {
  myZooms.length = 0
  myZooms = [].concat(props.zooms)
  // console.table(myZooms)
  majBtn()
}



function voirZoom() {
  // Il faut modifier le bouton voir... pour faire le retour 
  let i= 0 
  disabledVoirRetour.value=true
  isFlyingTo.value=true
  while (i < myZooms.length) {
      // if (myInfos[i].position < props.position) disabledPrecedent.value = false
      // if (myInfos[i].position > props.position) disabledSuivant.value = false
      if (myZooms[i].start === props.position) {
        emit('voirZoom', myZooms[i].flyTo)
        break
      }
      i++
    }
}


function retour() {
  emit('newPosition', props.position); 
  isFlyingTo.value = false
}

function add() {
    // console.log(`EvtZoom : add`)
    let zoom = {}
    let flyTo = {}
  
    zoom.type = 'flyTo'
    zoom.start = props.position
    flyTo.cap = props.cap
    // flyTo.coord = props.map.getCenter()
    flyTo.coord = [props.map.getCenter().lng, props.map.getCenter().lat] 
    flyTo.duree = duree.value
    flyTo.pitch = props.pitch
    flyTo.zoom = props.zoom
    zoom.flyTo = flyTo
    myZooms.push(zoom)

    myZooms.sort(function compare(a,b) {
      if (a.start < b.start)
        return -1;
      if (a.start > b.start )
        return 1;
      return 0;
    })


    isPresent.value = true
    console.table(myZooms)
    majBtn()
  }


function del() {
    // console.log(`EvtZoom : del : ${props.position}`)
    let i = 0
  while (i < myZooms.length) {
    if (myZooms[i].start === props.position) {
      myZooms.splice(i,1)
      isPresent.value = false
      break
    }
    i++
  }
  emit('newPosition', props.position) // #TODO voir pourquoi origine EvtInfo
  console.table(myZooms)
  majBtn()
}

function precedent() {
  // console.log(`EvtZoom : precedent`)
  let i = myZooms.length - 1
  while (myZooms[i].start >= props.position)
    i--
  emit('newPosition', myZooms[i].start)
  // console.log(`On va vers ${myZooms[i].start}`)
}

function suivant() {
  console.log(`EvtZoom : suivant`)
  let i = 0
  while (myZooms[i].start <= props.position) i++
  emit('newPosition', myZooms[i].start)
  // console.log(`On va vers ${myZooms[i].start}`)
}




function majBtn() {
  // console.log(`EvtZoom.vue - majBtn : ${props.position}`)
  let i=0
  disabledPrecedent.value=true
  disabledSuivant.value=true
  disabledVoirRetour.value=true
  isFlyingTo.value=false
  // disabledAddDel.value=true
  isPresent.value=false
  duree.value=5

  while (i < myZooms.length) {
    if (myZooms[i].start < props.position) disabledPrecedent.value = false
    if (myZooms[i].start > props.position) disabledSuivant.value = false
    i++
  } 
  
  i=0
  while (i < myZooms.length) {
    if (myZooms[i].start === props.position) {
      console.log(`EvtZoom.vue - majBtn : Position trouvée !`)
      duree.value = myZooms[i].flyTo.duree
      isPresent.value = true
      disabledVoirRetour.value=false
      // disabledAddDel.value=false
      break
    } 
    i++
  }
}


function save() {
    console.log(`EvtZoom.vue - save `)
    emit('saveZooms', myZooms)
  }


</script>

<style scoped>


</style>
