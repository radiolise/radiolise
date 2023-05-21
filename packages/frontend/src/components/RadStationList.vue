<template>
  <div :class="{ 'compact-mode': settings.compactMode, 'pointer-events-none': dragging }">
    <RadStation
      v-for="(station, index) in currentList"
      :key="station.id"
      :index="index"
      :station="station"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class RadStationList extends Vue {
  @Getter readonly currentList!: Station[];
  @Getter readonly dragging!: boolean;
  @Getter readonly settings!: Settings;
}
</script>
