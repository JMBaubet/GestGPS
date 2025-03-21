<template>
  <v-toolbar>
    <template v-slot:prepend>
      <div class="mx-4"> Filtrer les circuits </div>
      <v-switch 
      v-model="showFiltre" 
      color="primary" 
      label=""
      hide-details="true"
      >
      </v-switch>

  
<!-- 
      <v-btn 
        :disabled="props.disabledBtnFiltre"
        @click= "emit('filtreCircuits')"
        icon 
      >
          <v-icon color="primary">mdi-file-search-outline</v-icon>
      </v-btn>
      <v-tooltip activator="parent" location="bottom">
        Filtrer les traces
      </v-tooltip> -->
          
    </template>

    <div>
      <v-btn
        :disabled="noGpxFileReady" 
        @click="ImportGpx"
        class="me-2 text-none"
        color="#5865f2"
        prepend-icon="mdi-file-marker-outline"
        variant="flat"
      >
      Importer une trace GPX
      </v-btn>

    </div>


    <!-- Menu fichiers FIT-->
    <template v-if="$vuetify.display.smAndUp">
      <v-divider class="mx-1 align-self-center" length="24" thickness="2" vertical></v-divider>

      <!-- &nbsp;&nbsp;&nbsp;FIT -->

      <div>
      <v-btn
        :disabled="noFitFileReady" 
        @click="ImportFit"
        class="me-2 text-none"
        color="#5865f2"
        prepend-icon="mdi-file-document-plus-outline"
        variant="flat"
      >
      Importer un fichier FIT
      </v-btn>
    </div>
      <!-- Menu Aide-->
    </template>

    <v-divider class="mx-1 align-self-center" length="24" thickness="2" vertical></v-divider>

    <v-btn icon>
      <v-icon>mdi-help-circle-outline</v-icon>
      <v-tooltip activator="parent" location="bottom">
        Aide
      </v-tooltip>
    </v-btn>


  </v-toolbar>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  noGpxFileReady: Boolean,
  noFitFileReady: Boolean,
  showFiltre: Boolean,
})

const emit = defineEmits(['addGpxFiles', 'activerFiltre'])

const showFiltre = ref(props.showFiltre)

watch(() => showFiltre.value, (newValue, oldValue) => {
  // console.log(showFiltre.value)
  emit('activerFiltre', showFiltre.value)
})


//const router = useRouter()

function ImportGpx() {
  emit('addGpxFiles')
}

function ImportFit() {
  // emit('addGpxFiles')
}

// A supprimer
function debug() {
  console.log(`noGpxFileReady : ${props.noGpxFileReady}`)
}
</script>