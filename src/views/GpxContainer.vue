<template>
  <!-- <h2>Page de test</h2>
    <router-link :to="{name: 'map', params: {id: 1 }}">Carte Calp</router-link>
    <v-btn width="100" @click="myMap()">TEST</v-btn> -->

  <MsgAlert :alarmes @close-alarme="delAlarme"></MsgAlert>

  <!-- <MenuToolbar :no-gpx-file-ready :no-fit-file-ready @addGpxFile="getGpxFiles" @affMap="myMap"> -->
  <MenuToolbar 
    :no-gpx-file-ready 
    :no-fit-file-ready 
    :showFiltre
    @addGpxFiles="getGpxFiles"
    @activerFiltre="activerFiltre"
  >
  </MenuToolbar>
  <Fitre 
    :showFiltre
    :items-villes 
    :items-traceurs 
    :dist-min 
    :dist-max 
    :deniv-min 
    :deniv-max 
    :reset
    @filtrerDistance="filtrerDistance"
    @filtrerDenivele="filtrerDenivele"
    @filtrerVille="filtrerVille"
    @filtrerTraceur="filtrerTraceur"
    @filtreCircuits="filtreCircuits"
    @resetFiltre ="resetFiltre"
  >
  </Fitre>
  <v-container class="hidden-md-and-up">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="(circuit, key) in circuitsAffiches">
        <ParcoursCard 
          :circuit="circuit" 
          @informations="getInfoCircuit(circuit.circuitId)"
          @confirm-del-gpx-file="askDelGpxFile(circuit.circuitId, circuit.nom)"
          @modCameraFile="modCameraFile(circuit.circuitId)"
          @affiche3D="map3D(circuit.circuitId)">
        </ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-container class="hidden-sm-and-down hidden-lg-and-up">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="(circuit, key) in circuitsAffiches" cols="12" sm="6">
        <ParcoursCard 
          :circuit="circuit"
          @informations="getInfoCircuit(circuit.circuitId)"
          @confirm-del-gpx-file="askDelGpxFile(circuit.circuitId, circuit.nom)"
          @modCameraFile="modCameraFile(circuit.circuitId)"
          @affiche3D="map3D(circuit.circuitId)">
        </ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-container class="hidden-md-and-down hidden-xl-and-up">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="(circuit, key) in circuitsAffiches" cols="12" sm="5">
        <ParcoursCard 
          :circuit="circuit" 
          @informations="getInfoCircuit(circuit.circuitId)"
          @confirm-del-gpx-file="askDelGpxFile(circuit.circuitId, circuit.nom)"
          @modCameraFile="modCameraFile(circuit.circuitId)"
          @affiche3D="map3D(circuit.circuitId)">
        </ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-container class="hidden-lg-and-down">
    <v-row justify="space-between">
      <v-col class="d-flex justify-center" v-for="(circuit, key) in circuitsAffiches" cols="12" sm="3">
        <ParcoursCard :circuit="circuit" :name="circuit.nom" :distance="circuit.distance" :denivele="circuit.denivele"
          :top="circuit.sommet.altitude" :top-distance="circuit.sommet.km"
          @informations="getInfoCircuit(circuit.circuitId)"
          @confirmDelGpxFile="askDelGpxFile(circuit.circuitId, circuit.nom)"
          @modCameraFile="modCameraFile(circuit.circuitId)"
          @affiche3D="map3D(circuit.circuitId)">
        </ParcoursCard>
      </v-col>
    </v-row>
  </v-container>
  <v-pagination :length=nbPages v-model="page" @click="getCircuits()">
  </v-pagination>

  <AddGpxDialog :vue-dialog-gpx :items :items-traceurs @close-add-gpx-dialog="closeGpxDialog"
    @import-gpx-file="addGpxFile">
  </AddGpxDialog>

  <DelGpxDialog :rm-gpx-dialog :nom-gpx :id-gpx @close-del-gpx-dialog="closeDelGpxDialog" @del-gpx-File="rmGpxFile">
  </DelGpxDialog>

  <information-dialog
    :show-information
    :circuit="circuit" 
    :villeDepart
    :traceur
    :items-traceurs
    @close-info-dialog="showInformation=false"
    @save-traceur="saveTraceur"
  >
  </information-dialog>


</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import MenuToolbar from '@/components/MenuToolbar.vue';
import Fitre from '@/components/Fitre.vue';
import ParcoursCard from '@/components/ParcoursCard.vue';
import AddGpxDialog from '@/components/AddGpxDialog.vue';
import DelGpxDialog from '@/components/DelGpxDialog.vue';
import MsgAlert from '@/components/MsgAlert.vue';
import InformationDialog from '@/components/InformationDialog.vue';
import { traiteCatch, traiteErreur } from '@/scripts/promisesError.js'

