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
      class="clignotant" 
    > </v-btn>
</template>

<script setup>

const props = defineProps({
  mask: Boolean,
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
  .clignotant  {
   animation-duration: 2s;
   animation-name: clignoter;
   animation-iteration-count: infinite;
   transition: none;
}

@keyframes clignoter {
  0%   { background-color :#eeff0000 ; }
  40%   {background-color :#ff000040 ; }
  100% { background-color :#ff00ff00 ; }
}

</style>