<template>
  <div id="evtImages" v-if="mask === false" >
    <p>A faire</p>
  </div>

</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  mask: Boolean,
})

</script>

<style lang="css" scoped>
  #evtImages {
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    right: 10px;
  }

</style>