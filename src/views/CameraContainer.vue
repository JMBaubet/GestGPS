<template>

  <MsgAlert :alarmes></MsgAlert>

  <v-container 
    fixed-right
    style="
      height: 100vh; 
      display: flex;  
      width:  100%; 
      max-width: 100%; 
      margin-left: 0px; 
      padding: 0
    " 
  >
    <div id="mapContainer" class="map-container" style="flex: 1;"></div>
    <MapHomeWidget
      :disabled="disabledBtnHome"
      @home="home"
    >
    </MapHomeWidget>

    <IhmConfiguration
      :longueur="visu.length - 1"
      @new-position="newPosition"
      @maj-auto="majAuto"
      :zoom
      @new-zoom="newZoom"
      :pitch
      @new-pitch="newPitch"
      :cap
      @new-cap="newCap"
      :visu
      :map="map"
      @save-visu="saveVisu"
      :evt
    ></IhmConfiguration>


    <!-- <EvtsWidget></EvtsWidget> -->
    <!-- <EvtInfo></EvtInfo> -->
    <!-- <EvtPositionWidget
      :titre="titre"
      :mask= true
      @zoomIn="setZoom(2)"
      @zoomOut="setZoom(-2)"
      @capChangeLL="capChange(-15)"
      @capChangeL="capChange(-5)"
      @capChangeR="capChange(+5)"
      @capChangeRR="capChange(+15)"
      @avanceP="toFrom(250)"
      @avance="toFrom(50)"
      @recule="toFrom(-50)"
      @reculeP="toFrom(-250)"

    >
    </EvtPositionWidget>  -->
    
    <!-- <CurseurCenter
    :mask = true
    >
    </CurseurCenter> -->
    
  </v-container>
</template>
  

<script setup>
  import MapHomeWidget from '@/components/MapHomeWidget.vue';
  import EvtPositionWidget from '@/components/EvtPositionWidget.vue';
  import CurseurCenter from '@/components/CurseurCenter.vue';
  import EvtsWidget from '@/components/EvtsWidget.vue';
  import EvtPause from '@/components/EvtPause.vue';
  import EvtInfo from '@/components/EvtInfo.vue';
  import IhmConfiguration from '@/components/IhmConfiguration.vue';

  import { useRouter } from 'vue-router';

  import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
  import { zpad } from "../scripts/utils.js" 
  import mapboxgl from 'mapbox-gl';
  import {ref, onMounted, onUnmounted} from 'vue' 
  import * as turf from '@turf/turf'
  import {mapLoadLayers, mapMaskSymbols, mapAdd3D} from "../scripts/mapLayers" 
  import {setPositions} from "../scripts/camera"