const TIMER = import.meta.env.VITE_TIMER

const circuitsAffiches = ref({})
const noGpxFileReady = ref(true)
const noFitFileReady = ref(true)
const alarmes = ref([])
const nbPages = ref(1)
const page = ref(1)
const vueDialogGpx = ref(false)
const items = ref()
const itemsTraceurs = ref([])
const itemsVilles = ref([])
const distMin = ref()
const distMax = ref()
const denivMin = ref()
const denivMax = ref(0)
const reset = ref(true)
const showInformation = ref(false)
const circuit = ref({})
const villeDepart = ref()
const traceur = ref()

const name = ref("Test")

const disabledBtnFiltre = ref(false)

const showFiltre = ref(false)
const rmGpxDialog = ref(false)
const nomGpx = ref()
const idGpx = ref()

let totalCircuits = 0
let nbCircuitsAffiches = 0
let intervalIsRunning

const router = useRouter()

/**
 * @Desc Au montage de la vue il faut initialiser les données
 *       surveiller le backend et la taille de la fenêtre du navigateur.
 * 
 * @param  
 * @returns 
 */
onMounted(() => {
  window.addEventListener("resize", nbCircuits)
  intervalIsRunning = setInterval(backEndIsRunning, TIMER)
  nbCircuits()
  backEndIsRunning()
  getTraceurs()
  getVilles()
  getMinMax()
})

/**
 * @Desc Au démontage il faut de surveiller le backend et la taille de la fenêtre du navigateur.
 * 
 * @param  
 * @returns 
 */
onUnmounted(() => {
  window.removeEventListener("resize", nbCircuits)
  clearInterval(intervalIsRunning)
})


function map3D(id) {
  router.push({ path: `/map/${id}` })
}

function modCameraFile(id) {
  router.push({ path: `/camera/${id}` })
}


/**
 * @Desc Cette fonction permet de calculer le nombre de circuit à afficher 
 * en fonction de la résolution de la fenêtre du navigateur.
 * 
 * @param  
 * @returns 
 */
function nbCircuits() {
  const largeurFenetre = window.innerWidth
  let nb
  if (largeurFenetre > 1919)
    nb = 8 // 4 colonnes et 2 rangées
  else if (largeurFenetre > 959)
    nb = 4 // 2 colonnes et 2 rangées
  else
    nb = 2 // 1 colonne et 2 rangées

  if (nb !== nbCircuitsAffiches) {
    nbCircuitsAffiches = nb
    getCircuits()
  }
}


/**
 * @Desc Cette fonction est appelée afin de surveiller la présence du backend. 
 * 
 * @param  
 * @returns 
 */
