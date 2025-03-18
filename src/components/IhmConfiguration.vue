<template>
  <div id="ihmConfig" >

    <v-card class="mx-auto pa-0" max-width="320" min-width="320"  color="#90A4AEC0">
      <v-card-actions>
        <v-btn color="black"  class="text-none" text="Configuration des évènements"></v-btn>
        <v-spacer></v-spacer>
        <v-btn color="black"
          :icon="showEvt ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="changeEvt"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showEvt">
          <v-divider></v-divider>
          <EvtsConfiguration
            :position="positionActive"
            :visu
            :evt
            :longueur
            :zoom
            @new-zoom="newZoom"
            :cap
            @new-cap="newCap"
            :pitch
            @new-pitch="newPitch"
            :endFlyTo
            @new-position="newPosition"
            :map
            :vignette
            :vignetteSize
            @show-info="fnShowInfo"
            @show-curseur="showCurseur"
            @voir-vignette="voirVignette"
            @aff-vignette="affVignette"
            @voir-zoom="voirZoom"
            @save-evts="saveEvts"
          ></EvtsConfiguration>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" max-width="320" min-width="320"  color="#23374AC0">
      <v-card-actions>
        <v-btn   class="text-none"  text="Paramétrage des points de Vue"></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :icon="showPov ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="changePov"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showPov">
          <v-divider></v-divider>

          <CameraConfiguration
            :zoom
            @new-zoom="newZoom"
            :pitch
            @new-pitch="newPitch"
            :cap
            @new-cap="newCap"
          ></CameraConfiguration>

          <PovConfiguration
            :visu
            :position="positionActive"
            :map
            @new-position="newPosition"
            @save="saveVisu"
          ></PovConfiguration>

        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mx-auto pa-0" max-width="320" min-width="320"  color="#FFF59D80">
      <v-card-actions>
        <v-btn   class="text-none" color="black" text="Déplacement sur la trace"></v-btn>
        <v-spacer></v-spacer>
        <v-btn color="black"
          :icon="showDep ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showDep = !showDep;"
        ></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showDep">
          <v-divider></v-divider>
          <Deplacement
            :longueur
            :position="positionActive"
            @new-position="newPosition"
            @maj-auto="majAuto"
          ></Deplacement>
        </div>
      </v-expand-transition>
    </v-card>


  </div>

</template>

<script setup>
import { ref, watchEffect, watch} from 'vue';
import EvtsConfiguration from './EvtsConfiguration.vue';
import CameraConfiguration from './CameraConfiguration.vue';
import PovConfiguration from './PovConfiguration.vue';
import Deplacement from './Deplacement.vue';
import { endFlyToEvt } from '@/scripts/mapEvt';



const props = defineProps({
  longueur: Number,
  zoom: Number,
  pitch: Number,
  cap: Number,
  visu: Object,
  endFlyTo: Boolean,
  map: Object,
  evt: Object,
  vignette: String,
  vignetteSize: Number,
})

// watch(() => props.vignetteSize, (newvalue, oldValue) => {
//   console.log(`IhmConfiguration - vignetteSize ${props.vignetteSize}`)
// })


// console.log(`IhmConfiguration.vue - longueur : ${props.longueur}`)





watchEffect(() => {
  const visu = ref(props.visu)
})

watchEffect(() => {
  // const zoom = ref(props.zoom)
  const pitch = ref(props.pitch)
  // const cap = ref(props.cap)
})

const positionActive= ref(0)

const emit = defineEmits(
  ['newPosition', 'majAuto', 'newZoom', 'newPitch', 'newCap', 'saveVisu', 'saveEvts', 'showEvt', 'showInfo', 'showCurseur', 'voirVignette', 'affVignette', 'voirZoom'])

const showEvt = ref(false)
const showDep = ref(true)
const showPov = ref(false)

// const pauses = ref([])

function changeEvt() {
  // console.log(`changeEvt`)
  showEvt.value = !showEvt.value; 
  showPov.value = false  
  // console.log(`changeEvt : ${showEvt.value}`)
  emit('showEvt', showEvt.value)
}

function changePov() {
  // console.log(`changeEvt`)
  showPov.value = !showPov.value; 
  showEvt.value = false  
  // console.log(`changePov :  ${showEvt.value}`)
  emit('showEvt', showEvt.value)
}

function fnShowEvt(evt) {
  console.log(`IhmConfiguration - showEvt : ${evt}`)
  emit('showEvt', evt )
}

function newZoom(zoom) {
  emit('newZoom', zoom)
}

function newPosition(position, reload=false) {
  positionActive.value = position
  emit('newPosition', position, reload)
}

function majAuto(majAuto) {
  emit('majAuto', majAuto)
}

function newPitch(pitch) {
  emit('newPitch', pitch)
}

function newCap(cap) {
  emit('newCap', cap)
}

function saveVisu(visu) {
  emit('saveVisu', visu)
}

function saveEvts(evt) {
  emit('saveEvts', evt)
}

function initEvts() {
  console.log(`ihmConfiguration : initEvt`)
}

function fnShowInfo(info) {
  emit('showInfo', info)
}
function showCurseur(curseur) {
  emit('showCurseur', curseur)
}

function voirVignette() {
  emit('voirVignette')
}
function affVignette(vignette) {
  emit('affVignette', vignette)
}

function voirZoom(zoom) {
  emit('voirZoom', zoom)
}

</script>

<style lang="css" scoped>
  #ihmConfig {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    left: 10px;
  }

</style>