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
  import { useRouter } from 'vue-router';

  import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
  import { zpad } from "../scripts/utils.js" 
  import mapboxgl from 'mapbox-gl';
  import {ref, onMounted, onUnmounted} from 'vue' 
  import * as turf from '@turf/turf'
  import {mapLoadLayers, mapMaskSymbols, mapAdd3D} from "../scripts/mapLayers" 
import { ca } from 'vuetify/locale';

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
  const coeffAnnimation= import.meta.env.VITE_COEFFICIENT_DUREE_ANIMATION

  let map = null
  let longueurTrace = 0
  let dureeAnimation

  const disabledBtnHome = ref(true)
  const distanceTotale = ref("0.0")
  const distance = ref("0.0")
  const altitude = ref()

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
    dureeAnimation = coeffAnnimation * longueurTrace

    console.log(`Longueur de la trace : ${longueurTrace}, Nombre de points : ${json.geometry.coordinates.length}`) 
  })
  .catch((err) => {
    console.error(`Erreur JsonTrace : ${err}`)
  })


  // // Récupération des données camera (Nouveau format)
  let urlCamera = `http://localhost:4000/api/camera3d/` + zpad(props.id, 6)
  // let camera = [{point: [0,0], cap: 0,  start: false}]
  let camera = []
  
  fetch(urlCamera, { method: 'GET', signal: AbortSignal.timeout(4000) })
  .then((rep) => {
    return rep.json()
  })
  .then((jsonCamera) => {
    // On lit le 
    // camera[0] = {point: [0,0], cap: 0,  start: false}
    // for (let key = 0; key < jsonCamera.length; key++) {
    //   camera.push({
    //     cap: jsonCamera[key].cap,
    //     point: [jsonCamera[key].point[0], jsonCamera[key].point[1]],
    //     altitude: jsonCamera[key].point[2],
    //     start: false})
    // }
    // console.log(`Nombre de segment camera : ${camera.length}`)
    camera = jsonCamera.camera     
    console.table(camera)

  })
  .catch((err) => {
    console.error(`Erreur JsonCamera: ${err}`)
  })


  // Récupération des données camera (ancien format)
  // let urlCamera = `http://localhost:4000/api/camera/` + zpad(props.id, 6)
  // // let camera = [{point: [0,0], cap: 0,  start: false}]
  // let camera = []
  
  // fetch(urlCamera, { method: 'GET', signal: AbortSignal.timeout(4000) })
  // .then((rep) => {
  //   return rep.json()
  // })
  // .then((jsonCamera) => {
  //   // On lit le 
  //   // camera[0] = {point: [0,0], cap: 0,  start: false}
  //   for (let key = 0; key < jsonCamera.length; key++) {
  //     camera.push({
  //       cap: jsonCamera[key].cap,
  //       point: [jsonCamera[key].point[0], jsonCamera[key].point[1]],
  //       altitude: jsonCamera[key].point[2],
  //       start: false})
  //   }
  //   // console.log(`Nombre de segment camera : ${camera.length}`)     
  //   console.log(camera[0].start)

  // })
  // .catch((err) => {
  //   console.error(`Erreur JsonCamera: ${err}`)
  // })


  onMounted(() => {
    // On intercepte le clavier
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

    const timer = setTimeout(loadMap, 500)

    function loadMap() {
    // Lancement de l'annimation qui part de Paris et pointe vers le départ

    console.log("On lance l'annimation du départ")
    
    map.flyTo({  center: camera[0].lookAtDebut,
        // bearing: camera[0].cap, 
        bearing: camera[0].capDebut, 
        zoom: camera[0].zoomDebut, 
        pitch:camera[0].pitchDebut, 
        duration: 7500
      })

    map.once('moveend', async () => {
      console.log("On lance la suite")

      position = map.getSource('point')
      window.requestAnimationFrame(frame);
    });

    }

  })



  onUnmounted(() => {
    console.log("On detruit la carte")
    mapboxgl.clearStorage();
    const t = (phase * dureeAnimation) + start
    start = t -  dureeAnimation
    console.log(start)
  })
  
  /**
   * 
   * @param e 
   */
  function keyboard(e) {
    // console.log(`Keyboard : ${e.key}`)
    console.log(e.key)
    if (e.key === "p") { playPause() }
    if (e.key === "r") {

      start = 0
//  window.requestAnimationFrame(frame)
    }
  }

  /**
   * 
   * @param time 
   */
  let start
  let debut
  let phase = 0
  let pause = true
  let timePause
  let startPause = true
  let position 
  let avancement
  let dureeSegment
  let startSegment
  let phaseSegment
  let altitudeDebut
  let altitudeFin

  debut = new Date()
  
  function frame(time) {

  // get the overall distance of each route so we can interpolate along them
  const routeDistance = turf.length(turf.lineString(trace));
  // const cameraRouteDistance = turf.length(turf.lineString(cameraRoute))
  let t=0

  if (!start) {
    disabledBtnHome.value=false
    start = time;
    // console.log(`start : ${start}, time : ${time}, phase = ${phase}`)
  }

  // phase determines how far through the animation we are
  if (pause !== true)  {
    phase = (time - start) / dureeAnimation;
    // console.log(`start : ${start}, time : ${time}, phase = ${phase}`)
    // distance.value = (dureeAnimation*phase/coeffAnnimation).toFixed(1)
    avancement = parseInt((dureeAnimation*phase/coeffAnnimation) * 10)
    // console.log(`Phase : ${phase}, distance : ${((dureeAnimation*phase/coeffAnnimation)/10).toFixed(2)}`)
    // console.log(`Avancement : ${phase * flyto.length / 10}`)
    // console.log(`start : ${start}, time : ${time}, phase = ${phase}`)
  }
  else { 
    console.log(`Nous sommes en pause`)
    if (startPause) {
      console.log(`Nous passons en pause`)
      phase = (time - start) / dureeAnimation;
      distance.value = (dureeAnimation*phase/coeffAnnimation).toFixed(1)

      startPause = false
      return
    } else {
      return
    }
  }

  // phase is normalized between 0 and 1
  // when the animation is finished, reset start to loop the animation
  if (phase > 1) return;





  // Gestion de la camera
  console.log(`Avancement : ${avancement}`)
  // console.log(`Longueur segment : ${camera[avancement].lg}`)
  dureeSegment = camera[avancement].lg * coeffAnnimation/10
  // startSegment = start + (camera[avancement].start * coeffAnnimation/10)
  startSegment = start + (camera[avancement].start * coeffAnnimation/10)
  phaseSegment = (time - startSegment) / dureeSegment
  const altitudeCamera = parseInt(camera[avancement].altitudeDebut + ((camera[avancement].altitudeFin - camera[avancement].altitudeDebut) * phaseSegment))

  // console.log(`Durée segment : ${dureeSegment}`)
  // console.log(`Start segment : ${startSegment}`)
  // console.log(`Phase segment : ${phaseSegment}`)
  // console.log(camera[avancement].positionCameraDebut, camera[avancement].positionCameraFin)
  // console.log(`altitude  caméra: ${altitudeCamera}`)
  
  const alongPositionCamera = turf.along(
    turf.lineString( [camera[avancement].positionCameraDebut, camera[avancement].positionCameraFin]),
    camera[avancement].positionCameraLongueur * phaseSegment
  ).geometry.coordinates;

  const alongLookAtCamera = turf.along(
    turf.lineString( [camera[avancement].lookAtDebut, camera[avancement].lookAtFin]),
    camera[avancement].lookAtLongueur * phaseSegment
  ).geometry.coordinates;

  // console.log(`Position : ${alongPositionCamera[0]}, ${alongPositionCamera[1]}, lookAt : ${alongLookAtCamera[0]}, ${alongLookAtCamera[1]}`)

  const alongRoute = turf.along(
  turf.lineString(trace),
    routeDistance * phase
  ).geometry.coordinates;

  const pov = map.getFreeCameraOptions();

  pov.position = mapboxgl.MercatorCoordinate.fromLngLat(
    {
      lng: alongPositionCamera[0],
      lat: alongPositionCamera[1]
    }, 
    altitudeCamera
  )

  // console.log(`Position caméra : ${alongPositionCamera[0]}, ${alongPositionCamera[1]} `)
  pov.lookAtPoint({
    lng: alongLookAtCamera[0],
    lat: alongLookAtCamera[1]
  });

  map.setFreeCameraOptions(pov);

  // use the phase to get a point that is the appropriate distance along the route
  // this approach syncs the camera and route positions ensuring they move
  // at roughly equal rates even if they don't contain the same number of points

  position.setData({type: 'Point', coordinates : [alongRoute[0], alongRoute[1]]})

  map.setPaintProperty(
    "animationTrace",
    "line-gradient",
    [
      "step",
      ["line-progress"],
      "rgba(155, 155, 155, 0.75)",
      phase,
      "rgba(0, 0, 0, 0)",
    ]
  )

  
  window.requestAnimationFrame(frame);
}

function playPause() {
  console.log(`Play Pause`)

  if (phase > 1) {
    start = 0
    for(let i=0; i<camera.length;i++)
        camera[i].start=false 

    window.requestAnimationFrame(frame)
  } else {
    if (pause) {
      // On relance l'annimation
      start = start + performance.now() - timePause
      window.requestAnimationFrame(frame)
      timePause = 0
      startPause = true
    } else {
      // On stop l'annimation
      if (!timePause) {
        timePause = performance.now();
        // console.table(map.getZoom())
        // console.log(`timePause : ${timePause}`)s
      }
    }
    pause = !pause
  }
  
}



function home() {
  router.push({ path: `/` })
}

</script>