function backEndIsRunning() {
  const url = "http://localhost:4000/api/isRunning"
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
    .then((rep, err) => {  // Le backend a repondu ...
      if (alarmes.value.findIndex(alarme => alarme.id == 3) !== -1) { // On vérifie que l'alarme est présente
        alarmes.value.splice([alarmes.value.findIndex(alarme => alarme.id == 3)], 1)
        // Autres traitements sur reprise de liaison avec le backend. 
        nbCircuits()
        getCircuits()
        getMinMax()
        getTraceurs()
        getVilles()
      }
      return rep.json()
    })
    .then((json, err) => {  // La réponse json est bien formatée ...
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        //console.log("On traite la réponse")
        // Enable/disable bouton importation fichier gpx 
        if (json.gpx === "0") noGpxFileReady.value = true
        else noGpxFileReady.value = false
        // Enable/disable bouton importation fichier gpx 
        if (json.fit === "0") noFitFileReady.value = true
        else noFitFileReady.value = false

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch(err => {
      traiteCatch(err, alarmes)
    })
}

function activerFiltre (etat) {
  showFiltre.value = etat
  if (!showFiltre.value) resetFiltre()

}


function filtreCircuits() {
  console.log(`filtreCircuits`)
  disabledBtnFiltre.value=true
  getCircuits()
}

function resetFiltre() {
  console.log(`resetfiltre`)
  reset.value = !reset.value
}

/**
 * @Desc Cette fonction demande au backend une liste de circuits qui dépend des paramètres envoyés. 
 * 
 * @param  
 * @returns 
 */
function getCircuits() {
  // console.log(`GpxContainerView : getCirtuits`)
  const url = `http://localhost:4000/api/circuits/${page.value}/${nbCircuitsAffiches}/${filtreVille}/${filtreTraceur}/${filtreDistances}/${filtreDeniveles}`
  console.log(url)
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(1500) })
    .then((rep, err) => {
      return rep.json()
    })
    .then((json, err) => {
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        circuitsAffiches.value = json.circuits
        totalCircuits = json.totalCircuits
        // console.log(`GpxContainerView : getCirtuits : totalCircuits : ${totalCircuits}, nbCirtAff : ${nbCircuitsAffiches}`)
        // On met à jour le nombre de pages
        if ((totalCircuits % nbCircuitsAffiches) !== 0) {
          nbPages.value = ~~(totalCircuits / nbCircuitsAffiches) + 1
        } else {
          nbPages.value = totalCircuits / nbCircuitsAffiches
        }
        // console.log(`${circuitsAffiches.value.length}`)

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch(err => {
      traiteCatch(err, alarmes)
    })
}


/**
 * @Desc Cette fonction demande et reçoit du backend la liste des traceurs présents dans le fichier dataModel.json. 
 * 
 * @param  
 * @returns 
 */
function getTraceurs() {
  const url = `http://localhost:4000/api/traceurs/`
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
    .then((rep, err) => {  // Le backend a repondu ...
      return rep.json()
    })
    .then((json, err) => {  // Lé réponse json est bien formaté ...
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        //console.log("On traite la réponse")
        itemsTraceurs.value = []
        for (let id = 0; id < json.length; id++) {
          itemsTraceurs.value.push(json[id].nom)
        }

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch(err => {
      traiteCatch(err, alarmes)
    })
}


/**
* @Desc Cette fonction demande et reçoit du backend la liste des villes de départ présentes 
*       dans le fichier dataModel.json. 
* 
* @param  
* @returns 
*/
function getVilles() {
  const url = `http://localhost:4000/api/villes/`
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
    .then((rep, err) => {  // Le backend a repondu ...
      return rep.json()
    })
    .then((json, err) => {  // Lé réponse json est bien formaté ...
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        //console.log("On traite la réponse")
        itemsVilles.value = []
        for (let id = 0; id < json.length; id++) {
          itemsVilles.value.push(json[id].nom)
        }

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch(err => {
      traiteCatch(err, alarmes)
    })
}


/**
* @Desc Cette fonction demande et reçoit du backend, la liste des fichiers *.gpx présents  
*       dans le dossier Téléchargement. 
* 
* @param  
* @returns 
*/
function getGpxFiles() {
  const url = `http://localhost:4000/api/GpxFiles/`
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
    .then((rep, err) => {  // Le backend a repondu ...
      return rep.json()
    })
    .then((json, err) => {  // Lé réponse json est bien formatée ...
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        //console.log("On traite la réponse")
        items.value = json
        vueDialogGpx.value = true
        //console.log(`Fichiers : ${json}`)

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch(err => {
      traiteCatch(err, alarmes)
    })
}


/**
* @Desc Cette fonction demande au backend d’importer un nouveau circuit. 
* 
* @param  {string} selection le nom du fichier 
* @param  {string} traceur le nom du traceurr 
* @returns 
*/
function addGpxFile(selection, traceur) {
  // console.log(`on va traiter ${selection}, ${traceur}`)
  if (traceur === undefined) traceur ="Non précisé"
  const url = `http://localhost:4000/api/GpxFile/${selection}/${traceur}`
  fetch(url, { method: 'POST', signal: AbortSignal.timeout(2000) })
    .then((rep, err) => {
      return rep.json()
    })
    .then((json, err) => {
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        // console.log(`reponse : ${json.gpx}`)
        // Mettre une alarme si rep.gpx vaut Present  ou Semblable
        switch (json.gpx) {
          case "Present":
            alarmes.value.push({
              id: 10,
              type: 'error',
              text: "Ce circuit est déjà présent.",
              closable: true,
              icon: "mdi-map-marker-alert-outline"
            })
            break;
          case "Semblable":
            alarmes.value.push({
              id: 11,
              type: 'warning',
              text: "Un circuit semblable est déjà présent.",
              closable: true,
              icon: "mdi-map-marker-distance"
            })
            break;
          case "OK":
            alarmes.value.push({
              id: 12,
              type: 'success',
              text: "Le circuit a bien été importé.",
              closable: true,
              icon: "mdi-map-marker-distance"
            })
            break;
        }
        getCircuits()
        getTraceurs()
        getVilles()

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })

    .catch(err => {
      traiteCatch(err, alarmes)
    })
}

function askDelGpxFile(id, nom) {
  rmGpxDialog.value = true
  nomGpx.value = nom
  idGpx.value = id

}

function getInfoCircuit(id) {

  const url = `http://localhost:4000/api/circuit/` + id
  console.log(url)
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(500) })
    .then((rep) => {
      return rep.json()
    })
    .then((json, err) => {
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        circuit.value = json.circuit
        // console.log(circuit.value)
        showInformation.value = true
        // On récupère le nom de la ville de départ
        const urlVille = `http://localhost:4000/api/ville/` + json.circuit.villeDepart
        console.log(urlVille)
        fetch(urlVille, { method: 'GET', signal: AbortSignal.timeout(500) })
         .then((rep) => {
            return rep.json()
          })
        .then((json, err) => {
          villeDepart.value = json.ville
        })

        // On récupère le nom du traceur
        const urlTraceur = `http://localhost:4000/api/traceur/` + json.circuit.traceur
        console.log(urlTraceur)
        fetch(urlTraceur, { method: 'GET', signal: AbortSignal.timeout(500) })
         .then((rep) => {
            return rep.json()
          })
        .then((json, err) => {
          // console.log(json.traceur)
          traceur.value = json.traceur
        })
        

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch((err) => {
      traiteCatch(err, alarmes)
    })
}

function saveTraceur(newTraceur, id) {
  console.log(`saveTraceur : ${newTraceur}, ${id}`)
  const url = `http://localhost:4000/api/traceur/${id}/${newTraceur}`
  console.log(url)
  fetch(url, { method: 'POST', signal: AbortSignal.timeout(500) })
    .then((rep) => {
      return rep.json()
    })
    .then((json, err) => {
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        alarmes.value.push({
          id: 12,
          type: 'success',
          text: "Le traceur a bien été mis à jour.",
          closable: true,
          icon: "mdi-map-marker-distance"
        })
        traceur.value=newTraceur
      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }

    })
    .catch((err) => {
      traiteCatch(err, alarmes)
    })
}




function closeDelGpxDialog() {
  rmGpxDialog.value = false
}

function rmGpxFile() {
  rmGpxDialog.value = false
  // console.log(`On va supprimer le circuit ${idGpx.value}`)
  const url = `http://localhost:4000/api/GpxFile/` + parseInt(idGpx.value)
  fetch(url, { method: 'DELETE', signal: AbortSignal.timeout(2000) })
    .then((rep) => {
      return rep.json()
    })
    .then((json, err) => {
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        // console.log(`reponse : ${json.del}`)
        // Mettre une alarme si rep.gpx vaut Present  ou Semblable
        alarmes.value.push({
          id: 12,
          type: 'success',
          text: "Le circuit a bien été  supprimé.",
          closable: true,
          icon: "mdi-map-marker-distance"
        })
        getCircuits()
        getTraceurs()
        getVilles()
      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }

    })
    .catch((err) => {
      traiteCatch(err, alarmes)
    })
}


/**
* @Desc Cette fonction permet de fermer le composant AddGpxDialog.vue. 
* 
* @param  
* @returns 
*/
function closeGpxDialog() {
  // console.log("reception du signal closeGpxDialog" )
  vueDialogGpx.value = false
}


/**
* @Desc Cette fonction permet de supprimer un message d’alarme présenté à l’utilisateur. 
* 
* @param  {number} id l'id de l'alarme
* @returns 
*/
function delAlarme(id) {
  alarmes.value.splice([alarmes.value.findIndex(alarme => alarme.id == id)], 1)
  // console.log(` ${alarmes.value.length}`)
}


let filtreVille = " "
let filtreTraceur = " "
let filtreDistances = [0, 200]
let filtreDeniveles = [0,4600]

/*************************************
*  Filtre de la ville               *
*************************************/
function filtrerVille(villeSelect) {
  filtreVille = villeSelect
  disabledBtnFiltre.value = false
}

/*************************************
*  Filtre du traceur                 *
*************************************/
function filtrerTraceur(traceurSelect) {
  filtreTraceur = traceurSelect
  disabledBtnFiltre.value = false
}

function filtrerDistance(range) {
  // console.log(range)
  filtreDistances=range
  disabledBtnFiltre.value = false
}

function filtrerDenivele(range) {
  filtreDeniveles=range
  disabledBtnFiltre.value = false
}


/************************************
* Lecture des min Max              *
************************************/
function getMinMax() {
  const url = `http://localhost:4000/api/circuitsMinMax/`
  fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
    .then((rep, err) => {
      return rep.json()
    })
    .then((json, err) => {
      if (typeof (json.error) === "undefined") { // On recoit la réponse attendu
        // #TODO voir pourquoi on ne peut pas rendre dynamic les range-slider avec ces paramètres !
        distMin.value = json.distMin
        distMax.value = json.distMax
        denivMin.value = json.denivMin
        denivMax.value = json.denivMax
        //console.log(`GpxContainer.vue : getMinMax : ${denivMin.value}, ${denivMax.value}, ${distMin.value}, ${distMax.value}`)

      } else { // On reçoit une réponse de type error
        traiteErreur(json, alarmes)
      }
    })
    .catch(err => {
      traiteCatch(err, alarmes)
    })
}



</script>