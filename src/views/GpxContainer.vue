<template>
    <!-- <h2>Page de test</h2>
    <router-link :to="{name: 'map', params: {id: 1 }}">Carte Calp</router-link>
    <v-btn width="100" @click="myMap()">TEST</v-btn> -->
    <MenuToolbar
      @AddGpxFile="getGpxFiles"
    ></MenuToolbar>

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
    :model-value 
    :items 
    @close-add-gpx-dialog="close"
    @import-gpx-file="getGpxFile"
  > 
  </AddGpxDialog>

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ParcoursCard from '@/components/ParcoursCard.vue';
import MenuToolbar from '@/components/MenuToolbar.vue';
import AddGpxDialog from '@/components/AddGpxDialog.vue';

// Ajout d'une trace GPX
const modelValue = ref(false)
const items = ref()


function close() {
  // console.log("reception du signal close" )
  modelValue.value=false
}


/** */ 

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
  const url = `http://localhost:4000/api/getGpxFiles/`
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
    modelValue.value=true
    //console.log(`reponse : ${rep}`)
  })

  .catch(err => {
    //traitement des erreurs
    items.value=`Text : ${err}`
  })
}

/****************************
 * Lecture d'un fichier gpx *
 ****************************/
function getGpxFile(selection) {
  close()
  console.log(`on va traiter ${selection}`)
  const url = `http://localhost:4000/api/getGpxFile/${selection}`
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
    //console.log(`reponse : ${rep}`)
  })

  .catch(err => {
    //traitement des erreurs
    items.value=`Text : ${err}`
  })

}

</script>