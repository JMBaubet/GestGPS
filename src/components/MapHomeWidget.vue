<template>
  <div id="home">
    <v-btn 
      @click="emit('home')"
      :disabled=disabled
      size="large" 
      icon="mdi-home" 
    >  
    </v-btn>
  </div>
</template>

<script setup>
  const props = defineProps({
    disabled: Boolean
  })

  const emit = defineEmits(['home'])

</script>

<style >
  #homeBtn {
    background-color: rgb(35 55 75 / 50%);
  }
  #home {
    padding: 6px;
    z-index: 1;
    position: absolute;
    top:  0;
    left: 0;
  }

</style>