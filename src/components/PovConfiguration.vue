<template>
 <v-divider class="my-1"></v-divider>
  <p align="center" class="font-weight-thin">Gestion des points de vue.</p>  

  <v-row justify="center" class="pl-0 mb-1">
        <v-col cols="auto">

          <v-btn   class="ml-2"
            @click="refPrecedente()"
            :disabled=disabledPreviousRef
            size="small" 
            color="deep-orange-lighten-1"
            icon="mdi-chevron-left"
            v-tooltip="'Point de vue précédent', location='top'" 
          >          
          </v-btn>

          <v-btn   class="ml-2"
            @click="refSuivante()"
            :disabled=disabledNextRef
            size="small" 
            color="deep-orange-lighten-1"
            icon="mdi-chevron-right" 
            v-tooltip="'Point de vue suivant', location='top'" 
          >  
          </v-btn>

          <v-btn   class="ml-2"
            @click="refDerniere()"
            :disabled=disabledLastRef
            size="small" 
            color="deep-orange-lighten-1"
            icon="mdi-page-last" 
            v-tooltip="'Dernier point de vue', location='top'" 
          >  
          </v-btn>

          <v-btn   class="ml-2"
            @click="refReload()"
            :disabled=disabledReloadRef
            size="small" 
            color="deep-orange-lighten-1"
            icon="mdi-reload"
            v-tooltip="'Réinitialiser le point de vue', location='top'" 
          >          
          </v-btn>

          <v-btn   v-if="reference" class="ml-2"
            @click="refDel()"
            size="small" 
            color="deep-purple-lighten-1"
            icon="mdi-minus"
            v-tooltip="'Supprimer le point de vue', location='top'" 
          >          
          </v-btn>

          <v-btn   v-else class="ml-2"
            @click="refAdd()"
            size="small" 
            color="deep-orange-lighten-1"
            icon="mdi-plus"
            v-tooltip="'Ajouter le point de vue', location='top'" 
          >          
          </v-btn>

          <v-btn   class="ml-2"
            @click="refSave()"
            :disabled=disabledSaveRef
            size="small" 
            color="red-darken-3"
            icon="mdi-content-save-outline"
            v-tooltip="'Sauvegarder le scénario', location='top'" 
          >          
          </v-btn>


        </v-col>
      </v-row>    


</template>

<script setup>
import { ref, watch, watchEffect } from 'vue';

const props = defineProps({
  visu: Object,
  position: Number,
  map: Object,
})

const emit = defineEmits(['newPosition', 'save'])


let refs = []
let lastRef = 0


const disabledNextRef = ref(true)
const disabledPreviousRef = ref(false)
const disabledSaveRef = ref(true)
const reference = ref(true)
const disabledLastRef = ref(true)
const disabledReloadRef = ref(false)
let  myVisu = []


watch(() => props.visu.length, (newValue, oldValue) => {
  initMyRef()
  updateRefs()
  majBtn()
})

watch(() => props.position, (newValue, oldValue) => {
  majBtn()
})



function initMyRef() {
  // console.log(`function initMyRef`)
  for (let i = 0; i< props.visu.length; i++) {
    myVisu[i] = props.visu[i]
  }
}

function updateRefs() {
  // console.log(`function updateRefs`)
  refs.splice(0)
  for (let i=0; i< props.visu.length; i++) {
    if (props.visu[i].ref === true) refs.push(i)
  }
  lastRef = refs[refs.length - 1]
  // props.visu[lastRef].longueur = 0
  // console.table(refs)
}


function majBtn() {
    // console.log(`PovConfiguration : function majBtn ${props.position}, ${myVisu.length}`)
    if (myVisu.length !== 0 ) {
      reference.value = myVisu[props.position].ref
      if (props.position === 0 ) reference.value = false
      disabledSaveRef.value = false

      if (props.position === 0) disabledPreviousRef.value = true 
      else disabledPreviousRef.value = false

      if (props.position >= refs[refs.length - 1]) disabledLastRef.value = true
      else disabledLastRef.value = false

      disabledNextRef.value = true
      for (let i=0; i< refs.length; i++) {  
        if (refs[i] > props.position) disabledNextRef.value = false
      }
    }
  }


function refPrecedente() {
  let i = refs.length - 1
  while (props.position < refs[i]) i--
  // console.log(`point de ref precedent : ${refs[i]}`)
  emit('newPosition', refs[i - 1])  
}

