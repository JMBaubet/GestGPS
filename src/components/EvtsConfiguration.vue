<template>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Gestion des pauses"></v-btn>
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
          @save="savePauses"
          @new-position="newPosition"
          ></EvtPause>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Gestion des informations"></v-btn>
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
            :longueur
            :zoom
            :cap
            :map
            @new-zoom="newZoom"
            @new-cap="newCap"
          ></EvtInfo>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn   class="text-none" text="Gestion des zooms"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showZoom ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="fnShowZoom"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showZoom">
          <v-divider></v-divider>
          <EvtZoom>

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
  longueur: Number,
  zoom: Number,
  cap: Number,
  evt: Object,
  map: Object,
})

const emit = defineEmits(['newPosition', 'save', 'newZoom', 'newCap', 'showInfo', 'showCurseur'])

// Décalaration des tableaux qui reçcoivent les évènements originaux
const pauses=ref([])
const zooms=ref([])
const infos=ref([])

// Déclaration des tabelaux qui sont utilisés pour faire les sauvegardes
let pausesToSave=[]
let zoomsToSave=[]
let infosToSave=[]

const showPause = ref(false)
const showInfo = ref(false)
const showZoom = ref(false)

console.log(`EvtsConfiguration.vue - longueur : ${props.longueur}`)


watch(() => props.evt.length, (newvalue, oldValue) => {
  console.table(props.evt)
  extractPauses()
  extractZooms()
  extractInfos()
})


const extractPauses = (() => {
  console.log(`EvtsConfiguration : extractPauses`)
  for(let i = 0; i<props.evt.length; i++) {
    if( props.evt[i].type === "pause") {
      pauses.value.push(props.evt[i].start)
    }
  }
  pauses.value.sort(function compare(a,b) {
    if (a < b)
      return -1;
    if (a> b )
      return 1;
    return 0;
  })
  // console.table(pauses.value)
})

const extractZooms = (() => {
  console.log(`EvtsConfiguration : extractZooms`)
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
  console.table(zooms.value)
})

const extractInfos = (() => {
  console.log(`EvtsConfiguration : extractInfos`)
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
  console.table(infos.value)
})


function newPosition(position) {
  emit('newPosition', position)
}

function savePauses(myPauses){
  console.log(`EvtsConfiguration - savePause`) 
  console.table(myPauses)
  pausesToSave = [].concat(myPauses)
  console.table(pausesToSave)
}

function newZoom(newZoom) {
  emit('newZoom', newZoom)
}

function newCap(newCap) {
  emit('newCap', newCap)
}

function fnShowInfo() {
  showInfo.value = !showInfo.value; 
  showPause.value=false; 
  showZoom.value=false
  console.log(`EvtsConfigurationo - fnShowInfo ${showInfo.value}`)
  emit('showInfo', showInfo.value)
  emit('showCurseur', showInfo.value || showZoom.value)
}

function fnShowPause() {
  showPause.value = !showPause.value; 
  showInfo.value=false; 
  showZoom.value=false
  console.log(`EvtsConfigurationo - fnShowPause ${showInfo.value}`)
  emit('showInfo', showInfo.value)
  emit('showCurseur', showInfo.value || showZoom.value)
}

function fnShowZoom() {
  showZoom.value = !showZoom.value; 
  showPause.value=false; 
  showInfo.value=false
  console.log(`EvtsConfigurationo - fnShowZoom ${showInfo.value}`)
  emit('showInfo', showInfo.value)
  emit('showCurseur', showInfo.value || showZoom.value)
}
</script>

<style lang="css" scoped>

</style>