<template>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn  class="text-none" text="Gestion des pauses"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showPause ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showPause = !showPause; showInfo=false; showZoom=false"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showPause">
          <v-divider></v-divider>
          <EvtPause
          :position
          :pauses
          @save="savePause"
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
          @click="showInfo = !showInfo; showPause=false; showZoom=false"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showInfo">
          <v-divider></v-divider>
          <p>&nbsp; A faire</p>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" color="#40404080">
      <v-card-actions>
        <v-btn   class="text-none" text="Gestion des zooms"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showZoom ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showZoom = !showZoom; showInfo= false; showPause=false"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showZoom">
          <v-divider></v-divider>
          <p>&nbsp; A faire</p>
        </div>
      </v-expand-transition>
    </v-card>


</template>

<script setup>
import EvtPause from './EvtPause.vue';
import { ref, watch } from 'vue';

const props = defineProps({
  position: Number,
  evt: Object,
})

const emit = defineEmits(['newPosition'])

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

function savePause(myPauses){
  console.log(`EvtsConfiguration - savePause`) 
  console.table(myPauses)
  pausesToSave = [].concat(myPauses)
  console.table(pausesToSave)



}
</script>

<style lang="css" scoped>

</style>