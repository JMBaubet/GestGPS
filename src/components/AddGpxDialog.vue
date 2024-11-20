<template>
    <!--voir : https://play.vuetifyjs.com/#eNp1UctuwjAQ/JVVLoBEAKm3CJBQ1XMryo1wcB1TLBzb8iMNQvn32nmalF6s9ezO7uzO8R5phZc7KReFJVESrQ3JJUOGbFMOsC5ijFQGmCGtN2mUlzGyRqQR5KiMf2hmLg59Wa3SqK6vGYxq84SREa6puTkMi1wibHpOz4q1/boQlBG13b99vO8Pn+vln0zKxyzqNHcYQBGfhXJTph6eA50B5eBjnUZDVXIlXgp9wArELPGobxgksGB1S6lojtRtSPULODHd4ZwAzYRJpCKS8CwoqRVTLDgk/m0HLXzsbuFX9WHYcxm4EcDB3rGhhvmZhpSm6+jjtuOocLh4mOu8a7HGevfx3rvPSMZaY0VlU0VKKZRx3p6RZQbuTaMMGZTAdAabLUxbDBoPEjgOi9zBK01gsieIxQeak4kzzN3AQXlGY8wEvk6gmj+h7GxGCccjBsJYWG7+4bwKXhClqeD6kXZm6DvknNqomtVB5W/Qbx1Vc24Zq5/TL1jeAbU=-->
  <div><v-dialog
    :model-value
  > 
    <v-card class="mx-auto" width="550">
    
      <v-card-title v-if="items.length > 0">Liste des fichiers disponibles.</v-card-title>
      <v-card-title v-else>Il n'y a pas de fichier disponible pour l'import.</v-card-title>
      <v-card-subtitle v-if="items.length === 0">Veuillez au préalable, ajouter une trace gpx dans le dossier Téléchargement !</v-card-subtitle>
      <v-card-subtitle v-else-if="items.length === 1">Veuillez séléctionner l'unique fichier à importer.</v-card-subtitle>
      <v-card-subtitle v-else="items.length > 1 ">Séléctionnez un des fichiers à importer.</v-card-subtitle>

      <v-card-text></v-card-text>
      <v-list 
        v-if="items.length > 0"
        bg-color="#424242"
        density="compact" 
        :items>

        <v-list-item
          v-for="(item) in items"
          :key="item"
          :value="item"
          color="primary"
          @click="choix(item)"
        >
        <v-list-item-subtitle v-text="item"></v-list-item-subtitle>
        </v-list-item>
      </v-list>
    

      <v-card-actions  v-if="items.length > 0">
      <v-btn
        color="warning"
        text="Cancel"
        variant="elevated"
        prepend-icon="mdi-cancel"
        @click="emit('closeAddGpxDialog')" 
      ></v-btn>

      <v-btn
        color="primary"
        text="Importer"
        variant="elevated"
        prepend-icon="mdi-file-import-outline"
        :disabled=isDisabled
        @click="importGpx()" 
      ></v-btn>
      </v-card-actions>

      <v-card-actions  v-else>
      <v-btn
        color="primary"
        text="OK"
        variant="elevated"
        prepend-icon="mdi-alert-circle-check-outline"
        @click="emit('closeAddGpxDialog')" 
      ></v-btn>

      </v-card-actions>
      
    </v-card>
  </v-dialog>
</div>
</template>

<script setup>
import { ref } from 'vue';

  const props = defineProps({
    modelValue : Boolean,
    items : Array,
  }) 

  const isDisabled = ref(true)
  const emit = defineEmits(['closeAddGpxDialog', 'importGpxFile'])
  
  const  selection = ref()

  function choix(fichier) {
    if (fichier !== selection.value) {
      isDisabled.value = false
      selection.value = fichier
    }
    else {
      isDisabled.value = true
      selection.value=""
    }
  }

  function importGpx() {
    //console.log(`on va importer ${selection.value}`)
    emit('closeAddGpxDialog')
    emit('importGpxFile', selection.value) 
  }

</script>