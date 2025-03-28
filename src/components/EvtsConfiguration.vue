<template>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Paramétrage des pauses"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showPause ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="fnShowPause"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showPause">
          <v-divider></v-divider>
          <EvtPause
          :position
          :pauses
          :showPause
          @save-pauses="savePauses"
          @new-position="newPosition"
          ></EvtPause>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Paramétrage des vignettes"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="fnShowInfo"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showInfo">
          <v-divider></v-divider>
          <EvtInfo
            :position
            :visu
            :infos
            :longueur
            :zoom
            :cap
            :map
            :vignette
            :vignetteSize
            :showInfo
            @new-zoom="newZoom"
            @new-cap="newCap"
            @new-position="newPosition"
            @voir-vignette="voirVignette"
            @aff-vignette="affVignette"
            @saveInfos="saveInfos"

          ></EvtInfo>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn   class="text-none" text="Paramétrage des zooms"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showZoom ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="fnShowZoom"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showZoom">
          <v-divider></v-divider>
          <EvtZoom
            :position
            :zooms
            :zoom
            :cap
            :pitch
            :map
            :endFlyTo
            @new-zoom="newZoom"
            @new-cap="newCap"
            @new-pitch="newPitch"
            @new-position="newPosition"
            @voir-zoom="voirZoom"
            @save-zooms="saveZooms"
          >
          </EvtZoom>
        </div>
      </v-expand-transition>
    </v-card>


</template>

<script setup>
import EvtPause from './EvtPause.vue';
import EvtZoom from './EvtZoom.vue';
import EvtInfo from './EvtInfo.vue';
import { ref, watch } from 'vue';

const props = defineProps({
  position: Number,
  visu: Object,
  longueur: Number,
  zoom: Number,
  cap: Number,
  pitch: Number,
  endFlyTo: Boolean,
  evt: Object,
  map: Object,
  vignette: String,
  vignetteSize: Number,
})

// watch(() => props.vignetteSize, (newvalue, oldValue) => {
//   console.log(`EvtsConfiguration - vignetteSize ${props.vignetteSize}`)
// })

const emit = defineEmits(['newPosition', 'save', 'newZoom', 'newCap', 'newPitch', 'showInfo', 'showCurseur', 'voirVignette', 'affVignette', 'voirZoom', 'saveEvts'])

// Décalaration des tableaux qui reçcoivent les évènements originaux
const pauses=ref([])
const zooms=ref([])
const infos=ref([])

// Déclaration des tabelaux qui sont utilisés pour faire les sauvegardes
let pausesToSave=[]
let zoomsToSave=[]
let infosToSave=[]
let evtsToSave=[{}]

const showPause = ref(false)
const showInfo = ref(false)
const showZoom = ref(false)

// console.log(`EvtsConfiguration.vue - longueur : ${props.longueur}`)


watch(() => props.evt.length, (newvalue, oldValue) => {
  // console.table(props.evt)
  extractPauses()
  extractZooms()
  extractInfos()
})


const extractPauses = (() => {
  // console.log(`EvtsConfiguration : extractPauses`)
  for(let i = 0; i<props.evt.length; i++) {
    if( props.evt[i].type === "pause") {
      pauses.value.push(props.evt[i])
    }
  }
  pauses.value.sort(function compare(a,b) {
    if (a < b)
      return -1;
    if (a> b )
      return 1;
    return 0;
  })
  pausesToSave = [].concat(pauses.value)
  // console.table(pausesToSave)
})

const extractZooms = (() => {
  // console.log(`EvtsConfiguration : extractZooms`)
  for(let i = 0; i<props.evt.length; i++) {
    if( props.evt[i].type === "flyTo") {
      zooms.value.push(props.evt[i])
    }
  }
  zooms.value.sort(function compare(a,b) {
    if (a.start < b.start)
      return -1;
    if (a.start > b.start )
      return 1;
    return 0;
  })
  zoomsToSave = [].concat(zooms.value)
  // console.table(zoomsToSave)
})

const extractInfos = (() => {
  // console.log(`EvtsConfiguration : extractInfos`)
  for(let i = 0; i<props.evt.length; i++) {
    if( props.evt[i].type === "marker") {
      infos.value.push(props.evt[i])
    }
  }
  infos.value.sort(function compare(a,b) {
    if (a.start < b.start)
      return -1;
    if (a.start > b.start )
      return 1;
    return 0;
  })
  infosToSave = [].concat(infos.value)
  // console.table(infosToSave)
})


function newPosition(position) {
  emit('newPosition', position)
}

function affVignette(vignette) {
  emit('affVignette', vignette)
}

function voirVignette() {
  emit('voirVignette')
}

function voirZoom(zoom) {
  emit('voirZoom', zoom)
}

function savePauses(myPauses){
  // console.log(`EvtsConfiguration - savePauses`) 
  // console.table(myPauses)
  pausesToSave = [].concat(myPauses)
  // console.table(pausesToSave)
  saveEvts()
}

function saveInfos(myInfos) {
  // console.log(`EvtsConfiguration - saveInfos`) 
  infosToSave = [].concat(myInfos)
  saveEvts()
}

function saveZooms(myZooms) {
  // console.log(`EvtsConfiguration - saveZooms`) 
  zoomsToSave = [].concat(myZooms)
  saveEvts()
}

function newZoom(newZoom) {
  emit('newZoom', newZoom)
}

function newCap(newCap) {
  emit('newCap', newCap)
}

function newPitch(newPitch) {
  emit('newPitch', newPitch)
}

function fnShowInfo() {
  showInfo.value = !showInfo.value; 
  showPause.value=false; 
  showZoom.value=false
  // console.log(`EvtsConfigurationo - fnShowInfo ${showInfo.value}`)
  emit('showInfo', showInfo.value)
  emit('showCurseur', showInfo.value || showZoom.value)
}

function fnShowPause() {
  showPause.value = !showPause.value; 
  showInfo.value=false; 
  showZoom.value=false
  // console.log(`EvtsConfigurationo - fnShowPause ${showInfo.value}`)
  emit('showInfo', showInfo.value)
  emit('showCurseur', showInfo.value || showZoom.value)
}

function fnShowZoom() {
  showZoom.value = !showZoom.value; 
  showPause.value=false; 
  showInfo.value=false
  // console.log(`EvtsConfigurationo - fnShowZoom ${showInfo.value}`)
  emit('showInfo', showInfo.value)
  emit('showCurseur', showInfo.value || showZoom.value)
}

function saveEvts() {
  // console.log(`EvtsConfiguration - saveEvts`) 
  evtsToSave.length=0
  let id = 0
  for (let i=0; i<pausesToSave.length; i++) {
    evtsToSave.push({
      id :id++, 
      type: pausesToSave[i].type, 
      start: pausesToSave[i].start
    } )
  }

  for (let i=0; i<infosToSave.length; i++) {
    evtsToSave.push({
      id :id++, 
      type: infosToSave[i].type,
      start: infosToSave[i].start,
      position: infosToSave[i].position,
      end: infosToSave[i].end,
      marker: infosToSave[i].marker
    })
  }

  for (let i=0; i<zoomsToSave.length; i++) {
    evtsToSave.push({
      id :id++, 
      type: zoomsToSave[i].type,
      start: zoomsToSave[i].start,
      flyTo: zoomsToSave[i].flyTo,

    })
  }  
  
  emit('saveEvts', evtsToSave)
  // console.table(evtsToSave)

}
</script>

<style lang="css" scoped>

</style>