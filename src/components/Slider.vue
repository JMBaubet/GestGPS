<template>
  <v-range-slider ma-0
    v-model="range"
    :min
    :max
    :step
    density="compact"
  >
    <template v-slot:prepend ma-0>
      <div style="width: 5em; text-align: right;">
        {{ label }} :  {{range[0]}}
      </div>
    </template>
    <template v-slot:append>
      <div style="width: 5em; text-align: left;">
        {{range[1]}} {{unite}}
      </div>
    </template>
  </v-range-slider>
</template>

<script setup>
  import { ref} from 'vue';

  const props = defineProps({
    min : Number,
    max : Number,
    step : String,
    label: String,
    unite: String
  }) 

  const range = ref([props.min, props.max])
  const label = ref(props.label)
  const unite = ref(props.unite)  
</script>

<style scoped>
  .v-range-slider.v-input--horizontal {
    margin-inline: -10px -10px;
  }
</style>
