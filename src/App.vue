<template>
  <v-app>
    <router-link to="/">Home</router-link>
    <RouterView/>
  </v-app>
</template>


<script setup lang="ts">
// import { useRouter } from 'vue-router';
// const router = useRouter()

//import { ref } from 'vue';
// import MapContainer from './views/MapContainer.vue'
import { RouterView } from 'vue-router';


//const port = import.meta.env.VITE_PORT

// MapBox
  // const pointOfView = {lng: -0.03851, lat: 38.60945, bearing: 0,
  //                           pitch: 70, zoom: 14.83 }


                           
/* 
const text = ref('')
const subtitle = ref('')

function testBack() {
  const url = `http://localhost:${port}`
  fetch(url, {method:'GET', signal: AbortSignal.timeout(1000)})
  .then((rep, err) => {
    console.log(`Réponse : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
    if (rep.ok)
      return rep.text()
    else {
      // si rep KO on passe le N° d'err et le text
      throw `${rep.status}, ${rep.statusText}` 
    }
  })
  .then((rep, err) => {
    subtitle.value = `Réponse : ${rep}`
  })
  .catch(err => {
    //traitement des erreurs
    text.value=`Text : ${err}`
  })
}
  */
</script>
