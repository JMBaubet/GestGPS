<template>
  <v-toolbar>
    <template v-slot:prepend>
      <!-- <v-btn icon="mdi-arrow-left"></v-btn> -->
    </template>
    GPX
    <v-btn icon @click="ImportGpx"> 
        <v-icon color="primary">mdi-file-marker-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Importer une trace gpx
        </v-tooltip>
    </v-btn>

    <v-btn icon disabled> 
        <v-icon color="primary">mdi-file-search-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Filter les traces
        </v-tooltip>
    </v-btn>

    <v-btn icon disabled> 
        <v-icon color="success">mdi-file-video</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Visualiser les traces
        </v-tooltip>
    </v-btn>


    <v-btn icon disabled> 
        <v-icon color="error">mdi-file-remove-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Supprimer des traces
        </v-tooltip>
    </v-btn>


    <template v-if="$vuetify.display.smAndUp">

      <v-divider
        class="mx-1 align-self-center"
        length="24"
        thickness="2"
        vertical
      ></v-divider>

      &nbsp;&nbsp;&nbsp;FIT
    <v-btn icon disabled> 
        <v-icon>mdi-file-document-plus-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Importer un fichier FIT
        </v-tooltip>
    </v-btn>

    <v-btn icon disabled> 
        <v-icon>mdi-file-minus-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Supprimer des traces
        </v-tooltip>
    </v-btn>
    <v-btn icon disabled> 
        <v-icon>mdi-file-minus-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Supprimer des traces
        </v-tooltip>
    </v-btn>
    <v-btn icon disabled> 
        <v-icon>mdi-file-minus-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Supprimer des traces
        </v-tooltip>
    </v-btn>

    </template>

    <v-divider
        class="mx-1 align-self-center"
        length="24"
        thickness="2"
        vertical
      ></v-divider>

      <v-btn icon> 
        <v-icon >mdi-help-circle-outline</v-icon>
        <v-tooltip
            activator="parent"
            location="bottom"
        >
            Aide
        </v-tooltip>
    </v-btn>


</v-toolbar>
</template>
  
<script setup>

function ImportGpx(){
    console.log(`importGpx`)
    // On affiche la page AddGpxCard
    this.$router.push({name: `/AddGpx`})
    // On emet un signal qui sera intercepté par AddGpxCard
    //const emit = defineEmits(['addGpxFile']) // Pour signaler la demande de reset
}

</script>  