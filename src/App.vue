<template>
  <v-app>
    <!-- <router-link to="/">Home</router-link> -->
    <RouterView/>
  </v-app>
</template>


<script setup lang="ts">
import { RouterView } from 'vue-router';
import {ref, onMounted, onUnmounted} from 'vue'


const isStoped = ref(false)
let intervalIsRunning
onMounted(() => {
  intervalIsRunning = setInterval( backEndIsRuning, 5000)
})

onUnmounted(() => {
  clearInterval(intervalIsRunning)
})

async function backEndIsRuning() {
  const url = "http://localhost:4000/api/isRunning"
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      // Erreur 500 : Le serveur est présent mais problème avec lecture du dossier 
      // Erreur 404: Le backEndIsRunning n'est pas connu du serveur
      // TODO: Mettre un message d'erreur
    }

    const reception = await response.json();
    console.log(`${reception.gpx}, ${reception.fit}`)
    // TODO: Mettre à jour les icons du MenuToolBar
  } catch (error) {
    console.error(`Pas de réponse du serveur ${error.message}`);
    // TODO: Mettre un message d'alarme
  }

}

// import { useRouter } from 'vue-router';
// const router = useRouter()

//import { ref } from 'vue';
// import MapContainer from './views/MapContainer.vue'


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