// import { set } from '@vueuse/core';

  const props = defineProps({
    id: String,
  })

  const router = useRouter()


  // Lecture des variables d'environnement
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  const initZoom = import.meta.env.VITE_MAPBOX_INIT_ZOOM
  const initStyle = import.meta.env.VITE_MAPBOX_INIT_STYLE
  const initCenterLon = import.meta.env.VITE_MAPBOX_INIT_CENTER_LON
  const initCenterLat = import.meta.env.VITE_MAPBOX_INIT_CENTER_LAT
  const initBear = import.meta.env.VITE_MAPBOX_INIT_BEAR
  const initPitch = import.meta.env.VITE_MAPBOX_INIT_PITCH

  let map = null
  let longueurTrace = 0

  const alarmes = ref([])
  
  // const disabledBtnPreviousRef = ref(true)
  // const disabledBtnNextRef = ref(true)
  // const disabledBtnLastRef = ref(true)
  // const disabledBtnReloadRef = ref(false)
  // const disabledBtnSaveRef = ref(true)
  const disabledBtnHome = ref(true)
  // const disabledBtnDepart = ref(true)
  // const disabledBtnP1k = ref(true)
  // const disabledBtnP100m = ref(true)
  // const disabledBtnM100m = ref(true)
  // const disabledBtnM1k = ref(true)
  // const disabledBtnArrivee = ref(true)
  const distanceTotale = ref(0)
  // const reference = ref(false)
  // const distance = ref(0)


  const zoom = ref(16.0)
  const cap = ref(0)
  const pitch = ref(0)
  const capRef = ref(0)
  const titre = ref("Positionnement du marker")

  // const disabledBtnPitchPPlus = ref(false)
  // const disabledBtnPitchPlus = ref(false)
  // const disabledBtnPitchMoins = ref(false)
  // const disabledBtnPitchMMoins = ref(false)

  const  visu  = ref([])
  const evt = ref([])


  // let listRef = [0]
  let init = true 
  let position = 0
  let avancement = 0
  let relaodAuto = true

  let positionsCamera = []    

  // Récupération de la trace du circuit
  let urlTrace = `http://localhost:4000/api/lineString/` + zpad(props.id, 6)
  let trace = []
  fetch(urlTrace, { method: 'GET', signal: AbortSignal.timeout(4000) })
  .then((rep) => {
    return rep.json()
  })
  .then((json) => {
    // On lit le 
    for (let key = 0; key < json.geometry.coordinates.length; key++) {
      // console.log(json.geometry.coordinates[key][0], json.geometry.coordinates[key][1])
      trace.push([json.geometry.coordinates[key][0], json.geometry.coordinates[key][1]])
    }

    longueurTrace = turf.length(json.geometry) 
    distanceTotale.value= longueurTrace.toFixed(1)

    // console.log(`Longueur de la trace : ${longueurTrace}`) 
  })
  .catch((err) => {
    console.error(`Erreur JsonTrace : ${err}`)
  })

  // Récupération des données camera pour : 
  // - Initialier le tableau visu pour faire les mises a jour.
  // - Enregistrer  la dernière distance référencée.
  let lastRef = 0
  
  let urlVisu = `http://localhost:4000/api/visu/` + zpad(props.id, 6)
  // let camera = [{point: [0,0], cap: 0,  start: false}]
  
  
  fetch(urlVisu, { method: 'GET', signal: AbortSignal.timeout(4000) })
  .then((rep) => {
    return rep.json()
  })
  .then((jsonVisu) => {
    // console.table(jsonVisu)
    // Mise à jour du dernier point référencé
    for (let key = 0; key < jsonVisu.length; key++) {
      visu.value.push(jsonVisu[key])
      if (visu.value.ref && (key > lastRef)) lastRef = key
    }
    // console.log(`Nombre de segment camera : ${visu.value.length}`)   
    // console.table(visu.value)
    if (visu.value[0].ref === true) {
      init = false
      // majListRef()
      // majBtnDistance()
      // majBtnPov()
    }

  })
  .catch((err) => {
    console.error(`Erreur JsonVisu: ${err}`)
  })


  // Récupération des données évènement
  let urlEvt = `http://localhost:4000/api/evt/` + zpad(props.id, 6)
  
  fetch(urlEvt, { method: 'GET', signal: AbortSignal.timeout(500) })
  .then((rep) => {
    return rep.json()
  })
  .then((json) => {
    evt.value = json.slice()
    // on initialise les données évènements
    // console.table(evt.value)
    // initEvt(evt)
  })
  .catch((err) => {
    console.error(`Erreur Evt : ${err}`)
  })




  onMounted(() => {
    // On prend intercepte le clavier
    window.addEventListener('keypress', keyboard)

    
    // On initialise la carte au montage du composant
    try {
      map = new mapboxgl.Map({
        container: "mapContainer",
        style:  initStyle,
        center: [initCenterLon, initCenterLat],
        zoom: initZoom,
        bearing : initBear,
        pitch: initPitch,
        interactive: false
      })


    } catch (error) {console.log(error)}
  
    
    // On charge les données graphiques pour le rendu
    mapLoadLayers(map, trace)

    // On charge le relief, le ciel et le brouillard
    mapAdd3D(map)

    // Lancement de l'annimation qui part de Paris et pointe vers le départ
    // console.log("On lance l'annimation du départ")
    map.on('load', async () => {
      // map.addControl(new mapboxgl.NavigationControl({showCompass: true, showZoom: false}), 'top-right');
      map.flyTo({  center: visu.value[0].lookAt,
        bearing: visu.value[0].cap, 
        zoom: visu.value[0].zoom, 
        pitch: visu.value[0].pitch, 
        duration: 2500
      })
      zoom.value = visu.value[0].zoom
      pitch.value = visu.value[0].pitch
      cap.value = visu.value[0].cap
    });

    // console.log("On lance la suite")
    map.once('moveend', async () => {
      position = map.getSource('point')
      disabledBtnHome.value=false
      cap.value = visu.value[0].cap
      setCamera()
      // positionCamera() 

      // window.requestAnimationFrame(frame);
    });

    map.on('rotateend', () => {
     cap.value = parseInt(map.getBearing())
    });

    map.on('zoomend', () => {
      zoom.value = parseFloat(map.getZoom().toFixed(1));
      // On arrondi le zoom à 0.5
      zoom.value = parseInt(zoom.value * 2) / 2 
    });

    map.on('pitchend', () => {
      pitch.value = parseInt(map.getPitch());
    });
  })


  onUnmounted(() => {
    // console.log("On detruit la carte")
    mapboxgl.clearStorage();
  })
  
  /**
   * 
   * @param e 
   */
  function keyboard(e) {
    // console.log(`Keyboard : ${e.key}`)
    // console.log(e.code)
    if (e.key === "p") { playPause(0) }
    if (e.key === "r") {
      start = 0
      //  window.requestAnimationFrame(frame)
    }
  }


  // function addRef (){
  //   // On met a jour le point référencé
    
  //   const position = map.getFreeCameraOptions().position;
  //   const lngLat = position.toLngLat();

  //   visu.value[avancement].ref = true
  //   visu.value[avancement].start = avancement
  //   visu.value[avancement].cap = cap.value
  //   visu.value[avancement].zoom = zoom.value
  //   visu.value[avancement].pitch = pitch.value
  //   visu.value[avancement].positionCamera = [lngLat.lng.toFixed(5), lngLat.lat.toFixed(5)]
  //   visu.value[avancement].altitudeCamera = parseInt(position.toAltitude())

  //   // console.table(visu.value[avancement])
  //   if (init) {
  //     disabledBtnSaveRef.value = false
  //     majBtnDistance()
  //     init = false 
  //   } else { 
  //     majListRef()
  //     majVisu() 
  //     majBtnPov() // Pour mettre à jour les boutons precedent suivant et dernier
  //     checkCap()
  //   }
  // }

  // function delRef() {
  //   // console.log(`function delRef`)
  //   // console.log(`avancement : ${avancement}`)
  //   visu.value[avancement].ref = false
  //   visu.value[avancement].start = 0
  //   visu.value[avancement].longueur = 0
  //   majListRef()
  //   majVisu()
  //   majBtnPov() // Pour mettre à jour les boutons precedent suivant et dernier
  //   checkCap()
  // }

  // function previousRef() {
  //   // console.log(`function previousRef`)
  //   let i=0
  //   let find = false

  //   for(i = 0; i < listRef[listRef.length - 1]; i++) {
  //     if  (listRef[i] >= avancement) {
  //       find = true
  //       break
  //     }
  //   }

  //   if (find) {
  //     // console.log(`Avancement : ${listRef[i]}`)
  //     avancement = listRef[i-1]
  //   } else {
  //     // console.log(`Avancement : ${listRef[listRef.length - 1]}`)
  //     avancement = listRef[listRef.length - 1]
  //   }
    
  //   distance.value = avancement / 10
  //   setCamera()
  //   majBtnDistance()
  //   majBtnPov()
  // }

  // function nextRef() {
  //   // console.log(`function nextRef`)
  //   let i=0
  //   let find = false
  //   while (avancement >= listRef[i]) {
  //     // console.log(`Avancement : ${avancement}, ref : ${listRef[i]}`)
  //     i++
  //   }
  //   // console.log(listRef[i])
  //   avancement = listRef[i]
  //   distance.value = avancement / 10
  //   setCamera()
  //   majBtnDistance()
  //   majBtnPov()
  // }


  // function fonctionLastRef() {
  //   // console.log(`function fonctionLastRef`)
  //   avancement = listRef[listRef.length - 1]
  //   distance.value = avancement / 10
  //   setCamera()
  //   majBtnDistance()
  //   majBtnPov()
  // }


  // function reloadRef() {
  //   // console.log(`function reloadRef`)
  //   setCamera(true)
  // }

  // function majVisu() {
  //   // console.log(`function majVisu`)
  //   for(let i=0; i < listRef[listRef.length -1]; i++) {
  //     if (visu.value[i].ref === true) {
  //       const origine = i
  //       const capOrigine=visu.value[i].cap
  //       const zommOrigine=visu.value[i].zomm
  //       const pitchOrigine=visu.value[i].pitch
  //       let destination = i + 1
  //       while (destination <= listRef[listRef.length -1] ) {
  //         if (visu.value[destination].ref === true) {
  //           visu.value[origine].longueur = destination - i
  //           break
  //         }
  //         destination ++
  //       }
  //       // On met a jour les distances intermédiaires
  //       for(let j=origine + 1; j < destination; j++) {
          
  //         // Attention au changement de signe sur le cap. entre visu.value[index - lgSegment] et visu.value[ref]
  //         if (((visu.value[destination].cap > 0) && (visu.value[origine].cap > 0)) ||
  //           ((visu.value[destination].cap < 0) && (visu.value[origine].cap < 0))) {

  //           visu.value[j].cap =
  //             visu.value[origine].cap +
  //             (((visu.value[destination].cap - visu.value[origine].cap) / visu.value[origine].longueur) * (j - origine))
  //         } else {
  //           // console.warn(`Changement de signe sur le cap`)
  //           let capCible = visu.value[destination].cap
  //           let capOrigine = visu.value[origine].cap
  //           let delta

  //           if ((capCible > 0) && (capCible < 90)) {
  //             delta = capCible - capOrigine
  //             visu.value[j].cap =
  //               capOrigine +
  //               (((delta) / visu.value[origine].longueur) * (j - origine))
  //           } else if (capCible > 90) {
  //             delta = capOrigine - capCible + 360
  //             visu.value[j].cap =
  //               capOrigine -
  //               (((delta) / visu.value[origine].longueur) * (j - origine))
  //           } else if (capCible < -90) {
  //             delta = capCible - capOrigine + 360
  //             visu.value[j].cap =
  //               capOrigine +
  //               (((delta) / visu.value[origine].longueur) * (j - origine))
  //           } else {
  //             delta = capOrigine - capCible
  //             visu.value[j].cap =
  //               capOrigine -
  //               (((delta) / visu.value[origine].longueur) * (j - origine))
  //           }
  //         }

  //         visu.value[j].zoom =
  //           visu.value[origine].zoom +
  //           (((visu.value[destination].zoom - visu.value[origine].zoom) / visu.value[origine].longueur) * (j - origine))

  //         visu.value[j].pitch =
  //           visu.value[origine].pitch +
  //           (((visu.value[destination].pitch - visu.value[origine].pitch) / visu.value[origine].longueur) * (j - origine))

  //       }
  //       // console.log(`destination : ${destination}`)
  //       i = destination - 1
  //     }
  //   }
  //   // console.table(visu.value)
  // }


  // function majListRef () {
  //   // console.log(`function majListRef`)
  //   listRef.splice(0)
  //   for (let i=0; i< visu.value.length; i++) {
  //     if (visu.value[i].ref === true) listRef.push(i)
  //   }
  //   lastRef = listRef[listRef.length - 1]
  //   // console.table(listRef)
  // }


  // function majBtnPov() {
  //   // console.log(`function majBtnPov`)
  //   reference.value = visu.value[avancement].ref
  //   if (avancement === 0 ) reference.value = false
  //   disabledBtnSaveRef.value = false

  //   if (avancement === 0) disabledBtnPreviousRef.value = true 
  //   else disabledBtnPreviousRef.value = false

  //   if (avancement >= listRef[listRef.length - 1]) disabledBtnLastRef.value = true
  //   else disabledBtnLastRef.value = false

  //   disabledBtnNextRef.value = true
  //   for (let i=0; i< listRef.length; i++) {  
  //     if (listRef[i] > avancement) disabledBtnNextRef.value = false
  //   }
  // }


  // function majBtnDistance() {
  //   if (avancement === 0) {
  //     disabledBtnDepart.value=true
  //     disabledBtnM1k.value=true
  //     disabledBtnM100m.value=true
  //     disabledBtnP1k.value=false
  //     disabledBtnP100m.value=false
  //     disabledBtnArrivee.value=false

  //   } else if (avancement < 10 ){
  //     disabledBtnDepart.value=false
  //     disabledBtnM1k.value=true
  //     disabledBtnM100m.value=false
  //     disabledBtnP1k.value=false
  //     disabledBtnP100m.value=false
  //     disabledBtnArrivee.value=false

  //   } else if ((avancement >= 10) && (avancement <= visu.value.length - 10 )) {
  //     disabledBtnArrivee.value=false
  //     disabledBtnP1k.value=false
  //     disabledBtnP100m.value=false
  //     disabledBtnDepart.value=false
  //     disabledBtnM100m.value=false
  //     disabledBtnM1k.value=false

  //   } else if ((avancement > visu.value.length - 10 ) && (avancement < visu.value.length -1)) {
  //     disabledBtnArrivee.value=false
  //     disabledBtnP1k.value=true
  //     disabledBtnP100m.value=false
  //     disabledBtnDepart.value=false
  //     disabledBtnM100m.value=false
  //     disabledBtnM1k.value=false

  //   } else {
  //     avancement = visu.value.length - 1
  //     disabledBtnArrivee.value=true
  //     disabledBtnP1k.value=true
  //     disabledBtnP100m.value=true
  //     disabledBtnDepart.value=false
  //     disabledBtnM100m.value=false
  //     disabledBtnM1k.value=false
  //   } 
  // }



  function setCamera (reload=false) {
    // console.log(`setCamera : ${zoom.value}`)
    
    if ((reload) || (avancement <= lastRef)) {
      map.flyTo({ 
        center: visu.value[avancement].lookAt,  
        bearing: visu.value[avancement].cap, 
        zoom: visu.value[avancement].zoom,
        pitch: visu.value[avancement].pitch,
        essential: true, 
        duration: 250
      })

    } else {
      map.flyTo({ 
        center: visu.value[avancement].lookAt,  
        zoom: zoom.value,
        essential: true, 
        duration: 250
      })
    }

    position.setData({type: 'Point', coordinates :visu.value[avancement].lookAt})
    
    map.setPaintProperty(
      "animationTrace",
      "line-gradient",
      [
        "step",
        ["line-progress"],
        "rgba(127, 127, 0, 0.7)",
        avancement / (longueurTrace * 10),  
        "rgba(0, 0, 0, 0)",
      ]
    )
  }

  function modCamera (zoom, cap, pitch) {
    map.flyTo({ 
      bearing: cap, 
      zoom: zoom,
      pitch : pitch,
      essential: true, 
      duration: 1000
    })
  }



  // function setZoom(facteur) {
  //   // console.log(`Fonction zoomOut`)
  //   zoom.value = zoom.value + facteur
  //   if (zoom.value < 2) zoom.value = 2
  //   if (zoom.value > 22) zoom.value = 22
  //   modCamera(zoom.value, cap.value, pitch.value)
  // }

  // function setCap(angle) {
  //   cap.value = cap.value + angle
  //   if (cap.value > 180) cap.value = cap.value - 360
  //   if (cap.value <= -180) cap.value = cap.value + 360
  //   // console.log(`Fonction setPitch - cap : ${cap.value}`)
  //   modCamera(zoom.value, cap.value, pitch.value)
  // }

  // function setElevation(angle) {
  //   pitch.value = pitch.value + angle
  //   // console.log(`Fonction setPitch - pitch : ${pitch.value}`)
  //   modCamera(zoom.value, cap.value, pitch.value)
  // }


  // function km0 () {
  //   // console.log(`Fonction km0`) 
  //   avancement = 0 
  //   distance.value = 0
  //   setCamera()
  //   majBtnDistance()
  //   majBtnPov()
  // }

  // function kmFin() {
  //   // console.log(`Fonction kmFin`)
  //   avancement = visu.value.length - 1
  //   distance.value = avancement / 10
  //   setCamera()
  //   majBtnDistance()
  //   majBtnPov()
  // }

  // function deltaTrace(delta) {
  //   // console.log(`Fonction deltaTrace : ${delta}`)
  //   avancement = avancement + delta
  //   distance.value = avancement / 10
  //   setCamera()
  //   majBtnDistance()
  //   majBtnPov()
  // }


  function checkCap() {
    // console.log(`Fonction checkCap `)
    // console.log(listRef[0])
    let ref=listRef[0]
    // console.table(visu.value[0].cap)
    let previousCap = visu.value[ref].cap
        alarmes.value.splice([alarmes.value.findIndex(alarme => alarme.id > 8000000)])

    for (let i=1; i< listRef.length; i++) {
      let  refI=listRef[i]
      let refCap = visu.value[refI].cap
      if ((Math.cos(previousCap*Math.PI/180) < 0 ) && (Math.cos(refCap*Math.PI/180) < 0 )) {
        if (previousCap < 0) previousCap+=360
        if (refCap < 0) refCap+=360
      }
      if ((Math.abs(refCap - previousCap) > 90) && (listRef[i] - listRef[i-1] > 1)){
        console.warn(`Cap supérieur à 90° au km : ${listRef[i]/10}`)
        // On mote une alarme
        alarmes.value.push({
          id: 8000000 + listRef[i],
          type: 'amber-accent-3',
          text: `Attention : Écart de cap supérieur à 90° au km : ${listRef[i]/10}`,
          closable: false,
          icon: "mdi-compass-off-outline"
        })
      }
      previousCap = refCap
    }
  }


  function saveVisu(visu) {
    // console.log(`Fonction saveVisu`)
    let url = `http://localhost:4000/api/visu/` + zpad(props.id, 6)

    fetch(url, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json; charset=UTF-8' 
      }, 
      body: JSON.stringify({visu : visu}), 
      signal: AbortSignal.timeout(4000) 
    })
    .then((rep) => {
      return rep.json()
    })
    .then((json) => {
      // On lit le 
    })
    .catch((err) => {
      console.error(`Erreur JsonTrace : ${err}`)
    })


  }
  


  // function saveRef() {
  //   // console.log(`Fonction saveRef`)
  //   let url = `http://localhost:4000/api/visu/` + zpad(props.id, 6)

  //   fetch(url, { 
  //     method: 'POST', 
  //     headers: { 
  //       'Content-Type': 'application/json; charset=UTF-8' 
  //     }, 
  //     body: JSON.stringify({visu : visu.value}), 
  //     signal: AbortSignal.timeout(4000) 
  //   })
  //   .then((rep) => {
  //     return rep.json()
  //   })
  //   .then((json) => {
  //     // On lit le 
  //   })
  //   .catch((err) => {
  //     console.error(`Erreur JsonTrace : ${err}`)
  //   })


  // }

