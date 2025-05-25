<template>
  <v-dialog :model-value="showInformation" :persistent=true>
    <v-card class="mx-auto" width="600">
      <v-card-title class="text-center"> {{ circuit.nom }}</v-card-title>
      <v-divider class="mb-2"></v-divider>
      <v-row >
        <v-col sm="12" class=" pa-2 ml-4  text-left">
          <h4 style="color: #9FA8DA">Informations sur le circuit ...</h4> 
        </v-col>
      </v-row>
      <!-- <v-divider class="mt-2"></v-divider> -->
      <v-row>
        <v-col sm="2" class=" py-1 text-right">
          <span style="color: #9FA8DA">Distance :</span>
        </v-col>
        <v-col sm="2" class=" py-1">
          {{ circuit.distance }} km.
        </v-col>
        <v-col sm="2" class="py-1 text-right">
          <span style="color: #9FA8DA">Départ :</span>
        </v-col>
        <v-col sm="6" class="py-1 ">
          {{ villeDepart }}
        </v-col>
      </v-row>

      <v-row>
        <v-col sm="2" class="text-right py-1">
          <span style="color: #9FA8DA">D+ :</span>
        </v-col>
        <v-col sm="2" class="py-1" >
          {{ circuit.denivele }} m.
        </v-col>
        <v-col sm="2" class="text-right py-1">
          <span style="color: #9FA8DA">Sommet :</span>
        </v-col>
        <v-col sm="6" class="py-1">
          {{ circuit.sommet.altitude }} m à {{ circuit.sommet.km }} km

        </v-col>
      </v-row>


      <v-row>
        <v-col sm="2" class="text-right pt-3">
          <span style="color: #9FA8DA">Traceur :</span>
        </v-col>
        <v-col sm="6" class="text-right pt-1">

          <v-combobox 
            :items=itemsTraceurs 
            v-model="traceur" 
            density="compact"
            label="éditeur de la trace ."
            hide-details="true"
          ></v-combobox>
        </v-col>        
        <v-col sm="2" ></v-col>

        <v-col sm="2" class="text-center pt-1">
          <v-btn  
          :disabled
          @click="saveTraceur()"
          size="small" 
          color="red-darken-4"
          icon="mdi-content-save-outline"
          v-tooltip="'Sauvegarder le nom du traceur', location='bottom'" 
        > 
        </v-btn>
        </v-col>
      </v-row>


      <v-divider class="my-2"></v-divider>
      <v-row >
        <v-col sm="12" class=" pa-2 ml-4  text-left">
          <h4 style="color: #FFF59D">Informations sur l'édition 3D ... </h4>
        </v-col>
      </v-row>

      <v-row>
        <v-col sm="2" class="text-right py-1">
          <span style="color: #FFF59D">Edition :</span>
        </v-col>
        <v-col sm="2" class="text-right py-1">
          <v-progress-linear
            :max="circuit.distance"
            :buffer-value="circuit.distance"
            :location="null"
            :model-value="circuit.lgEdition/10"                
            bg-color="#FFFFFF"
            buffer-color="red-darken-3"
            buffer-opacity="1"
            color="green-darken-3"
            height="20"
            min="0"
            rounded
          >
            <template v-slot:default="{ value }">
              {{ Math.ceil(value) }}%
            </template>
          </v-progress-linear>
        </v-col>
        <v-col sm="2" class="text-right  py-1">
          <span style="color: #FFF59D">Vignettes :</span>
        </v-col>

        <v-col sm="6" class="text-left pr-8 py-1">
          <span style="color: #FFF59D">Dép. : </span>

          <v-icon v-if="circuit.evt.affDepart" color="green-darken-3" icon="mdi-checkbox-marked-outline" />&nbsp;&nbsp;&nbsp;
          <v-icon v-else color="red-darken-3" icon="mdi-checkbox-blank-outline" />&nbsp;&nbsp;&nbsp;
          <span style="color: #FFF59D">Arr. : </span>

          <v-icon v-if="circuit.evt.affArrivee" color="green-darken-3" icon="mdi-checkbox-marked-outline" />&nbsp;&nbsp;&nbsp;
          <v-icon v-else color="red-darken-3" icon="mdi-checkbox-blank-outline" />&nbsp;&nbsp;&nbsp;
          <span style="color: #FFF59D">10km : </span>

          <v-icon v-if="circuit.evt.aff10km" color="green-darken-3" icon="mdi-checkbox-marked-outline" />&nbsp;&nbsp;&nbsp;
          <v-icon v-else color="red-darken-3" icon="mdi-checkbox-blank-outline" />&nbsp;&nbsp;&nbsp;
         
        </v-col>

      </v-row>

      <v-row>
        <v-col sm="3" class="text-right pr-2  pt-1">
          <span style="color: #FFF59D">Nbr de zoom : </span>

        </v-col>
        <v-col sm="1" class=" pl-0  pt-1">
          {{circuit.evt.nbZoom}}
        </v-col>
        <v-col sm="2" class="text-right pr-2 pt-1" >
          <span style="color: #FFF59D">Nbr d'info : </span>
        </v-col>
        <v-col sm="1" class="pl-0 pt-1">
          {{circuit.evt.nbInfo}}
        </v-col>
        <v-col sm="3" class="text-right pr-2 pt-1">
          <span style="color: #FFF59D">Nbr de pause : </span>
        </v-col>
        <v-col sm="1" class="pl-0 pt-1">
          {{circuit.evt.nbPause}}
        </v-col>
      </v-row>

      <v-divider class="my-2"></v-divider>
      <v-row >
        <v-col sm="12" class=" pa-2 ml-4  text-left">
          <h4 style="color: #80CBC4">Informations sur l'origine ... </h4>
        </v-col>
      </v-row>

      <v-row>
        <v-col sm="2" class="text-right pr-2  pt-1">
          <span style="color: #80CBC4">Url : </span>

        </v-col>
        <v-col sm="10" class=" pl-0  pt-1">
          {{circuit.url}}
        </v-col>
      </v-row>

      <v-row>
        <v-col sm="6" class="pt-0 text-center">
          <v-avatar
            rounded="0"
            size="150"
          >
            <v-img :src="qrcode" ></v-img>
          </v-avatar>
        </v-col>
        <v-col sm="6" class="pt-0 text-center">
          <v-row class="text-center">
            <v-col sm="12" class="pt-0 text-center">
              <div style="color: #80CBC4; text-align: middle; ">Application source : </div>
              <div v-if=" circuit.editeurId === 0" style="color: #80CBC4; text-align: middle; ">Indéterminée </div>
              <div v-else-if=" circuit.editeurId === 1" style="color: #fc4c02; text-align: middle; ">Strava </div>
              <div v-else-if=" circuit.editeurId === 2" style="color: #11aeed; text-align: middle; ">Garmin Connect </div>
              <div v-else-if=" circuit.editeurId === 3" style="color: #f96702; text-align: middle; ">Ride With GPS </div>
              <div v-else-if=" circuit.editeurId === 4" style="color: #cc0001; text-align: middle; ">OpenRunner </div>
            </v-col>
          </v-row>
          <v-col sm="12" class="pt-1 text-center">
            <v-avatar
              rounded="0"
              size="110"
            >
            <v-img v-if=" circuit.editeurId === 0"   src="../assets/img/logo/inconnu.png" ></v-img>
            <v-img v-else-if=" circuit.editeurId === 1"   src="../assets/img/logo/strava.png" ></v-img>
            <v-img v-else-if=" circuit.editeurId === 2"   src="../assets/img/logo/garmin.png" ></v-img>
            <v-img v-else-if=" circuit.editeurId === 3"   src="../assets/img/logo/rwg.png" ></v-img>
            <v-img v-else-if=" circuit.editeurId === 4"   src="../assets/img/logo/openRunner.png" ></v-img>
          </v-avatar>
    
          </v-col>
        </v-col>

      </v-row>
 
      <v-card-actions >
        <v-btn class="ma-2 mt-0"  @click="emit('closeInfoDialog')" color="primary" text="OK" variant="elevated"
          >
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>

