<template>


  <!-- <v-row v-if="disabledDepart === true" justify="start" class="mx-2 my-1" >
    <span id="depart">
      <b>Départ</b>
    </span> 
  </v-row>

  <v-row v-else-if="disabledArrivee === true " justify="start" class="mx-2 my-1" >
    <span id="arrivee">
      <b>Arrivée </b>
    </span> 
  </v-row>

  <v-row v-else justify="start" class="mx-2 my-1" >
    <span id="distance">
      km <b>{{ positionActive / 10 }} </b> sur {{ longueur / 10 }}
    </span> 
  </v-row>
 -->

<v-row class="mx-1">
  <v-col v-if="disabledDepart === true" sm="6">
    <span id="depart">
      <b>Départ</b>
    </span> 
  </v-col>
  <v-col sm="6" v-else-if="disabledArrivee === true" >
    <span id="arrivee">
      <b>Arrivée </b>
    </span> 
  </v-col>
  <v-col sm="6" v-else >
    <span id="distance">
      km <b>{{ positionActive / 10 }} </b> sur {{ longueur / 10 }}
    </span> 
  </v-col>
  
  <v-col sm="6"  class="py-1">
    <v-switch 
      id="switchRelaod"
      v-model="majAuto"
      class="pl-2"
      color="orange-darken-3"
      base-color="grey-darken-3"
      hide-details="true"
      v-tooltip="'Mise à jour automatique des Cap, Zoom, Pitch.', location='top'" 

    >
      <template v-slot:label>
        <span class="input__label">Màj auto </span>
      </template>
    </v-switch>

  </v-col>

</v-row>   

<v-row  justify="center" class="my-0">
  <v-col cols="auto">
        <v-btn  class="ml-0" 
          @click="changePosition(0)"
          :disabled=disabledDepart
          size="small" 
          color="green-darken-4"
          icon="mdi-page-first"
        >  
        </v-btn>

        <v-btn class="ml-2"
          @click="changePosition(-10)"
          :disabled=disabledDepart
          size="small" 
          color="yellow-darken-2"
          icon="mdi-chevron-double-left"
        >
        </v-btn>
      
        <v-btn  class="ml-2"
          @click="changePosition(-1)"
          :disabled=disabledDepart
          size="small" 
          color="yellow-darken-2"
          icon="mdi-chevron-left"
        > 
        </v-btn>

        <v-btn class="ml-2"
          @click="changePosition(1)"
          :disabled=disabledArrivee
          size="small" 
          color="yellow-darken-2"
          icon="mdi-chevron-right"
        >   
        </v-btn>
        <v-btn  class="ml-2"
          @click="changePosition(10)"
          :disabled=disabledArrivee
          size="small" 
          color="yellow-darken-2"
          icon="mdi-chevron-double-right"
        >  
        </v-btn>

        <v-btn class="ml-2"
          @click="changePosition(100000)"
          :disabled=disabledArrivee
          size="small" 
          color="red-darken-4"
          icon="mdi-page-last"
        > 
        </v-btn>
      </v-col>
    </v-row>
</template>

<script setup>
import { ref, watch } from 'vue';


const props = defineProps({
  longueur: Number,
  position: Number,
})



const emit = defineEmits(['newPosition', 'majAuto'])

const disabledDepart = ref(true)
const disabledArrivee = ref(false)

const positionActive = ref(0)
const majAuto = ref(true)

watch(() => majAuto.value, () => {
  console.log(`majAuto : ${majAuto.value}`)
  emit('majAuto', majAuto.value)
})

watch(() => props.position, (newValue, oldValue) => {
  positionActive.value = newValue
  majBtn()
})


function majBtn() {
  // console.log(`Deplacement : function majBtn ${positionActive}, ${props.longueur}`)
  if (positionActive.value === 0 ) {
    disabledDepart.value=true
    disabledArrivee.value=false
  } else if (positionActive.value === props.longueur) {
    disabledDepart.value=false
    disabledArrivee.value=true
  } else {
    disabledDepart.value=false
    disabledArrivee.value=false
  }
}

function changePosition(delta) {
  console.log(`Change Position : ${delta}, ${majAuto.value}`)
  // console.table(props.longueur)
  switch (delta) {
    case 0:
      positionActive.value = 0
      break;

    case -10:
    case -1: 
      positionActive.value+=delta
      if(positionActive.value <= 0) {
        positionActive.value = 0
      }
      break;

    case 1:
    case 10: 
      positionActive.value+=delta
      if (positionActive.value >= props.longueur) {
        positionActive.value = props.longueur
      }
      break;
      
    case 100000:
      positionActive.value = props.longueur 
      break;
  }
  majBtn()
  emit('newPosition', positionActive.value)
}


</script>

<style lang="css" scoped>
#arrivee {
  min-width: 150px;
  display: inline-block;
  color: #B71C1C
}

#depart {
  min-width: 150px;
  display: inline-block;
  color: #1B5E20
}

#distance {
  min-width: 150px;
  display: inline-block;
  color: #000
}



#switchRelaod, .v-input--density-default {
    --v-input-control-height: 43px;
} 
.input__label {
   color: black;
}
</style>