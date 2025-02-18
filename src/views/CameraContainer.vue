<template>
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

    <CameraCmdWidget
      :disabledSave= "disabledBtnSave"
      :disabledVerifier="disabledBtnVerifier"
      :disabledPitchPPlus = "disabledBtnPitchPPlus"
      :disabledPitchPlus = "disabledBtnPitchPlus"
      :disabledPitchMoins = "disabledBtnPitchMoins"
      :disabledPitchMMoins = "disabledBtnPitchMMoins"
      @zoomIn="setZoom(0.5)"
      @zoomOut="setZoom(-0.5)"
      @capPlusPlus="setCap(10)"
      @capPlus="setCap(2)"
      @capMoins="setCap(-2)"
      @capMoinsMoins="setCap(-10)"
      @pitchPlusPlus="setElevation(5)"
      @pitchPlus="setElevation(1)"
      @pitchMoins="setElevation(-1)"
      @pitchMoinsMoins="setElevation(-5)"
      @positionCamera="positionCamera"
      @check="reloadPosition"
      @save="savePositions"
    >
    </CameraCmdWidget>

    <TraceCmdwidget
      :disabledDepart="disabledBtnDepart"
      :disabledP1k="disabledBtnP1k"
      :disabledP100="disabledBtnP100m"
      :disabledM100="disabledBtnM100m"
      :disabledM1k="disabledBtnM1k"
      :disabledArrivee="disabledBtnArrivee"
      :distance="distance"
      @depart="km0"
      @moinsMille="deltaTrace(-10)"
      @moinsCent="deltaTrace(-1)"
      @plusCent="deltaTrace(1)"
      @plusMille="deltaTrace(10)"
      @arrivee="kmFin"
    >

    </TraceCmdwidget>
    
    
    <!-- <MapDataWidget
      :distanceTotale="distanceTotale"
      :distance="distance"
      :altitude="altitude"
    >
    </MapDataWidget> -->
  </v-container>
</template>
  

