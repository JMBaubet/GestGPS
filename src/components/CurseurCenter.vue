<template>
    <v-btn 
      v-if="mask === true" 
      class="d-none"
    > </v-btn>
    <v-btn v-else id="center"
    variant="text"
      size="x-large" 
      color="deep-orange-accent-4"
      icon="mdi-crosshairs" 
    > </v-btn>
</template>

<script setup>

const props = defineProps({
  mask: Boolean
})

</script>

<style scooped>
  #center {
    z-index: 1;
    padding: 0;
    position: absolute;
    top: 50%;
    left: 50% ;
    transform: translate(-50%, -50%);
  }

</style>