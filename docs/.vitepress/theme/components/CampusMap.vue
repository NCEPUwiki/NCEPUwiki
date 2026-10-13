<script setup lang="ts">
import { campusMapDataset } from '../campus-map-data.ts'
import MapView from './MapView.vue'
</script>

<template>
<MapView :dataset="campusMapDataset" />
</template>
