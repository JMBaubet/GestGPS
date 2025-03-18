<template>
  <div id="evtImages" v-if="mask === false">
    <v-card
      class="mx-auto"
      max-width="300"
      min-width="300"
      color="#40404080"
    >
      <v-card-title>Sélection des vignettes</v-card-title>
      <v-radio-group @click="select">

        <v-virtual-scroll :items="pngs" height="610" item-height="60" color="#40404080">
        <template v-slot:default="{ item }">

          <v-list-item :subtitle="`${item}` " >
            <template v-slot:prepend class="mx-2">
              <v-img 
            class = "border-md border-opacity-100 border-surface-bright mx-auto mr-4"
            width="80"
            :src="`${httpsPng}${item}.png`"
          ></v-img>
            </template>

            <template v-slot:append>
              <v-radio  :value="`${item}`" >
            </v-radio> 

            </template>
          </v-list-item>
        </template>
      </v-virtual-scroll>
      </v-radio-group>
    </v-card>
  </div>

  <v-sheet 
    v-if="mask === false"
    id="vignetteSize"   
    max-width="300"
    min-width="300"
    >
    <v-row class="ma-0 pa-0">
      <v-col sm= "7" class="pa-0 ma-0">
        <v-select   
          :items="sizes"
          @update:modelValue="changeSize"
          v-model="defaultValue"
          hide-details="true"    
          density="comfortable"
          label="Taille de la vignette"
        ></v-select>
      </v-col>
      <v-col sm = "5" class="pa-0 mt-2" >
        <v-btn
        @click="emit('voir')"
        class="text-none ml-4"
        size="small" 
        color="primary"
        >Visualiser</v-btn>
      </v-col>
    </v-row>
  </v-sheet>

</template>

<script setup>
import { ref } from 'vue';

const httpsPng= import.meta.env.VITE_HTTPS_PNG
const vignetteSizes = import.meta.env.VITE_VIGNETTE_SIZES
const vignetteDefaultSize = import.meta.env.VITE_VIGNETTE_DEFAULT_SIZE

const props = defineProps({
  mask: Boolean,
  pngs: Array,
})

const emit = defineEmits(['newVignette', 'newSize', 'voir'])


// const pngs = ref(['Arrivee', 'depart2', 'Ravitaillement', 'eau', 'Stop' ])
const sizes = ref([])
const defaultValue = ref(`${vignetteDefaultSize} px`)
const tabSize = vignetteSizes.split(',')
for (let i=0; i< tabSize.length; i++) {
  sizes.value[i]= `${tabSize[i]} px`
}


function select(id) {
  console.log(`select ${id.target.value}`)
  if (id.target.value !== undefined) {
    emit('newVignette', id.target.value)
  }
}

function changeSize(value) {
  console.log(`changeSize : ${value}`)
  const size=value.split(' ')
  emit('newSize', size[0])
}
</script>

<style lang="css" scoped>
  #evtImages {
    background-color: #90A4AEC0;
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  82px;
    right: 10px;
  }

  #vignetteSize {
    background-color: #90A4AEC0;
    padding: 2px;
    z-index: 1;
    position: absolute;
    bottom:  30px;
    right: 10px;
  }

</style>