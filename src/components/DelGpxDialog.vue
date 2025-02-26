<template>
  <!--voir : https://play.vuetifyjs.com/#eNp1UctuwjAQ/JVVLoBEAKm3CJBQ1XMryo1wcB1TLBzb8iMNQvn32nmalF6s9ezO7uzO8R5phZc7KReFJVESrQ3JJUOGbFMOsC5ijFQGmCGtN2mUlzGyRqQR5KiMf2hmLg59Wa3SqK6vGYxq84SREa6puTkMi1wibHpOz4q1/boQlBG13b99vO8Pn+vln0zKxyzqNHcYQBGfhXJTph6eA50B5eBjnUZDVXIlXgp9wArELPGobxgksGB1S6lojtRtSPULODHd4ZwAzYRJpCKS8CwoqRVTLDgk/m0HLXzsbuFX9WHYcxm4EcDB3rGhhvmZhpSm6+jjtuOocLh4mOu8a7HGevfx3rvPSMZaY0VlU0VKKZRx3p6RZQbuTaMMGZTAdAabLUxbDBoPEjgOi9zBK01gsieIxQeak4kzzN3AQXlGY8wEvk6gmj+h7GxGCccjBsJYWG7+4bwKXhClqeD6kXZm6DvknNqomtVB5W/Qbx1Vc24Zq5/TL1jeAbU=-->
  <div>
    <v-dialog :model-value="rmGpxDialog">
      <v-card class="mx-auto" width="400">
        <v-card-title>Suppession d'une trace.</v-card-title>
        <v-card-subtitle>Êtes-vous sûr de vouloir supprimer la trace :<br>
          <h3>{{ nomGpx }}.</h3><br>
        </v-card-subtitle>
        <v-card-actions>
          <v-btn color="warning" text="Non" variant="elevated" prepend-icon="mdi-cancel"
            @click="emit('closeDelGpxDialog')"></v-btn>

          <v-btn class="ma-2" color="success" text="Oui" variant="elevated" prepend-icon="mdi-file-remove-outline"
            @click="delCircuit"></v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { ref } from 'vue'

const props = defineProps({
  rmGpxDialog: Boolean,
  nomGpx: String,
  idGpx: String
})

const emit = defineEmits(['closeDelGpxDialog', 'delGpxFile'])

function delCircuit() {
  emit('delGpxFile')
}

</script>