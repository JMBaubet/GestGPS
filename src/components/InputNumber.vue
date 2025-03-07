<template>
  <div class="d-flex align-center flex-column pt-4">
    <v-row>
      <v-text-field 
        :label="label"
        :model-value="valeur"
        min-width="80"
        density="compact"
        variant="outlined"
        rounded="0"
        hide-details="true"
      ></v-text-field>
      <v-btn-group
        id="btnGroup"
        variant="outlined"
        density="compact"
        divided
        rounded="0"
      >
        <v-btn @click="mmoins()" icon="mdi-chevron-double-left"></v-btn>
        <v-btn @click="moins()" icon="mdi-chevron-left"></v-btn>
        <v-btn @click="plus()" icon="mdi-chevron-right"></v-btn>
        <v-btn @click="pplus()" icon="mdi-chevron-double-right"></v-btn>
      </v-btn-group>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const emit = defineEmits(['numberPlus', 'numberMoins'])

const props = defineProps({
  label: String,
  nombre: Number,
  max: Number,
  min: Number,
  incrementMin: Number,
  incrementMax: Number
})

const disabledZoomIn = ref(false)
const valeur = ref(0)
valeur.value = parseFloat(props.nombre).toFixed(1)

function pplus() {
  if (valeur.value < props.max) {
    console.log(`incrementPPlus`)
    const tmp = parseFloat(valeur.value + props.incrementMax)
    // console.log(`${tmp}, ${tmp.toFixed(1)}`)
    valeur.value = parseFloat(tmp.toFixed(1))
    valeur.value = parseFloat(valeur.value + props.incrementMax).toFixed(1)
  }
}


function plus() {
  console.log(`plus`)
  if (valeur.value < props.max) {
    console.log(`increment`)
    const tmp = parseFloat(valeur.value + props.incrementMin)
    // console.log(`${tmp}, ${tmp.toFixed(1)}`)
    valeur.value = parseFloat(tmp.toFixed(1))
    valeur.value = parseFloat(valeur.value + props.incrementMin).toFixed(1)
  }
}

function moins() {
  console.log(`moins`)
  if (valeur.value > props.min) {
    console.log(`décrement`)
    valeur.value = parseFloat(valeur.value - props.incrementMin).toFixed(1)
  }
}
function mmoins() {
  console.log(`moins`)
  if (valeur.value > props.min) {
    console.log(`décrement`)
    valeur.value = parseFloat(valeur.value - props.incrementMax).toFixed(1)
  }
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
