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
</v-container>
</template>
  

<script setup>
  import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';
  import mapboxgl from 'mapbox-gl';
  import {ref, onMounted, onUnmounted} from 'vue' 

  const props = defineProps({
    id: Number,
  })

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

  let refPovCenter = [2, 48]
  let refPovZoom = 8
  let refPovBearing = 0
  let refPovPitch = 70
  

  // if ((import.meta.env.VITE_POV_LONGITUDE !== undefined) && (import.meta.env.VITE_POV_LATITUDE !== undefined)) {
  //   refPovCenter= [import.meta.env.VITE_POV_LONGITUDE, import.meta.env.VITE_POV_LATITUDE]
  // } 
  // if (import.meta.env.VITE_POV_ZOOM !== undefined) refPovZoom = import.meta.env.VITE_POV_ZOOM
  // if (import.meta.env.VITE_POV_BEARING !== undefined) refPovBearing = import.meta.env.VITE_POV_BEARING
  // if (import.meta.env.VITE_POV_PITCH !== undefined) refPovPitch = import.meta.env.VITE_POV_PITCH

  
  let map = null

  onMounted(() => {
    console.log(`On charge mmap props.id : ${props.id}`)
    // On initialise la carte au montage du composant
    try {
      map = new mapboxgl.Map({
        container: "mapContainer",
        style: 'mapbox://styles/mapbox/streets-v12',
        center: refPovCenter,
        zoom: refPovZoom,
        bearing :refPovBearing,
        pitch: refPovPitch
      })
    } catch (error) {console.log(error)}
  })

  onUnmounted(() => {
    console.log("On detruit la carte")
  })
</script>