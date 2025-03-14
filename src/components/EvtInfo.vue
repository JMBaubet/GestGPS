<template>
  <EvtPositionWidget
    :showPitch="false"
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
        :nombre="debut*10"
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
      :nombre="fin*10"
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
  <v-row class="mx-2 my-2" >
      <span  style="float:right;">Vignette sélectionée :&nbsp;</span>
      <span>{{props.vignette}} </span> 
    </v-row>


  <v-divider class="mt-1"></v-divider>

  <v-row   class="mx-0 my-1">
    <v-col sm="3"  class="mt-1 pa-1">
      <v-btn class="mb-1 text-none  ml-3" 
        :disabled=disabledAddDel
        @click="emit('voirVignette')"
        size="small" 
        min-width="70px"
        color="primary"
      > voir
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
  import InputNumber from './InputNumber.vue';
  import EvtPositionWidget from './EvtPositionWidget.vue';
  import { ref, watch } from 'vue';
  import { v6 as uuidv6 } from 'uuid'

  import { de } from 'vuetify/locale';

  const props = defineProps({
    position: Number,
    infos: Object,
    longueur: Number,
    zoom:Number,
    cap: Number,
    map: Object,
    vignette: String,
    vignetteSize: Number,
  })

  // watch(() => props.vignetteSize, (newvalue, oldValue) => {
  //   console.log(`EvtInfo - vignetteSize ${props.vignetteSize}`)
  // })


  const emit = defineEmits(['newZoom', 'newCap', 'newPosition', 'affVignette', 'voirVignette', 'saveInfos', ])

  const preVisu = parseInt(import.meta.env.VITE_EVT_INFO_PRE_VISU)
  const postVisu = parseInt(import.meta.env.VITE_EVT_INFO_POST_VISU)


  const mask = ref(false)
  const distance = ref(0)
  const isPresent = ref(false)
  const debut = ref(0)
  const fin = ref(0)
  const affDepart = ref(true)
  const affArrivee = ref(true)
  const aff10km = ref(true)
  const disabledAddDel = ref(true)
  const disabledPrecedent = ref(true)
  const disabledSuivant = ref(true)
  const vignette = ref(props.vignette)

  let myInfos = []
  let vignetteInfo = {}
  

  // console.log(`EvtInfo.vue - props.longueur : ${props.longueur}`)
  // console.log(`EvtInfo.vue - props.infos :`)
  // console.table(props.infos)


  debut.value = (props.position - preVisu) / 10
  if (debut.value < 0) debut.value = 0
  fin.value = (props.position + postVisu) / 10
  if (fin.value*10  >  props.distance) fin.value = props.distance/10

  watch(() => props.position, (newValue, oldValue) => {
    // console.log(`EvtInfo - watch props.position : ${props.position} ${typeof(postVisu)}`)
    majBtn()
  })

  watch(() => props.infos.length, (newValue, oldValue)=> {
    initMyInfos()
  })

  watch(() => props.vignette, (newValue, oldValue) => {
    disabledAddDel.value = false
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
    // console.log(`EvtInfo - newZoom : ${newZoom}`)
    emit('newZoom', newZoom)
  }

  function newCap(newCap) {
    // console.log(`EvtInfo - newCap : ${newCap}`)
    emit('newCap', newCap)  
  }

  function initMyInfos() {
    myInfos.length = 0
    for (let i = 0; i< props.infos.length; i++) {
      myInfos[i] = props.infos[i]
    }  
    // console.table(myInfos)
    majBtn()
  }

  function majBtn() {
    // console.log(`EvtInfo.vue - majBtn : ${props.position}`)
    let i=0
    disabledPrecedent.value=true
    disabledSuivant.value=true
    isPresent.value=false
    if (props.vignette === "") {disabledAddDel.value = true}

    while (i < myInfos.length) {
      if (myInfos[i].position < props.position) disabledPrecedent.value = false
      if (myInfos[i].position > props.position) disabledSuivant.value = false
      i++
    } 
    
    i=0
    while (i < myInfos.length) {
      // if (myInfos[i].position < props.position) disabledPrecedent.value = false
      // if (myInfos[i].position > props.position) disabledSuivant.value = false
      if (myInfos[i].position === props.position) {
        // console.log(`EvtInfo.vue - majBtn : Position trouvée ! Fin : ${myInfos[i].end}`)
        isPresent.value = true
        disabledAddDel.value=false
        debut.value = myInfos[i].start/10 
        fin.value = myInfos[i].end/10 
        emit('affVignette', myInfos[i].marker)
        break
      } else {
        debut.value = (props.position - preVisu) / 10
        if (debut.value < 0 ) debut.value=0
          fin.value = (props.position + postVisu) / 10
        if (fin.value*10 > props.longueur )  fin.value=props.longueur/10
      }
      i++
    }
  }

  function add() {
    // console.log(`EvtPause : add`)
    let info = {}
    let marker = {}
  
    info.type = 'marker'
    info.position = props.position
    info.start = debut.value * 10
    info.end= fin.value * 10
    marker.fichier=`${props.vignette}.png`
    marker.taille = props.vignetteSize
    marker.id = uuidv6()
    marker.coord = [props.map.getCenter().lng, props.map.getCenter().lat] 
    info.marker = marker
    myInfos.push(info)

    myInfos.sort(function compare(a,b) {
      if (a.start < b.start)
        return -1;
      if (a.start > b.start )
        return 1;
      return 0;
    })


    isPresent.value = true
    // console.table(myInfos)
    majBtn()
  }

  function del() {
    // console.log(`EvtPause : del : ${props.position}`)
    let i = 0
    while (i < myInfos.length) {
      if (myInfos[i].position === props.position) {
        myInfos.splice(i,1)
        isPresent.value = false
        break
      }
      i++
    }
    emit('newPosition', props.position)  // #TODO voir pourquoi origine EvtInfo
    // console.table(myInfos)
    majBtn()
  }

  function precedent() {
    // console.log(`EvtPause : precedent`)
    let i = myInfos.length - 1
    while (myInfos[i].position >= props.position)
      i--
    emit('newPosition', myInfos[i].position)
    // console.log(`On va vers ${myInfos[i].position}`)
  }

  function suivant() {
    // console.log(`EvtPause : suivant`)
    let i = 0
    while (myInfos[i].position <= props.position) i++
    emit('newPosition', myInfos[i].position)
    // console.log(`On va vers ${myInfos[i].position}`)
  }


  function save() {
    // console.log(`EvtInfo.vue - save `)
    emit('saveInfos', myInfos)
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
