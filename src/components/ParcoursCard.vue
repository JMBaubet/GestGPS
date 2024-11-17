<template>
    <v-card         
        width="580">
        <v-img
            class="align-end text-white"
            src="../assets/img/gpx/parcours_1.png"
            cover>
        </v-img>
    <v-card-item class="pa-0">

        <v-card-text >
            <div class=" text-subtitle-1">Calp Denia</div>
            
                <div class=" text-subtitle-1">
                    <v-row class="ma-0">
                        <v-col class="pa-0" cols="12" sm="6">Distance : 123 km</v-col>
                        <v-col class="pa-0 text-right" cols="12" sm="6">Dénivelé +  : 1890 m</v-col>
                    </v-row>
                </div>
            
            <v-row  align="center" class="my-1 ma-0">
                <div class="text-subtitle-1">Dificulté : </div>
                <v-rating
                :model-value="3.0"
                color="primary"
                density="compact"
                size="small"
                half-increments
                readonly
                >
                </v-rating>
            </v-row>
        </v-card-text>
    </v-card-item>

    </v-card>
</template>

<script setup>


</script>