</template>

<script setup>
import { ref, watch} from 'vue';

const dataDirectory = import.meta.env.VITE_DATA_DIRECTORY


const props = defineProps({
  showInformation: Boolean,
  disbaledSave: Boolean,
  circuit: Object,
  villeDepart: String,
  traceur: String,
  itemsTraceurs: Array,
})

const emit = defineEmits(['closeInfoDialog', 'saveTraceur'])


// const distance = ref(props.circuit.distance)
// const lgEdition = ref(props.circuit.lgEdition)
const traceur = ref(props.traceur)
const disabled = ref(props.disbaledSave)
const qrcode = ref()

watch(() => props.circuit, () => {
  // console.log(props.circuit.editeurId)
  qrcode.value=`${dataDirectory}/${props.circuit.circuitId}/qrCode.png`
})


watch(() => props.traceur, (newValue, oldValue) => {
  // console.log(props.traceur)
  traceur.value = props.traceur
  if(traceur.value === props.traceur) {
    disabled.value = true
  } else {
    disabled.value = false
  }
})

watch(() => traceur.value, (newValue, oldValue) => {
  if(traceur.value === props.traceur) {
    disabled.value = true
  } else {
    disabled.value = false
  }
})

function saveTraceur() {
  // console.log(`emit saveTraceur(${traceur.value})`)
  emit('saveTraceur', traceur.value, props.circuit.circuitId)
}

</script>

<style lang="css" scoped>

</style>