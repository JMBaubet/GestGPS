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
        <!-- Afficher du km {{ debut }} -->
        Voir {{ preAff }} m avant 
      </span> 
    </v-col>
    <v-col sm="5"  class="mb-1">
      <InputNumber
        :min="0"
        :max="props.position * 100"
        :increment-min="100"
        :increment-max="1000"
        :nombre="preAff"
        @new-number="newDebut"
      ></InputNumber>
    </v-col>
  </v-row>

  <v-row class="ma-0">
    <v-col sm="7"  class="mt-3">
      <span  style="float:right;">
        et {{ postAff }} m après.
     </span> 
     </v-col>
    <v-col sm="5"  class="mb-0 mt-0 pb-0">
     <InputNumber
      :min="0"
      :max="(props.longueur - props.position) * 100"
      :increment-min="100"
      :increment-max="1000"
      :nombre="postAff"
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


  <v-row class="mt-0 " v-show="showAdd10km"> 
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

  <v-divider class="mt-1"></v-divider>
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
    visu: Object,
    infos: Object,
    longueur: Number, 
    zoom:Number,
    cap: Number,
    map: Object,
    vignette: String,
    vignetteSize: Number,
    showInfo: Boolean,
  })

  // watch(() => props.vignetteSize, (newvalue, oldValue) => {
  //   console.log(`EvtInfo - vignetteSize ${props.vignetteSize}`)
  // })


  const emit = defineEmits(['newZoom', 'newCap', 'newPosition', 'affVignette', 'voirVignette', 'saveInfos', ])

  let preVisu = parseInt(import.meta.env.VITE_EVT_INFO_PRE_VISU)
  let postVisu = parseInt(import.meta.env.VITE_EVT_INFO_POST_VISU)
  const vignetteDepart = import.meta.env.VITE_VIGNETTE_DEPART
  const vignetteDepartPostAff = parseInt(import.meta.env.VITE_VIGNETTE_DEPART_POST_AFFICHAGE)
  const vignetteArrivee = import.meta.env.VITE_VIGNETTE_ARRIVEE
  const vignetteArriveePreAff = parseInt(import.meta.env.VITE_VIGNETTE_ARRIVEE_PRE_AFFICHAGE)
  const preAff10km = import.meta.env.VITE_VIGNETTE_PRE_AFFICHAGE_10_KM
  const postAff10km = import.meta.env.VITE_VIGNETTE_POST_AFFICHAGE_10_KM


  const mask = ref(false)
  const distance = ref(0)
  const isPresent = ref(false)
  const debut = ref(0)
  const fin = ref(0)
  const preAff = ref(0)
  const postAff = ref(postVisu / 10)
  const affDepart = ref(true)
  const affArrivee = ref(true)
  const aff10km = ref(true)
  const showAdd10km = ref(false)
  const disabledAddDel = ref(true)
  const disabledPrecedent = ref(true)
  const disabledSuivant = ref(true)
  const vignette = ref(props.vignette)

  let myInfos = []
  let vignetteInfo = {}
  

  // console.log(`EvtInfo.vue - props.longueur : ${props.longueur}`)
  // console.log(`EvtInfo.vue - props.infos :`)
  // console.table(props.visu)


  debut.value = (props.position - preVisu) / 10
  if (debut.value < 0) debut.value = 0

  fin.value = (props.position + postVisu) / 10
  if (fin.value*10  >  props.longueur) fin.value = props.longueur/10


  // if (props.position > preVisu) preAff.value = preVisu / 10
  // else preAff.value = props.position / 10
  // console.log(`${postVisu} ${props.longueur}`)
  // if ( postVisu >= props.longueur) {
  //   postAff.value = (props.longueur / 10)
  // } else {
  //   console.log(`else`)
  //   postAff.value = postVisu / 10
  // }


  watch(() => props.position, (newValue, oldValue) => {
    // console.log(`EvtInfo - watch props.position : ${newValue} ${oldValue}`)
    majBtn()
  })

  watch(() => props.infos.length, (newValue, oldValue)=> {
    initMyInfos()
  })

  watch(() => props.vignette, (newValue, oldValue) => {
    disabledAddDel.value = false
  })

  watch(() => affDepart.value, () => {
    addDepart()
  })

  watch(() => affArrivee.value, () => {
    addArrivee()
  })

  watch(() => aff10km.value, () => {
    add10km()
  })

  watch(() => props.showInfo, () => {
    majSwitches()
  })


  function newDebut(number) {
    // console.log(`newDebut : ${number}`)
    preAff.value = number
    preVisu = number / 100
    debut.value=number/10
  }

  function newFin(number) {
    // console.log(`newFin : ${number}`)
    postAff.value = number
    postVisu = number / 100
    fin.value=number/10
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

  function majSwitches() {
    try {
    if (myInfos[0].marker.fichier === vignetteDepart) {
      affDepart.value = true
    } else {
      affDepart.value = false
    }
    if (myInfos[myInfos.length - 1].marker.fichier === vignetteArrivee) {
      affArrivee.value = true
    } else {
      affArrivee.value = false
    }
    let i = 0
    aff10km.value = false
    if (props.longueur > 100) {
      showAdd10km.value = true
      while (i < myInfos.length) {
        if (myInfos[i].marker.fichier.substr(0,4) === "§_km") {
          aff10km.value = true
          break
        }
        i++
      }
    } else {
      showAdd10km.value = false
    }

  } catch (err) {
    affDepart.value = false
    affArrivee.value = false
    console.warning(`Le tableau myInfos est vide`)}
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

    // Calcul de preAff 
    if (props.position > preVisu) {
      preAff.value = preVisu * 100
    } else {
      preAff.value = props.position * 100
    }

    // console.log(`distance : ${props.longueur}`)
    if (props.position + postVisu >= props.longueur) {
      postAff.value = (props.longueur - props.position) * 100
    } else {
      postAff.value =  postVisu * 100
    }

  }

  function add() {
    // console.log(`EvtPause : add`)
    let info = {}
    let marker = {}
  
    info.type = 'marker'
    info.position = props.position
    // info.start = debut.value * 10
    // info.end= fin.value * 10

    info.start = props.position - (preAff.value / 100)
    info.end = props.position + (postAff.value / 100)
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

  function addDepart() {
    // console.log(`addDepart : ${affDepart.value}`)
    let info = {}
    let marker = {}
    if (affDepart.value === true) {
    
      info.type = 'marker'
      info.position = 0

      info.start = 0
      info.end = vignetteDepartPostAff
      marker.fichier = vignetteDepart // Voir si on met Km0 si aff des kilomètres..
      marker.taille = props.vignetteSize
      marker.id = uuidv6()
      marker.coord =  props.visu[0].lookAt
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
    } else {
      // console.log(`addDepart : On supprime`)
      let i = 0
      while (i < myInfos.length) {
        if (myInfos[i].position === 0) {
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
  }

  function addArrivee() {
    // console.log(`addArrivee : ${affArrivee.value}`)
    // console.table(props.visu)
    let info = {}
    let marker = {}
    if (affArrivee.value === true) {
    
      info.type = 'marker'
      info.position = props.visu.length -1 

      info.start = info.position - vignetteArriveePreAff
      info.end =  props.visu.length - 1
      marker.fichier = vignetteArrivee 
      marker.taille = props.vignetteSize
      marker.id = uuidv6()
      marker.coord =  props.visu[props.visu.length - 1].lookAt
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
    } else {
      // console.log(`addDepart : On supprime`)
      // console.table(props.visu)
      let i = 0
      while (i < myInfos.length) {
        if (myInfos[i].position === props.visu.length - 1) {
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
  }

  function add10km () {
    // console.log(`add10km : ${aff10km.value}`)
    // console.table(props.visu)
    if (aff10km.value === true) {
      for (let index = 100; index < props.visu.length - 1; index+=100) {
        let info = {}
        let marker = {}
        info.type = 'marker'
        marker.taille = props.vignetteSize
        // console.log(`On traite l'index ${index}`)
        info.position = index
        info.start = index - preAff10km
        info.end =  index + parseInt(postAff10km)
        marker.id = uuidv6()
        // console.log((index/10).toString().padStart(3, "0"))
        marker.fichier = `§_km${(index/10).toString().padStart(3, "0")}.png` 
        marker.coord =  props.visu[index].lookAt
        info.marker = marker
        myInfos.push(info)
      }

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


    
    } else {

      // console.log(`add10km : On supprime`)
      let i = 0
      while (i < myInfos.length) {
        // console.log(`${myInfos[i].marker.fichier}`)
        if (myInfos[i].marker.fichier.substr(0,4) === "§_km") {
          myInfos.splice(i,1)
          isPresent.value = false
          i--
        }
        i++
      }
      emit('newPosition', props.position)  // #TODO voir pourquoi origine EvtInfo
      // console.table(myInfos)
      majBtn()



    }

  }

  function precedent() {
    // console.log(`EvtInfo : precedent`)
    let i = myInfos.length - 1
    while (myInfos[i].position >= props.position)
      i--
    emit('newPosition', myInfos[i].position)
    // console.log(`On va vers ${myInfos[i].position}`)
  }

  function suivant() {
    // console.log(`EvtInfo : suivant`)
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
