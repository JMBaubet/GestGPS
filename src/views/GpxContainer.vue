<template>
    <!-- <h2>Page de test</h2>
    <router-link :to="{name: 'map', params: {id: 1 }}">Carte Calp</router-link>
    <v-btn width="100" @click="myMap()">TEST</v-btn> -->

    <MsgAlert 
      :alarmes
      @close-alarme="delAlarme"
    ></MsgAlert>

    <MenuToolbar
    :no-gpx-file-ready
    :no-fit-file-ready
    @AddGpxFile="getGpxFiles"
      @affMap="myMap"
    >
    </MenuToolbar>

    <v-container  class="hidden-md-and-up">
    <v-row justify="space-between">
        <v-col  class="d-flex justify-center">
      <ParcoursCard></ParcoursCard></v-col>
    </v-row>
  </v-container>
    <v-container class="hidden-sm-and-down hidden-lg-and-up">
    <v-row 
      justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 2" :key="n" cols="12" sm="6">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
    <v-container class="hidden-md-and-down hidden-xl-and-up">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 3" :key="n" cols="12" sm="4">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-container  class="hidden-lg-and-down">
    <v-row  justify="space-between">
      <v-col class="d-flex justify-center" v-for="n in 4" :key="n" cols="12" sm="3">
        <ParcoursCard></ParcoursCard>
      </v-col>
    </v-row>
  </v-container>

  <AddGpxDialog 
    :vue-dialog-gpx
    :items
    :items-traceurs 
    @close-add-gpx-dialog="close"
    @import-gpx-file="addGpxFile"
  > 
  </AddGpxDialog>


</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted} from 'vue';
  import { useRouter } from 'vue-router';
  import ParcoursCard from '@/components/ParcoursCard.vue';
  import MenuToolbar from '@/components/MenuToolbar.vue';
  import AddGpxDialog from '@/components/AddGpxDialog.vue';
  import MsgAlert from '@/components/MsgAlert.vue';



  const noGpxFileReady = ref(true)
  const noFitFileReady = ref(true)
  const alarmes = ref([])

  function delAlarme(id) {
    alarmes.value.splice([alarmes.value.findIndex(alarme => alarme.id == id)], 1)
    // console.log(` ${alarmes.value.length}`)
  }

  let intervalIsRunning
  onMounted(() => {
    backEndIsRuning()
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
        // console.log(`${response.status}`)
        throw new Error(`${response.status}`);      
      }

      if (alarmes.value.findIndex(alarme => alarme.id == 3) !== -1) {
        alarmes.value.splice([alarmes.value.findIndex(alarme => alarme.id == 3)], 1)    
      }
      const reception = await response.json();
      //console.log(`${reception.gpx}, ${reception.fit}`)
      // Enable/disable bouton importation fichier gpx 
      if (reception.gpx === "0") noGpxFileReady.value = true
      else noGpxFileReady.value = false
      // Enable/disable bouton importation fichier gpx 
      if (reception.fit === "0") noFitFileReady.value = true
      else noFitFileReady.value = false
    } 
    catch (error) {
      console.log(`Erreur du Backend : ${error.message}`);
      switch(error.message) {
        case '500':
          if (alarmes.value.findIndex(alarme => alarme.id == 500) === -1) {
            alarmes.value.push({
              id: 500, 
              type: 'error', 
              text:"Erreur 500 : Ressource indisponible ", 
              closable: true,
              icon: "mdi-alert-box-outline"
            })
          }
        break;
        case '404':
          if (alarmes.value.findIndex(alarme => alarme.id == 404) === -1) {
            alarmes.value.push({
              id: 404, 
              type: 'error', 
              text:"Erreur 404 : Page inconnue.", 
              closable: true,
              icon: "mdi-file-alert-outline"
            })
          }
        break;
        case 'NetworkError when attempting to fetch resource.':
          if (alarmes.value.findIndex(alarme => alarme.id == 3) === -1) {
            alarmes.value.push({
              id: 3, 
              type: 'error', 
              text:"Le backend est absent",
              icon: " mdi-lan-disconnect"
            })
          }
        break;
      }    
    }
  }





  // Ajout d'une trace GPX
  const vueDialogGpx = ref(false)
  const items = ref()
  const itemsTraceurs = ref()


  function close() {
    // console.log("reception du signal close" )
    vueDialogGpx.value=false
  }



  const router = useRouter()

  function myMap() {
      const id = 2
      router.push({path: `/map/${id}`})
  }

  
  /***********************************
  *  Communications avec le Backend  *
  ***********************************/

  /************************************
  * Lecture du dossier Téléchargement *
  ************************************/
  function getGpxFiles() {
    getTraceurs()

    const url = `http://localhost:4000/api/GpxFiles/`
    fetch(url, {method:'GET', signal: AbortSignal.timeout(1000)})
    .then((rep, err) => {
      //console.log(`Réponse : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
      if (rep.ok)
        return rep.json()
      else {
        // si rep KO on passe le N° d'err et le text
        throw `${rep.status}, ${rep.statusText}` 
      }
    })
    .then((rep, err) => {
      items.value = rep
      vueDialogGpx.value=true
      console.log(`Fichiers : ${rep}`)
    })

    .catch(err => {
      //traitement des erreurs
      itemsFichiers.value=`Text : ${err}`
    })
  }

  /************************************
  * Lecture des traceurs              *
  ************************************/
  function getTraceurs() {
    const url = `http://localhost:4000/api/traceurs/`
    fetch(url, {method:'GET', signal: AbortSignal.timeout(1000)})
    .then((rep, err) => {
      //console.log(`Réponse : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
      if (rep.ok)
        return rep.json()
      else {
        // si rep KO on passe le N° d'err et le text
        throw `${rep.status}, ${rep.statusText}` 
      }
    })
    .then((rep, err) => {
      itemsTraceurs.value = rep
      // vueDialogGpx.value=true
      console.log(`Traceurs : ${rep}`)
    })

    .catch(err => {
      //traitement des erreurs
      items.value=`Text : ${err}`
    })
  }


  /****************************
   * Ajout d'un fichier gpx *
   ****************************/
  function addGpxFile(selection, traceur) {
    close()
    
    console.log(`on va traiter ${selection}, ${traceur}`)
    const url = `http://localhost:4000/api/GpxFile/${selection}/${traceur}`
    fetch(url, {method:'POST', signal: AbortSignal.timeout(1000)})
    .then((rep, err) => {
      //console.log(`Réponse : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
      if (rep.ok) {
        // objet = rep.json()
        // console.log(`GpxContainer.vue : reponse : ${objet.gpx}`)
        return rep.json()
      }
      else {
        // si rep KO on passe le N° d'err et le text
        throw `${rep.status}, ${rep.statusText}` 
      }
    })
    .then((rep, err) => {
      console.log(`reponse : ${rep.gpx}`)
      // Mettre une alarme si rep.gpx vaut Present  ou Semblable
      switch(rep.gpx) {
        case "Present" :
        alarmes.value.push({
              id: 404, 
              type: 'error', 
              text:"Ce circuit est déjà présent.", 
              closable: true,
              icon: "mdi-map-marker-alert-outline"
            })
        break;
        case "Semblable" : 
        alarmes.value.push({
              id: 404, 
              type: 'warning', 
              text:"Un circuit semblable est déjà présent.", 
              closable: true,
              icon: "mdi-map-marker-distance"
            })
        break;
      }
    })

    .catch(err => {
      //traitement des erreurs
      items.value=`Text : ${err}`
    })

  }

</script>