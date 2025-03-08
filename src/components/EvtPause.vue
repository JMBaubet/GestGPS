<template>
  <v-row class="mt-0">
    <v-col cols = "3" class="pr-0 mt-2" >
      <p id="text">km 0 :</p>
    </v-col>
    <v-col cols="2"  class="pa-0 mt-2" > 
      <v-switch 
        v-model="km0"
        id="switchPause"
        class="pl-2"
        color="green"
        base-color="grey"
        hide-details="true"
        v-tooltip="'Sélectionnez pour avoir une pause au km 0.', location='bottom'" 
      ></v-switch>
    </v-col>
    <v-col cols="6"  class="pr-0" align="end">
      <v-btn  class="ml-2"
          @click="precedent()"
          :disabled=disabledPrecedent
          size="x-small" 
          color="grey-darken-4"
          icon="mdi-chevron-left"
          v-tooltip="'Aller à la pause précédente', location='bottom'" 
        > 
        </v-btn>
        <v-btn  class="ml-2"
          @click="suivant()"
          :disabled=disabledSuivant
          size="x-small" 
          color="grey-darken-4"
          icon="mdi-chevron-right"
          v-tooltip="'Aller à la pause suivante', location='bottom'" 
        > 
        </v-btn>

        <v-btn  class="ml-6"
          @click="save()"
          size="small" 
          color="red-darken-4"
          icon="mdi-content-save-outline"
          v-tooltip="'Sauvegarder les pauses', location='bottom'" 
        > 
        </v-btn>

   </v-col> 

  </v-row>


  <v-row  v-if="isPresent" class="mx-0">
    <v-col sm="4"  class="my-0">
      <v-btn class="mb-2 text-none" 
        :disabled=disabledAddDel
        @click="del(props.position)"
        size="small" 
        min-width="90px"
        color="red-darken-2"
      > Supprimer  
      </v-btn>
    </v-col>
    <v-col sm="8" class="mt-1" >
      <span id="distance">
        la pause au km <b>{{ distance }} </b>
      </span> 
    </v-col>
  </v-row>
  <v-row  v-else class="mx-0">
    <v-col  sm="4"  class="my-0">
      <v-btn  class="mb-2 text-none" 
        :disabled=disabledAddDel
        @click="add(props.position)"
        size="small" 
        min-width="90px"
        color="green-darken-2"
      > Ajouter  
      </v-btn>
    </v-col>
    <v-col sm="8" class="mt-1" >
      <span id="distance">
        une pause au km <b>{{ distance }} </b>
      </span> 
    </v-col>

  </v-row>   

</template>



<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  position: Number,
  pauses: Object,
})

const emit = defineEmits(['newPosition', 'save'])


const distance = ref(props.position/10)
const isPresent =ref(false)
const km0 = ref(false)
const disabledPrecedent = ref(true)
const disabledSuivant = ref(true)
const disabledAddDel = ref(true)

let  myPauses = []

watch(() => props.position, (newvalue, oldValue) => {
  distance.value = props.position / 10
  majBtn()
})

watch(() => props.pauses.length, (newValue, oldValue) => {
  console.table(props.pauses)
  initMyPauses()
})

watch(() => km0.value, (newValue, oldValue) => {
  console.log(`Km0 change :${km0.value}`)
  if (km0.value) {del(0); add(0)} // On fait un del(0) pour eviter un effet de bord à l'init
  else del(0)
})

function initMyPauses() {
  // console.log(`function initMyRef`)
  for (let i = 0; i< props.pauses.length; i++) {
    myPauses[i] = props.pauses[i]
  }
  if (myPauses[0] === 0) km0.value = true
  majBtn()
}


function add(position) {
  console.log(`EvtPause : add ${position}`)
  myPauses.push(position)
  myPauses.sort(function compare(a,b) {
    if (a < b)
      return -1;
    if (a> b )
      return 1;
    return 0;
  })
  console.table(myPauses)
  majBtn()
}

function del(position) {
  console.log(`EvtPause : del ${position}`)
  let i = 0
  while (i < myPauses.length) {
    if (myPauses[i] === position) {
      myPauses.splice(i,1)
    }
    i++
  }
  console.table(myPauses)
  majBtn()
}

function save() {
  console.log(`EvtPause : save`)
  emit('save', myPauses)
}

function precedent() {
  console.log(`EvtPause : precedent`)
  let i = myPauses.length - 1
  while (myPauses[i] >= props.position)
    i--
  emit('newPosition', myPauses[i])
  console.log(`On va vers ${myPauses[i]}`)
}

function suivant() {
  console.log(`EvtPause : suivant`)
  let i = 0
  while (myPauses[i] <= props.position) i++
  emit('newPosition', myPauses[i])
}

function majBtn() {
  console.log(`EvtPause : majBtn`)
  if (props.position === 0) disabledAddDel.value = true
  else disabledAddDel.value = false

  let i=0
  disabledPrecedent.value=true
  disabledSuivant.value=true
  isPresent.value=false
  while (i < myPauses.length) {
    if (myPauses[i] < props.position) disabledPrecedent.value = false
    if (myPauses[i] > props.position) disabledSuivant.value = false
    if (myPauses[i] === props.position) isPresent.value = true
    i++
  }
}
</script>



<style scoped>
#switchPause, .v-input--density-default {
    --v-input-control-height: 43px;
}

  #text {
    text-align: end;
  }

</style>
