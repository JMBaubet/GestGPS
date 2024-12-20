<template>
  <div  style="z-index:1100; opacity:0.75; margin-left: 24px ;">
    <v-container class="position-absolute pa-2" max-width="500">
      <v-timeline 
        density="compact"
        line-thickness="0"
        truncate-line="both"
        side="end">
        <v-timeline-item
          v-for="alarme in alarmes"
            :key="alarme.id"
            :dot-color="alarme.type"
            size="0"
        >
          <v-alert
            :type="alarme.type"
            :text="alarme.text"
            :closable="alarme.closable"
            :icon="alarme.icon"
            @click:close="emit('closeAlarme', alarme.id)"
            width="450"
            density="compact"
            border="start"
            rounded="0"
          >
          </v-alert>
        </v-timeline-item>
      </v-timeline>
    </v-container>
  </div>
</template>


<script setup>
  import{ref} from 'vue'

  const props = defineProps({
    alarmes: Array,
    }) 

  const emit = defineEmits(['closeAlarme'])

</script>


<style scoped>
  .v-timeline--vertical.v-timeline {
    row-gap: 4px;
  }
  .v-timeline-item__body {
    padding-inline-start: 0px;
  }
</style>