function refSuivante() {
  let i = 0
  while (props.position >= refs[i]) i++
  // console.log(`point de ref suivant : ${refs[i]}`)
  emit('newPosition', refs[i])
}

function refDerniere() {
  emit('newPosition', refs[refs.length - 1])
}

function refReload() {
  emit('newPosition', props.position, true)
}

function refAdd() {
 // On met a jour le point référencé
  
 const position = props.map.getFreeCameraOptions().position;
  const lngLat = position.toLngLat();

  myVisu[props.position].ref = true
  myVisu[props.position].start = props.position
  myVisu[props.position].cap = props.map.getBearing()
  myVisu[props.position].zoom = props.map.getZoom()
  myVisu[props.position].pitch = props.map.getPitch()
  myVisu[props.position].positionCamera = [lngLat.lng.toFixed(5), lngLat.lat.toFixed(5)]
  myVisu[props.position].altitudeCamera = parseInt(position.toAltitude())

  // console.table(myVisu[props.position])
  // if (init) {
  //   disabledSaveRef.value = false
  //   majBtnDistance()
  //   init = false 
  // } else { 
    updateRefs()
    majVisu() 
    majBtn() // Pour mettre à jour les boutons precedent suivant et dernier
  //   checkCap()
  // }
}

function refDel() {
    // console.log(`function refDel`)
    // console.log(`avancement : ${props.position}`)
    myVisu[props.position].ref = false
    myVisu[props.position].start = 0
    myVisu[props.position].longueur = 0
    updateRefs()
    majVisu()   // Met à jour les points intermédiares entre deux ref
    majBtn() // Pour mettre à jour les boutons precedent suivant et dernier
    // checkCap() // Verifie que nous n'avons pas plus de 90° en deux caps déclarés

}

function refSave()  {
  // console.log(`function refSave`)
  emit('save', myVisu)
}

function majVisu() {
  // console.log(`function majVisu`)
  for(let i=0; i < refs[refs.length -1]; i++) {
    if (myVisu[i].ref === true) {
      const origine = i
      const capOrigine=myVisu[i].cap
      const zommOrigine=myVisu[i].zomm
      const pitchOrigine=myVisu[i].pitch
      let destination = i + 1
      while (destination <= refs[refs.length -1] ) {
        if (myVisu[destination].ref === true) {
          myVisu[origine].longueur = destination - i
          break
        }
        destination ++
      }
      // On met a jour les distances intermédiaires
      for(let j=origine + 1; j < destination; j++) {
        
        // Attention au changement de signe sur le cap. entre myVisu[index - lgSegment] et myVisu[ref]
        if (((myVisu[destination].cap > 0) && (myVisu[origine].cap > 0)) ||
          ((myVisu[destination].cap < 0) && (myVisu[origine].cap < 0))) {

          myVisu[j].cap =
            myVisu[origine].cap +
            (((myVisu[destination].cap - myVisu[origine].cap) / myVisu[origine].longueur) * (j - origine))
        } else {
          // console.warn(`Changement de signe sur le cap`)
          let capCible = myVisu[destination].cap
          let capOrigine = myVisu[origine].cap
          let delta

          if ((capCible > 0) && (capCible < 90)) {
            delta = capCible - capOrigine
            myVisu[j].cap =
              capOrigine +
              (((delta) / myVisu[origine].longueur) * (j - origine))
          } else if (capCible > 90) {
            delta = capOrigine - capCible + 360
            myVisu[j].cap =
              capOrigine -
              (((delta) / myVisu[origine].longueur) * (j - origine))
          } else if (capCible < -90) {
            delta = capCible - capOrigine + 360
            myVisu[j].cap =
              capOrigine +
              (((delta) / myVisu[origine].longueur) * (j - origine))
          } else {
            delta = capOrigine - capCible
            myVisu[j].cap =
              capOrigine -
              (((delta) / myVisu[origine].longueur) * (j - origine))
          }
        }

        myVisu[j].zoom =
          myVisu[origine].zoom +
          (((myVisu[destination].zoom - myVisu[origine].zoom) / myVisu[origine].longueur) * (j - origine))

        myVisu[j].pitch =
          myVisu[origine].pitch +
          (((myVisu[destination].pitch - myVisu[origine].pitch) / myVisu[origine].longueur) * (j - origine))

      }
      // console.log(`destination : ${destination}`)
      i = destination - 1
    }
  }
  // console.table(myVisu)

}


</script>

<style lang="css" scoped>

</style>