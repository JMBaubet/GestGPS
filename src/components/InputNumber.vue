<template>
  <div class="d-flex align-center flex-column pt-4">
    <v-row>
      <v-btn-group
        id="btnGroup"
        variant="outlined"
        density="compact"
        divided
        rounded="0"
      >
        <v-btn @click="changeNumber(-props.incrementMax)" icon="mdi-chevron-double-left"></v-btn>
        <v-btn @click="changeNumber(-props.incrementMin)" icon="mdi-chevron-left"></v-btn>
        <v-btn @click="changeNumber(props.incrementMin)" icon="mdi-chevron-right"></v-btn>
        <v-btn @click="changeNumber(props.incrementMax)" icon="mdi-chevron-double-right"></v-btn>
      </v-btn-group>
    </v-row>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const emit = defineEmits(['newNumber'])

const props = defineProps({
  nombre: Number,
  max: Number,
  min: Number,
  incrementMin: Number,
  incrementMax: Number
})

watch(() => props.nombre, (newvalue, oldValue) => {
  valeur.value = props.nombre
  if (valeur.value > props.max) valeur.value = props.max
})


// console.log(`Nombre : ${props.nombre}`)

const valeur = ref()
valeur.value = props.nombre
// valeur.value = parseFloat(props.nombre).toFixed(1)
// console.log(`Valeur : ${valeur.value}`)

function changeNumber(increment) {
  console.log(`InputNumber changeNumber : ${increment}`)
  valeur.value = parseFloat(parseFloat(valeur.value + increment).toFixed(1))
  if (increment > 0 ) {
    console.log(`max : ${props.max}`)
    if (valeur.value > props.max) valeur.value = props.max
  }else {
    if (valeur.value < props.min) valeur.value = props.min
  }
  emit('newNumber', valeur.value)
}

</script>

<style scoped>
  #text {
    padding-top: 10px;
  }
  #btnGroup {
    min-height: 40px;
  }

</style>