//   function easing(t) {
//     return t * (2 - t);
// }

//   function capChange(cap) {
//     console.log(`fonction capChange : ${cap}`)
 
//       map.easeTo({
//                     bearing: map.getBearing() - cap,
//                     easing: easing
//                 });
    
//   }

//   function toFrom(distance) {
//     map.panBy([0, -distance], {
//                     easing: easing
//                 });
//   }





  function newPosition(position, reload=false) {
    // console.log(`Camera.vue newPosition : ${position}`)
    avancement = position
    setCamera(reload || relaodAuto)
  }

function majAuto(maj) {
  relaodAuto = maj
}

  function newZoom(newZoom) {
    // console.log(`Camera.vue NewZoom : ${newZoom}`)
    zoom.value = newZoom
    modCamera(zoom.value, cap.value, pitch.value)
  }

  function newPitch(newPitch) {
    // console.log(`Camera.vue NewPitch : ${newPitch}`)
    pitch.value = newPitch
    modCamera(zoom.value, cap.value, pitch.value)
  }

  function newCap(newCap) {
    // console.log(`Camera.vue NewCap : ${newCap}`)
    cap.value = newCap
    modCamera(zoom.value, cap.value, pitch.value)
  }


  /**
   * 
   */
  function home() {
    router.push({ path: `/` })
  }

</script>

