<template>
  <v-toolbar>
    <template v-slot:prepend>
      <v-btn icon="mdi-console" @click="debug()"></v-btn>
    </template>
    GPX
    <div>
      <v-btn :disabled="noGpxFileReady" icon @click="ImportGpx">
        <v-icon color="primary">mdi-file-marker-outline</v-icon>
      </v-btn>
      <v-tooltip activator="parent" location="bottom">
        Importer une trace gpx
      </v-tooltip>
    </div>

    <div>
      <v-btn icon disabled>
        <v-icon color="primary">mdi-file-search-outline</v-icon>
      </v-btn>
      <v-tooltip activator="parent" location="bottom">
        Filtrer les traces
      </v-tooltip>
    </div>
<!-- 
    <div>
      <v-btn icon @click="emit('affMap')">
        <v-icon color="success">mdi-file-video</v-icon>
      </v-btn>
      <v-tooltip activator="parent" location="bottom">
        Visualiser les traces
      </v-tooltip>
    </div> -->

    <!-- <div>
      <v-btn icon disabled>
        <v-icon color="error">mdi-file-remove-outline</v-icon>
      </v-btn>
      <v-tooltip activator="parent" location="bottom">
        Supprimer des traces
      </v-tooltip>
    </div>
 -->
    <!-- Menu fichiers FIT-->
    <template v-if="$vuetify.display.smAndUp">
      <v-divider class="mx-1 align-self-center" length="24" thickness="2" vertical></v-divider>

      &nbsp;&nbsp;&nbsp;FIT

      <div>
        <!-- <v-btn icon :disabled="noFitFileReady"> -->
        <v-btn icon disabled>
          <v-icon>mdi-file-document-plus-outline</v-icon>
        </v-btn>
        <v-tooltip activator="parent" location="bottom">
          Importer un fichier FIT
        </v-tooltip>
      </div>

      <div>
        <v-btn icon disabled>
          <v-icon>mdi-file-minus-outline</v-icon>
        </v-btn>
        <v-tooltip activator="parent" location="bottom">
          Filtrer les fichiers FIT
        </v-tooltip>
      </div>

      <div>
        <v-btn icon disabled>
          <v-icon>mdi-file-minus-outline</v-icon>
        </v-btn>
        <v-tooltip activator="parent" location="bottom">
          Visualiser le fichiers FIT
        </v-tooltip>
      </div>

      <div>
        <v-btn icon disabled>
          <v-icon>mdi-file-minus-outline</v-icon>
        </v-btn>
        <v-tooltip activator="parent" location="bottom">
          Supprimer des fichiers FIT
        </v-tooltip>
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
import { ref } from 'vue'

const props = defineProps({
  noGpxFileReady: Boolean,
  noFitFileReady: Boolean,
})

const emit = defineEmits(['addGpxFile'])

//const router = useRouter()

function ImportGpx() {
  emit('addGpxFile')
}

// A supprimer
function debug() {
  console.log(`noGpxFileReady : ${props.noGpxFileReady}`)
}
</script>