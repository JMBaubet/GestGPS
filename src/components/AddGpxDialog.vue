<template>
    <!--voir : https://play.vuetifyjs.com/#eNp1UctuwjAQ/JVVLoBEAKm3CJBQ1XMryo1wcB1TLBzb8iMNQvn32nmalF6s9ezO7uzO8R5phZc7KReFJVESrQ3JJUOGbFMOsC5ijFQGmCGtN2mUlzGyRqQR5KiMf2hmLg59Wa3SqK6vGYxq84SREa6puTkMi1wibHpOz4q1/boQlBG13b99vO8Pn+vln0zKxyzqNHcYQBGfhXJTph6eA50B5eBjnUZDVXIlXgp9wArELPGobxgksGB1S6lojtRtSPULODHd4ZwAzYRJpCKS8CwoqRVTLDgk/m0HLXzsbuFX9WHYcxm4EcDB3rGhhvmZhpSm6+jjtuOocLh4mOu8a7HGevfx3rvPSMZaY0VlU0VKKZRx3p6RZQbuTaMMGZTAdAabLUxbDBoPEjgOi9zBK01gsieIxQeak4kzzN3AQXlGY8wEvk6gmj+h7GxGCccjBsJYWG7+4bwKXhClqeD6kXZm6DvknNqomtVB5W/Qbx1Vc24Zq5/TL1jeAbU=-->
  <div><v-dialog
    :model-value="vueDialogGpx"
  > 
    <v-card class="mx-auto" width="550">
      <v-card-title v-if="items.length > 0">Liste des fichiers disponibles.</v-card-title>
      <v-card-title v-else>Il n'y a pas de fichier disponible pour l'import.</v-card-title>
      <v-card-subtitle v-if="items.length === 0">Veuillez au préalable, ajouter une trace gpx dans le dossier Téléchargement !</v-card-subtitle>
      <v-card-subtitle v-else-if="items.length === 1">Veuillez séléctionner l'unique fichier à importer.</v-card-subtitle>
      <v-card-subtitle v-else="items.length > 1 ">Séléctionnez un des fichiers à importer.</v-card-subtitle>
     
      <v-col cols="12">
        <v-list 
          v-if="items.length > 0"
            :items
            max-height="220"
            bg-color="indigo"
            density="compact" 
        >
          <v-list-item
            v-for="(item) in items"
              :key="item"
              :value="item"
              @click="choix(item)"
          >
            <v-list-item-subtitle v-text="item"></v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>
    
      <v-col cols="8">
        <h5>Personne ou association qui a fait la trace :</h5><br>
        <v-combobox
          :items=itemsTraceurs
          @update:model-value="selectTraceur(select)"
          v-model="select"
          density="compact" 
          color="indigo-lighten-1"
          label="Sélectionnez l'éditeur de la trace ou créez en un !"
        ></v-combobox>
      </v-col>
     

      <v-card-actions  v-if="items.length > 0">
        <v-btn
          color="warning"
          text="Cancel"
          variant="elevated"
          prepend-icon="mdi-cancel"
          @click="emit('closeAddGpxDialog')" 
        ></v-btn>

        <v-btn
          :disabled=isDisabled
          @click="importGpx()" 
          color="primary"
          text="Importer"
          variant="elevated"
          prepend-icon="mdi-file-import-outline"
        ></v-btn>
      </v-card-actions>

      <v-card-actions  v-else>
        <v-btn
          @click="emit('closeAddGpxDialog')" 
          color="primary"
          text="OK"
          variant="elevated"
          prepend-icon="mdi-alert-circle-check-outline"
        ></v-btn>
      </v-card-actions>
      
    </v-card>
  </v-dialog>
</div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const props = defineProps({
    vueDialogGpx : Boolean,
    items : Object,
    itemsTraceurs : Array,
  }) 

  const emit = defineEmits(['closeAddGpxDialog', 'importGpxFile'])

  const isDisabled = ref(true)
  const selection = ref()
  const traceur = ref()
  const select = ref()

  function choix(fichier) {
    //console.log(`AddGpxDialog.vue, choix : Le fichier ${fichier} a été sélectionné`)
    if (fichier !== selection.value) {
      isDisabled.value = false
      selection.value = fichier
    }
    else {
      isDisabled.value = true
      selection.value=""
    }
  }

  function selectTraceur(items) {
    traceur.value=items
    //console.log(`AddGpxDialog.vue, selectTraceur : Le traceur ${items} a été sélectionné.`)
  }


  function importGpx() {
    //console.log(`AddGpxDialog.vue, importGpx : On va importer ${selection.value}`)
    emit('closeAddGpxDialog')
    emit('importGpxFile', selection.value, traceur.value) 
  }

</script>