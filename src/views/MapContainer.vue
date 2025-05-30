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
      :showData="showData"
      :distanceTotale="distanceTotale"
      :distance="distance"
      :altitude="altitude"
    >
    </MapDataWidget>

    <MapCmdWidget
    :etat
    :pause="pause"
    :disabledPlayPause=disabledPlayPause
    :disabledReprise=disabledReprise
    @playPause="playPause()"
    @reprise="reprise()"
    @arriere="back()"
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
  import {resetIndexEvt, initEvt, traiteEvt, flyToEvt, endFlyToEvt, delVignettes} from '../scripts/mapEvt'
  import { ca, et } from 'vuetify/locale';

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
  let coeffAnnimation= import.meta.env.VITE_COEFFICIENT_DUREE_ANIMATION
  const showTraceOnStart = import.meta.env.VITE_MAPBOX_START_SHOW_TRACE
  const timerShowTraceOnStart = parseInt(import.meta.env.VITE_MAPBOX_START_SHOW_TRACE_TIMER)
  const showEndTrace = import.meta.env.VITE_MAPBOX_END_SHOW_TRACE
  const pinDepart = import.meta.env.VITE_PIN_DEPART
  const pinArrivee = import.meta.env.VITE_PIN_ARRIVEE
  const urlSvg = import.meta.env.VITE_URL_SVG


  
  const etat = ref("init")
  // console.log(`etat : ${etat.value}`)

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
  const showData = ref(true)

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
  let bounds



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
    // On initialise la carte au montage du composant pour avoir une vue globale de la terre
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
  
    
    // On charge le relief, le ciel et le brouillard
    mapAdd3D(map)

    // On charge dans l'objet map les données graphiques pour le rendu
    mapLoadLayers(map, trace)


    // On attend 500 ms pour avoir le temps de telecharger les fichiers de données
    const timer = setTimeout(loadMap, 500)
  }) 


  onUnmounted(() => {
    // console.log("On detruit la carte")
    mapboxgl.clearStorage();
    const t = (phase * dureeAnimation) + start
    start = t -  dureeAnimation
    // console.log(start)
  })


  function loadMap() {
    // console.log(`fonction loadMap`)
    // Lancement de l'annimation qui part de Paris et pointe vers le départ
    // console.table(visu)
    // console.log(`On lance l'annimation du départ vers : ${visu[0].lookAt}`)
    // let retour = traiteEvt(map, evt, 0)
    // if (retour.pause === true) playPause()

    bounds = trace.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(trace[0], trace[0]));

    // console.table(bounds)

    

    if (showTraceOnStart === "true") {
      // On ajoute une étiquette sur le point de départ
      console.log("On ajoute l'étiquette de départ")
      let divStart = document.createElement('div');
      divStart.id = 'startEtiquette'
      divStart.style.backgroundImage = `${urlSvg}${pinDepart}`
      divStart.style.width = `120px`
      divStart.style.height = `120px`
      // markers[elements[listEvts[indexEvt]][nbr].id].style.zIndex = 101
      divStart.style.backgroundSize = '100%';

      const offset = -60
      let markerStart= new mapboxgl.Marker({ element: divStart, offset: [ 60, -20 ] })
        .setLngLat(visu[0].lookAt)
        .addTo(map);



      map.fitBounds(bounds, {
      padding: 75, // équivalent au padding dans transitionToOverviewState
      duration: 5000, // durée en millisecondes
      essential: true
    });
      map.once('moveend', async () => {
        setTimeout(() => {
          map.flyTo({  center: visu[0].lookAt,
            // bearing: camera[0].cap, 
            bearing: visu[0].cap, 
            zoom: visu[0].zoom, 
            pitch:visu[0].pitch, 
            duration: 7500
          })

          }, timerShowTraceOnStart
        )

        map.once('moveend', async () => {
          markerStart.remove()
          // console.log("On lance la suite")
          etat.value="run"
          // console.log(`etat : ${etat.value}`)
          disabledPlayPause.value = false
          position = map.getSource('point')
          window.requestAnimationFrame(frame);
        });
      })
    } else {
        map.flyTo({  center: visu[0].lookAt,
          // bearing: camera[0].cap, 
          bearing: visu[0].cap, 
          zoom: visu[0].zoom, 
          pitch:visu[0].pitch, 
          duration: 7500
        })
        
        map.once('moveend', async () => {
        // console.log("On lance la suite")
        etat.value="run"
        console.log(`etat : ${etat.value}`)
        disabledPlayPause.value = false
        position = map.getSource('point')
        window.requestAnimationFrame(frame);
        });
    }
  } //loadMap
  



  
  /**
   * 
   * @param e 
   */
  function keyboard(e) {
    
   
    if (e.key === "d") showData.value = !showData.value

    // if (e.key === "b") {
    //   back()
    // }
    // if (e.key === "p") { 
    //   playPause()
    // }

    switch(etat.value) {
      case  "init" :
      break
      case  "run" :
        if (e.key === "b") {
          back()
        }
        if (e.key === "p") { 
          playPause()
        }
      break
      case  "pause" :
        if (e.key === "b") {
          back()
        }
        if (e.key === "p") { 
          playPause()
        }
      break
      case  "flyto" :
      break
      case  "wait" :
        if (e.key === "p") { 
          playPause()
        }
      break
      case  "end" :
        if (e.key === "p") { 
          playPause()
        }
      break
      default :

  }



  }

  /**
   * 
   * @param time 
   */
  
  function frame(time) {

  // get the overall distance of each route so we can interpolate along them
  const routeDistance = turf.length(turf.lineString(trace));
  // const cameraRouteDistance = turf.length(turf.lineString(cameraRoute))
  let t=0

  if (!start) {
    disabledBtnHome.value=false
    start = time;
    resetIndexEvt()
    // console.log(`start : ${start}, time : ${time}, phase = ${phase}`)
  }
  // console.log(`start : ${start}, time : ${time}, phase = ${phase}`)

  // phase determines how far through the animation we are
  if (pause.value !== true)  {
    phase = (time - start) / dureeAnimation;
    avancement = parseInt((dureeAnimation*phase/coeffAnnimation) * 10)
    distance.value = (dureeAnimation*phase/coeffAnnimation).toFixed(1)


    // Traitement des évènements
    let retour = traiteEvt(map, evt, avancement)

    if (retour.pause === true) playPause()  // On a une pause de programmée.
    
    if (retour.flyTo !== 0) {   
      etat.value="flyto"
      // console.log(`etat: ${etat.value}`)            // On a un flyTo de programmé. La pause a été faite
      disabledPlayPause.value = true
      flyToState = true                     // On interdit la prise en compte d'une pause
      flyToEvt(map, retour.flyTo)
      map.once('moveend', function() {      // On attend la fin du flyTo pour lancer l'attente sur le retour
        // console.log(`On attend le click souris`)

       
        map.once('moveend', function() {      // Le click souris a été fait 
          // console.log(`On met un message`)
          etat.value="wait"
          // console.log(`etat: ${etat.value}`)            // On a un flyTo de programmé. La pause a été faite
          disabledReprise.value = false
          disabledPlayPause.value = false
        

          map.once('moveend', function() {
            // console.log("Fin du flyTo de retour")
            etat.value="run"
            // console.log(`etat: ${etat.value}`)            // On a un flyTo de programmé. La pause a été faite
            flyToState = false
            disabledReprise.value = true
            playPause()
            disabledPlayPause.value = false
          })
        })
      })
    }


  }
  else {     // console.log(`Nous sommes en pause`)
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
  if (phase > 1) {
    if (showEndTrace === "true") {
      // On ajoute une étiquette sur le point d'arrivée
      let divEnd = document.createElement('div');
      divEnd.id = 'endEtiquette'
      divEnd.style.backgroundImage = `${urlSvg}${pinArrivee}`
      divEnd.style.width = `120px`
      divEnd.style.height = `120px`
      // markers[elements[listEvts[indexEvt]][nbr].id].style.zIndex = 101
      divEnd.style.backgroundSize = '100%';

      const offset = -60
      let markerStart= new mapboxgl.Marker({ element: divEnd, offset: [ 60, -20 ] })
        .setLngLat(visu[visu.length - 1].lookAt)
        .addTo(map);

      etat.value = "flyto"
      // console.log(`etat: ${etat.value}`)            // On a un flyTo de programmé. La pause a été faite
      disabledPlayPause.value = true
      map.fitBounds(bounds, {
        padding: 75, // équivalent au padding dans transitionToOverviewState
        duration: 5000, // durée en millisecondes
        essential: true
      });
      map.once('moveend', function() {       
          // Il faut modifier les boutons pour n'avoir que le retour au Km 0
          disabledReprise.value = false
          disabledPlayPause.value = false
      })
    } else {
      etat.value = "end"
      console.log(`etat: ${etat.value}`)            // On a un flyTo de programmé. La pause a été faite
    }
    return;
  }

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

  if (phase > 1) {  // On relance la visualisation. Il faut effacer les vignettes précédentes
    delVignettes(evt)
    start = 0
    etat.value="run"


    window.requestAnimationFrame(frame)
  } else {
    if (flyToState) reprise()  
    else {
      if (pause.value) {
        etat.value="run"
        // console.log(`etat : ${etat.value}`)
        // On relance l'annimation
        start = start + performance.now() - timePause
        window.requestAnimationFrame(frame)
        timePause = 0
        startPause = true
      } else {
        etat.value="pause"
        // console.log(`etat : ${etat.value}`)

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
  
}

function reprise () {
  // console.log(`reprise`)
  etat.value="flyto"
  // console.log(`etat: ${etat.value}`)            // On a un flyTo de programmé. La pause a été faite
  endFlyToEvt(map, avancement)        
  disabledPlayPause.value = true
}

function back() {
  if (!pause.value) playPause()
  start = start + 375
  setTimeout(() => {
        playPause()            
        }
    , 25)
  playPause()
}

function home() {
  router.push({ path: `/` })
}

</script>

<style scooped>
  /*#mapContainer {
    transform: scale(1.3); 
  }*/
</style>