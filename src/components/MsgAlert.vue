<template>
    <v-container class="position-absolute pa-0 ma-O" left="0px" max-width="360">
      <v-alert
        text="Absence du Backend !"
        title=""
        type="error"
        density="compact"
        rounded="0"
      ></v-alert>

      <v-progress-linear v-model="value" color="red-darken-4" max="250">
      </v-progress-linear>
    </v-container>
</template>

<script>
  export default {
    data() {
      return {
        value: 0,
        interval: 0,
      }
    },

    watch: {
      value(val) {
        if (val < 255) return

        this.value = 0
        this.startBuffer()
      },
    },

    mounted() {
      this.startBuffer()
    },

    beforeUnmount() {
      clearInterval(this.interval)
    },

    methods: {
      startBuffer() {
        clearInterval(this.interval)

        this.interval = setInterval(() => {
          this.value += 1
        }, 40)
      },
    },
  }
</script>