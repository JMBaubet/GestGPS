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
      :vignette
      :vignetteSize="parseInt(vignetteSize)"
      @show-evt="fnShowEvt"
      @show-info="fnShowInfo"
      @show-curseur="fnShowCurseur"
      @voir-vignette="voirVignette"
      @aff-vignette="affVignette"
    ></IhmConfiguration>


    
    <CurseurCenter
    :mask = maskCurseur
    >
    </CurseurCenter>
    
    <EvtVignetteSelection
    :mask = maskVignetteSelection
    @new-vignette="newVignette"
    @new-size="newSize"
    @voir="voirVignette"
    ></EvtVignetteSelection>

  </v-container>
</template>
  

<script setup>
  import MapHomeWidget from '@/components/MapHomeWidget.vue';
  import CurseurCenter from '@/components/CurseurCenter.vue';
  import IhmConfiguration from '@/components/IhmConfiguration.vue';
  import EvtVignetteSelection from '@/components/EvtVignetteSelection.vue'; 
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
  const urlSvg = import.meta.env.VITE_URL_SVG
  const vignetteDefaultSize = import.meta.env.VITE_VIGNETTE_DEFAULT_SIZE
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
  const vignette = ref("")
  const vignetteSize = ref(vignetteDefaultSize)

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
  let showEvt = false
  let showInfo = false
  let showCurseur = false
  const maskVignetteSelection = ref(true)
  const maskCurseur = ref(true)
  let divVignette
  let markerVignette


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
  


  function newPosition(position, reload=false) {
    // console.log(`Camera.vue newPosition : ${position}`)
    avancement = position
    setCamera(reload || relaodAuto)
    affVignette(null)
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

function fnShowEvt(evt) {
  // console.log(`CameraContainer - fnShowEvt : ${evt}`)
  showEvt = evt
  if (showEvt && showInfo) maskVignetteSelection.value = false
  else maskVignetteSelection.value = true
  if (showEvt && showCurseur) maskCurseur.value = false
  else maskCurseur.value = true
}

function fnShowInfo(info) {
  // console.log(`CameraContainer - fnShowInfo : ${info}`)
  showInfo = info
  if (showEvt && showInfo) maskVignetteSelection.value = false
  else maskVignetteSelection.value = true
}

function fnShowCurseur(curseur) {
  // console.log(`CameraContainer - showCurseur : ${curseur}`)
  showCurseur = curseur
  if (showEvt && showCurseur) maskCurseur.value = false
  else maskCurseur.value = true
}

function affVignette(vignette) {
  console.log(`affVignette`)

  console.log(`on affiche la vignette`) 
  try {
    markerVignette.remove()
  } catch (err){
  }
  if (vignette !== null ){
    console.table(`${vignette.id}`)
    divVignette = document.createElement('div');
    divVignette.id = "visuVignette"
    divVignette.style.backgroundImage = `${urlSvg}${vignette.fichier}`
    divVignette.style.width = `${vignette.taille}px`
    divVignette.style.height = `${vignette.taille}px`
    // markers[elements[listEvts[indexEvt]][nbr].id].style.zIndex = 101
    divVignette.style.backgroundSize = '100%';

    // const offset = -evt[indexMarker].marker.taille / 2
    markerVignette = new mapboxgl.Marker({ element: divVignette, offset: [vignette.taille/2, vignette.taille/-6] })
      .setLngLat(vignette.coord)
      .addTo(map);
  } else {    
    console.log(`${vignette}`)
  }
}

function newVignette(vignetteSel){
  console.log(`newVignette, ${vignetteSel}`)
  vignette.value=vignetteSel
}

function newSize(size){
  console.log(` CameraContainer.vue - newSize, ${size}`)
  vignetteSize.value=size
  console.log(vignetteSize.value)
}

function voirVignette(){
  console.log(`voirVignette`)

  console.log(`on affiche la vignette : ${vignetteSize.value}`)
  try {
    markerVignette.remove()
  } catch (err){}
  divVignette = document.createElement('div');
  divVignette.id = "visuVignette"
  divVignette.style.backgroundImage = `${urlSvg}${vignette.value}.png`
  divVignette.style.width = `${vignetteSize.value}px`
  divVignette.style.height = `${vignetteSize.value}px`
  // markers[elements[listEvts[indexEvt]][nbr].id].style.zIndex = 101
  divVignette.style.backgroundSize = '100%';

  // const offset = -evt[indexMarker].marker.taille / 2
  markerVignette = new mapboxgl.Marker({ element: divVignette, offset: [vignetteSize.value/2, vignetteSize.value/-6] })
    .setLngLat(map.getCenter())
    .addTo(map);

}


  /**
   * 
   */
  function home() {
    router.push({ path: `/` })
  }

</script>