<script setup>
  import MapHomeWidget from '@/components/MapHomeWidget.vue';
  import MapDataWidget from '@/components/MapDataWidget.vue';
  import CameraCmdWidget from '@/components/CameraCmdWidget.vue';
  import TraceCmdwidget from '@/components/TraceCmdwidget.vue';
  import { useRouter } from 'vue-router';

  import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
  import { zpad } from "../scripts/utils.js" 
  import mapboxgl from 'mapbox-gl';
  import {ref, onMounted, onUnmounted} from 'vue' 
  import * as turf from '@turf/turf'
  import {mapLoadLayers, mapMaskSymbols, mapAdd3D} from "../scripts/mapLayers" 
  import {setPositions} from "../scripts/camera"

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
  

  const disabledBtnHome = ref(true)
  const disabledBtnDepart = ref(false)
  const disabledBtnP1k = ref(false)
  const disabledBtnP100m = ref(false)
  const disabledBtnM100m = ref(true)
  const disabledBtnM1k = ref(true)
  const disabledBtnArrivee = ref(false)
  const distanceTotale = ref(0)
  const distance = ref(0)

  const disabledBtnSave = ref(true)
  const disabledBtnVerifier = ref(false)
  const disabledBtnPitchPPlus = ref(false)
  const disabledBtnPitchPlus = ref(false)
  const disabledBtnPitchMoins = ref(false)
  const disabledBtnPitchMMoins = ref(false)

  let zoom = 16
  let cap = 0
  let elevation = 60
  // let initPositionsCamera = false


  let positionsCamera = []    

  // Récupération des données du circuit
  let urlTrace = `http://localhost:4000/api/trace100m/` + zpad(props.id, 6)
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

    console.log(`Longueur de la trace : ${longueurTrace}`) 
  })
  .catch((err) => {
    console.error(`Erreur JsonTrace : ${err}`)
  })

  // Récupération des données camera
  let urlCamera = `http://localhost:4000/api/camera/` + zpad(props.id, 6)
  // let camera = [{point: [0,0], cap: 0,  start: false}]
  let camera = []
  
  fetch(urlCamera, { method: 'GET', signal: AbortSignal.timeout(4000) })
  .then((rep) => {
    return rep.json()
  })
  .then((jsonCamera) => {
    // On lit le 
    // camera[0] = {point: [0,0], cap: 0,  start: false}
    for (let key = 0; key < jsonCamera.length; key++) {
      camera.push({
        cap: jsonCamera[key].cap,
        point: [jsonCamera[key].point[0], jsonCamera[key].point[1]],
        altitude: jsonCamera[key].point[2],
        start: false})
    }
    console.log(`Nombre de segment camera : ${camera.length}`)     

  })
  .catch((err) => {
    console.error(`Erreur JsonCamera: ${err}`)
  })


  onMounted(() => {
    // On prend intercepte le clavier
    window.addEventListener('keypress', keyboard)

    // console.log(`On charge mmap props.id : ${props.id}`)
    // On initialise la carte au montage du composant
    try {
      map = new mapboxgl.Map({
        container: "mapContainer",
        style:  initStyle,
        center: [initCenterLon, initCenterLat],
        zoom: initZoom,
        bearing : initBear,
        pitch: initPitch
      })


    } catch (error) {console.log(error)}
  
    
    // On charge les données graphiques pour le rendu
    mapLoadLayers(map, trace)

    // On charge le relief, le ciel et le brouillard
    mapAdd3D(map)

    // Lancement de l'annimation qui part de Paris et pointe vers le départ
    // console.log("On lance l'annimation du départ")
    map.on('load', async () => {
      map.flyTo({  center: camera[0].point,
        bearing: camera[0].cap, 
        zoom: 16, pitch:60, duration: 2500
      })
    });

    // console.log("On lance la suite")
    map.once('moveend', async () => {
      position = map.getSource('point')
      disabledBtnHome.value=false
      // disabledBtnArrivee.value=false
      // disabledBtnP1k.value=false
      // disabledBtnP100m.value=false
      cap = camera[0].cap
      setCamera(0)
      positionCamera() 

      // window.requestAnimationFrame(frame);
    });
  })



  onUnmounted(() => {
    console.log("On detruit la carte")
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





function setCamera (avancement) {
  map.flyTo({ 
    center: camera[avancement].point,  
    //bearing: camera[avancement].cap, 
    // zoom: 16.5,
    essential: true, 
    duration: 1000
  })
  position.setData({type: 'Point', coordinates :camera[avancement].point})
  map.setPaintProperty(
    "animationTrace",
    "line-gradient",
    [
      "step",
      ["line-progress"],
      "white",
      avancement / (longueurTrace * 10),  
      "rgba(0, 0, 0, 0)",
    ]
  )
}

function modCamera (zoom, cap, elevation) {
  map.flyTo({ 
    bearing: cap, 
    zoom: zoom,
    pitch : elevation,
    essential: true, 
    duration: 1000
  })
}

  let position 
  let avancement = 0

  
function reloadPosition() {
  console.table(positionsCamera)
  modCamera(positionsCamera[avancement].zoom, positionsCamera[avancement].cap, positionsCamera[avancement].pitch)
}

function savePositions() {
  let url = `http://localhost:4000/api/camera/` + zpad(props.id, 6)

  fetch(url, { 
    method: 'POST', 
    headers: { 
      'Content-Type': 'application/json; charset=UTF-8' 
    }, 
    body: JSON.stringify({positionsCamera: positionsCamera}), 
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


function setZoom(facteur) {
  // console.log(`Fonction zoomOut`)
  zoom = zoom + facteur
  modCamera(zoom, cap, elevation)
}

function setCap(angle) {
  cap = cap + angle
  if (cap > 180) cap = cap - 360
  if (cap < -180) cap = cap + 360
  // console.log(`Fonction setPitch - cap : ${cap}`)
  modCamera(zoom, cap, elevation)
}

function setElevation(angle) {
  elevation = elevation + angle
  if (elevation >= 85) {
    elevation = 85
    disabledBtnPitchPPlus.value = true
    disabledBtnPitchPlus.value = true
  } else if (elevation > 80) {
    disabledBtnPitchPPlus.value = true
    disabledBtnPitchPlus.value = false
  } else if (elevation <= 0) {
    elevation = 0
    disabledBtnPitchMoins.value = true
    disabledBtnPitchMMoins.value = true
  } else if (elevation < 5 ){
    disabledBtnPitchMoins.value = false
    disabledBtnPitchMMoins.value = true
  } else {
    disabledBtnPitchPPlus.value = false
    disabledBtnPitchPlus.value = false
    disabledBtnPitchMoins.value = false
    disabledBtnPitchMMoins.value = false

  }
  // console.log(`Fonction setPitch - elevation : ${elevation}`)
  modCamera(zoom, cap, elevation)
}

function positionCamera() {
  // console.log(`Fonction positionCamera`)
  
  const bearing = map.getBearing()
  const position = map.getFreeCameraOptions().position;
  const lngLat = position.toLngLat();
  const altitude = position.toAltitude();

  // console.log(`Position Caméra : Latitude: ${lngLat.lat}, Longitude: ${lngLat.lng}, Altitude: ${altitude}, Angle : ${bearing}, Zoom: ${zoom}`)
  // console.table(`cible : ${camera[avancement].point}`)
  // On force l'intialisation de la caméra sur le point de départ
  // if (!initPositionsCamera) {
  //   positionsCamera[0] = {
  //     "start": 0, 
  //     "longueur": 0, 
  //     "positionCamera": [lngLat.lng, lngLat.lat], 
  //     "cap": bearing,
  //     "zoom": zoom,
  //     "pitch": elevation,
  //     "lookAtPoint": camera[avancement].point,
  //     "set": true
  //   }
  //   disabledBtnArrivee.value=false
  //   disabledBtnP1k.value=false
  //   disabledBtnP100m.value=false
  //   initPositionsCamera = true

  // } else {
    for(let index = positionsCamera.length; index<avancement; index++ ) {
      positionsCamera[index] = {"start": index, "set": false}
    }
    positionsCamera[avancement] = {
      "start": avancement, 
      "longueur": 0, 
      "positionCamera": [lngLat.lng, lngLat.lat], 
      "cap": bearing,
      "zoom": zoom,
      "pitch": elevation,
      "lookAtPoint": camera[avancement].point,
      "set": true
    }
    setPositions(positionsCamera, avancement) 
    disabledBtnVerifier.value = false
  // }
  // console.table(positionsCamera)
}

function km0 () {
  // console.log(`Fonction km0`) 
  avancement = 0 
  disabledBtnArrivee.value=false
  disabledBtnP1k.value=false
  disabledBtnP100m.value=false
  disabledBtnDepart.value=true
  disabledBtnM100m.value=true
  disabledBtnM1k.value=true
  distance.value = 0
  setCamera(avancement)
}

function kmFin() {
  // console.log(`Fonction kmFin`)
  avancement = camera.length - 1
  disabledBtnArrivee.value=true
  disabledBtnP1k.value=true
  disabledBtnP100m.value=true
  disabledBtnDepart.value=false
  disabledBtnM100m.value=false
  disabledBtnM1k.value=false
  setCamera(avancement)
}

function deltaTrace(delta) {
  // console.log(`Fonction deltaTrace : ${delta}`)
  avancement = avancement + delta
  console.log(`Avancement : ${avancement}, sur : ${camera.length}, delta : ${delta}`)
  if(avancement <= 0 ){
    avancement = 0 
    disabledBtnDepart.value=true
    disabledBtnM1k.value=true
    disabledBtnM100m.value=true
    disabledBtnP1k.value=false
    disabledBtnP100m.value=false
    disabledBtnArrivee.value=false

  } else if (avancement < 10 ){
    disabledBtnDepart.value=false
    disabledBtnM1k.value=true
    disabledBtnM100m.value=false
    disabledBtnP1k.value=false
    disabledBtnP100m.value=false
    disabledBtnArrivee.value=false

  } else if ((avancement >= 10) && (avancement <= camera.length - 10 )) {
    disabledBtnArrivee.value=false
    disabledBtnP1k.value=false
    disabledBtnP100m.value=false
    disabledBtnDepart.value=false
    disabledBtnM100m.value=false
    disabledBtnM1k.value=false

  } else if ((avancement > camera.length - 10 ) && (avancement < camera.length -1)) {
    disabledBtnArrivee.value=false
    disabledBtnP1k.value=true
    disabledBtnP100m.value=false
    disabledBtnDepart.value=false
    disabledBtnM100m.value=false
    disabledBtnM1k.value=false

  } else {
    avancement = camera.length - 1
    disabledBtnArrivee.value=true
    disabledBtnP1k.value=true
    disabledBtnP100m.value=true
    disabledBtnDepart.value=false
    disabledBtnM100m.value=false
    disabledBtnM1k.value=false

  } 
  distance.value = avancement/10
  setCamera(avancement)
  if (avancement === camera.length - 1) {
      disabledBtnSave.value = false
    }
  if (avancement >= positionsCamera.length) {
    disabledBtnVerifier.value = true
  } else {
    disabledBtnVerifier.value = false
  }
}

/**
 * 
 */
function home() {
  router.push({ path: `/` })
}

</script>

