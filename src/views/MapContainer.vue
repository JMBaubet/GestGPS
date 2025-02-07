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
  const distance = ref("0.0)")
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
    // console.log(`Nombre de segment camera : ${camera.length}`)     
    console.log(camera[0].start)

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
    console.log("On lance l'annimation du départ")
    map.on('load', async () => {
      map.flyTo({  center: camera[0].point,
        bearing: camera[0].cap, 
        zoom: 16, pitch:60, duration: 7500
      })
    });

    console.log("On lance la suite")
    map.on('moveend', async () => {
      position = map.getSource('point')
      window.requestAnimationFrame(frame);
    });

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
    //console.log(e)
    if (e.key === "p") { playPause() }
    if (e.key === "r") {
      start = 0
      //  window.requestAnimationFrame(frame)
    }
    if (e.key === "m") { 
      start = start + 2750
      for(let i=0; i<camera.length;i++)
        camera[i].start=false 
    }
  }

  /**
   * 
   * @param time 
   */
  let start
  let fin
  let debut
  let phase = 0
  let pause = false
  let position 
  let animation
  let startPause
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
  if (pause !== true) {
    phase = (time - start) / dureeAnimation;
    distance.value = (dureeAnimation*phase/coeffAnnimation).toFixed(1)
    // console.log(`Phase : ${phase}, distance : ${((dureeAnimation*phase/coeffAnnimation)/10).toFixed(2)}`)
    // console.log(`Avancement : ${phase * flyto.length / 10}`)
    // console.log(`start : ${start}, time : ${time}, phase = ${phase}`)
  }
  else return
  // phase is normalized between 0 and 1
  // when the animation is finished, reset start to loop the animation
  if (phase > 1) return;


  // Animation de la trace.
  // On peut changer la couleur en fonction du temps donc de la distance.
  // On peut donc mettre une couleur en fonction de la pente
  // Déplacement de la camera
  let avancement  = parseInt(phase * camera.length ) 
  // console.log(`Avancement : ${avancement}`)
  if (!camera[avancement].start) {
    // console.log(`Avancement : ${avancement}`)
    fin = new Date()
    // console.log(fin.getTime() - debut.getTime())
    // if(fin.getTime() - debut.getTime() > 333) tempo = true
    debut = new Date()
    altitude.value = camera[avancement].altitude
    // console.log(`on vas vers ${flyto[avancement].point}`)
    // console.log(`Avancement : ${avancement}, On va vers ${flyto[avancement].point}, cap : ${flyto[avancement].cap}`)
    camera[avancement].start=true
    map.flyTo({ 
      center: camera[avancement].point,  
      bearing: camera[avancement].cap, 
      // zoom: 16.5,
      essential: true, 
      duration: 1000
    })
  }


  // if (phase < 0.5)
  //   map.setPaintProperty(
  //     "line",
  //     "line-gradient",
  //     [
  //       "step",
  //       ["line-progress"],
  //       "rgba(23, 23, 0, 1)",
  //       phase,
  //       "rgba(0, 0, 0, 0)",
  //     ]
  //   )
  // else
    map.setPaintProperty(
      "animationTrace",
      "line-gradient",
      [
        "step",
        ["line-progress"],
        "white",
        phase,
        "rgba(0, 0, 0, 0)",
      ]
    )


  // use the phase to get a point that is the appropriate distance along the route
  // this approach syncs the camera and route positions ensuring they move
  // at roughly equal rates even if they don't contain the same number of points

  const alongRoute = turf.along(
    turf.lineString(trace),
    routeDistance * phase
  ).geometry.coordinates;



  // const alongCamera = turf.along(
  //   turf.lineString(cameraRoute),
  //   cameraRouteDistance * phase
  // ).geometry.coordinates;

  // const camera = map.getFreeCameraOptions();
  // // set the position and altitude of the camera
  // let elevation = Math.floor(map.queryTerrainElevation(
  //   {
  //     lng: alongCamera[0],
  //     lat: alongCamera[1]
  //   },
  //   { exaggerated: false }
  // ))

  // // console.log(elevation)

  // camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
  //   {
  //     lng: alongCamera[0],
  //     lat: alongCamera[1]
  //   },
  //   // cameraAltitude
  //   cameraAltitude + elevation
  // );

  // // tell the camera to look at a point along the route
  // camera.lookAtPoint({
  //   lng: alongRoute[0],
  //   lat: alongRoute[1]
  // });

  position.setData({type: 'Point', coordinates : [alongRoute[0], alongRoute[1]]})
  
  // map.setFreeCameraOptions(camera);
  animation = window.requestAnimationFrame(frame);
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
      start = start + performance.now() - startPause
      window.requestAnimationFrame(frame)
      startPause = 0
    } else {
      // console.log(` : Time: ${animation}`)
      if (!startPause) {
        startPause = performance.now();
        console.table(map.getZoom())
        // console.log(`startPause : ${startPause}`)
      }
    }
    pause = !pause
  }
}



function home() {
  router.push({ path: `/` })
}

</script>

