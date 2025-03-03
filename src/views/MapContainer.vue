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
    <MapDataWidget
      :distanceTotale="distanceTotale"
      :distance="distance"
      :altitude="altitude"
    >
    </MapDataWidget>

    <MapCmdWidget
    :pause="pause"
    :disabledPlayPause=disabledPlayPause
    :disabledReprise=disabledReprise
    @playPause="playPause()"
    ></MapCmdWidget>
  </v-container>
</template>
  

<script setup>
  import MapHomeWidget from '@/components/MapHomeWidget.vue';
  import MapDataWidget from '@/components/MapDataWidget.vue';
  import MapCmdWidget from '@/components/MapCmdWidget.vue';

  import { useRouter } from 'vue-router';

  import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
  import { zpad } from "../scripts/utils.js" 
  import mapboxgl from 'mapbox-gl';
  import {ref, onMounted, onUnmounted} from 'vue' 
  import * as turf from '@turf/turf'
  import {mapLoadLayers, mapMaskSymbols, mapAdd3D} from "../scripts/mapLayers" 
  import {initEvt, traiteEvt, flyToEvt, endFlyToEvt} from '../scripts/mapEvt'
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

  const disabledPlayPause = ref(true)
  const disabledReprise = ref(true)
  const pause = ref(false)


  let map = null
  let trace = []
  let visu = []
  let evt = []
  let flyToState = false

  let longueurTrace = 0
  let dureeAnimation

  const disabledBtnHome = ref(true)
  const distanceTotale = ref("0.0")
  const distance = ref("0.0")
  const altitude = ref()

  // Récupération des données du circuit 
  let urlTrace = `http://localhost:4000/api/lineString/` + zpad(props.id, 6)
  
  fetch(urlTrace, { method: 'GET', signal: AbortSignal.timeout(4000) })
  .then((rep) => {
    return rep.json()
  })
  .then((json) => {
    // On recopie dans le tableau trace uniquement les coordonnées 
    for (let key = 0; key < json.geometry.coordinates.length; key++) {
      // console.log(json.geometry.coordinates[key][0], json.geometry.coordinates[key][1])
      trace.push([json.geometry.coordinates[key][0], json.geometry.coordinates[key][1]])
    }

    longueurTrace = turf.length(json.geometry)
    distanceTotale.value= longueurTrace.toFixed(1)
    dureeAnimation = coeffAnnimation * longueurTrace

    // console.log(`Longueur de la trace : ${longueurTrace}, Nombre de points : ${json.geometry.coordinates.length}`) 
  })
  .catch((err) => {
    console.error(`Erreur JsonTrace : ${err}`)
  })


  // // Récupération des données camera (Nouveau format)
  let urlVisu = `http://localhost:4000/api/visu/` + zpad(props.id, 6)
  
  fetch(urlVisu, { method: 'GET', signal: AbortSignal.timeout(4000) })
  .then((rep) => {
    return rep.json()
  })
  .then((visuJson) => {
    // On recopie les données dans le tableau visu
    visu = visuJson.slice()
    let start
    let longueur
    // On met à jour les données intermédiaires start et longueur pour les points non référencés.
    for (let i=0; i < visu.length; i++) {
      if (visu[i].ref === true) {
        start = visu[i].start
        longueur = visu[i].longueur
      } else {
        visu[i].start = start
        visu[i].longueur = longueur
      }

    }     
    // console.table(visu)
  })
  .catch((err) => {
    console.error(`Erreur JsonCamera: ${err}`)
  })

  // Récupération des données évènement
  let urlEvt = `http://localhost:4000/api/evt/` + zpad(props.id, 6)
  
  fetch(urlEvt, { method: 'GET', signal: AbortSignal.timeout(500) })
  .then((rep) => {
    return rep.json()
  })
  .then((json) => {
    evt = json.slice()
    // on initialise les données évènements
    // console.table(evt)
    initEvt(evt)
  })
  .catch((err) => {
    console.error(`Erreur Evt : ${err}`)
  })



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
      // console.log(`fonction loadMap`)
      // Lancement de l'annimation qui part de Paris et pointe vers le départ
      // console.table(visu)
      // console.log(`On lance l'annimation du départ vers : ${visu[0].lookAt}`)
      // let retour = traiteEvt(map, evt, 0)
      // if (retour.pause === true) playPause()

      map.flyTo({  center: visu[0].lookAt,
          // bearing: camera[0].cap, 
          bearing: visu[0].cap, 
          zoom: visu[0].zoom, 
          pitch:visu[0].pitch, 
          duration: 7500
        })

      map.once('moveend', async () => {
        // console.log("On lance la suite")
        disabledPlayPause.value = false
        position = map.getSource('point')
        window.requestAnimationFrame(frame);
    });
    }
  })



  onUnmounted(() => {
    // console.log("On detruit la carte")
    mapboxgl.clearStorage();
    const t = (phase * dureeAnimation) + start
    start = t -  dureeAnimation
    // console.log(start)
  })
  
  /**
   * 
   * @param e 
   */
  function keyboard(e) {
    // console.log(`Keyboard : ${e.key}`)
    // console.log(e.key)
    if (e.key === "p") { 
      if (flyToState !== true) {        
        playPause()
    } 
    }
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
  let phase = 0
  let timePause
  let startPause = true
  let position 
  let avancement
  let dureeSegment
  let startSegment
  let phaseSegment
  let altitudeDebut
  let altitudeFin

  
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
  if (pause.value !== true)  {
    phase = (time - start) / dureeAnimation;
    avancement = parseInt((dureeAnimation*phase/coeffAnnimation) * 10)
    distance.value = (dureeAnimation*phase/coeffAnnimation).toFixed(1)

    // Traitement des évènements
    let retour = traiteEvt(map, evt, avancement)
    if (retour.pause === true) playPause()  // On a une pause de progrmmée.
    if (retour.flyTo !== 0) {               // On a un flyTo de programmé. La pause a été faite
      disabledPlayPause.value = true
      flyToState = true                     // On interdit la prise en compte d'une pause
      flyToEvt(map, retour.flyTo)
      map.once('moveend', function() {      // On attend la fin du flyTo pour lancer l'attente sur le retour
        // console.log(`On attend le click souris`)
        endFlyToEvt(map, avancement)        // On attend un click souris pour lancer le retour au point de départ
        map.once('moveend', function() {      // Le click souris a été fait 
          // console.log(`On met un message`)
          disabledReprise.value = false
          map.once('moveend', function() {
            flyToState = false
            disabledReprise.value = true
            playPause()
            disabledPlayPause.value = false
          })
        })
      })
    }


  }
  else { 
    // console.log(`Nous sommes en pause`)
    if (startPause) {
      // console.log(`Nous passons en pause`)
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
  dureeSegment = visu[avancement].longueur * coeffAnnimation/10
  startSegment = start + (visu[avancement].start * coeffAnnimation/10)
  phaseSegment = (time - startSegment) / dureeSegment
  const avancementStart = visu[avancement].start
  const avancementFin = visu[avancement].start + visu[avancement].longueur

  const altDebut = visu[avancementStart].altitudeCamera 
  const altFin = visu[avancementFin].altitudeCamera

  const altitudeCamera = parseInt(altDebut + ((altFin - altDebut) * phaseSegment))
  const positionCameraDebut = visu[avancementStart].positionCamera
  const positionCameraFin = visu[avancementFin].positionCamera
  const positionCameraLongueur = turf.distance(positionCameraDebut, positionCameraFin)

  const alongPositionCamera = turf.along(
    turf.lineString( [positionCameraDebut, positionCameraFin]),
    positionCameraLongueur * phaseSegment
  ).geometry.coordinates;


  const lookAtDebut = visu[visu[avancement].start].lookAt
  const lookAtFin = visu[visu[avancement].start + visu[avancement].longueur].lookAt
  const lookAtLongueur = turf.distance(lookAtDebut, lookAtFin)

  const alongLookAtCamera = turf.along(
    turf.lineString( [lookAtDebut, lookAtFin]),
    lookAtLongueur * phaseSegment
  ).geometry.coordinates;

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
      "rgba(155, 155, 255, 0.75)",
      phase,
      "rgba(0, 0, 0, 0)",
    ]
  )

  window.requestAnimationFrame(frame);
}

function playPause() {
  // console.log(`Play Pause`)

  if (phase > 1) {
    start = 0
    for(let i=0; i<visu.length;i++)
        visu[i].start=false 

    window.requestAnimationFrame(frame)
  } else {
    if (pause.value) {
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
    pause.value = !pause.value
  }
  
}


function home() {
  router.push({ path: `/` })
}

</script>

