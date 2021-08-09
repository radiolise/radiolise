<template>
  <div style="display: flex; justify-content: center">
    <div id="empty-list" class="bg-dim">
      <rad-happy-bird />
      <h3 style="margin-bottom: 0">
        {{ $t("general.listEmpty[0]") }}
      </h3>
      <div class="stacked-buttons">
        <rad-router-toggle class="button" to="/search">
          <font-awesome-icon icon="search" fixed-width />
          {{ $t("general.findStations") }}
        </rad-router-toggle>
        <rad-router-toggle class="button" to="/import-wizard/list">
          <font-awesome-icon icon="file-import" fixed-width />
          {{ $t("general.importBackup") }}
        </rad-router-toggle>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import RadHappyBird from "./RadHappyBird.vue";
import RadRouterToggle from "./RadRouterToggle.vue";

@Component({
  components: {
    RadHappyBird,
    RadRouterToggle,
  },
})
export default class RadEmptyList extends Vue {}
</script>

<style scoped>
#empty-list {
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  padding: 10px 20px;
  margin-bottom: 40px;
}
#empty-list .illustration {
  width: 200px;
  max-width: 100%;
  margin-top: 20px;
}
.stacked-buttons {
  margin: 10px 0;
}
.stacked-buttons > .button {
  margin: 0;
  font-size: 18px;
}
</style>
