<template>
  <rad-drawer>
    <h3>
      <font-awesome-icon icon="list-alt" fixed-width />
      {{ $t("general.stationLists") }}
    </h3>
    <p class="description">{{ $t("listManager.description") }}</p>
    <div>
      <div
        style="display: table; margin: 0 auto; padding-bottom: 10px; font-size: 20px"
      >
        <rad-list-input
          v-for="(list, index) in lists"
          :key="index"
          :index="index"
          :name="list.name"
          :content="list.content"
          :removable="makeRemovable"
        />
        <rad-list-input :adding="adding" @blur="adding = false" />
      </div>
      <div style="text-align: right">
        <router-link class="button" to="/import-wizard/list"
          ><font-awesome-icon icon="file-import" />
          {{ $t("general.importBackup") }}</router-link
        >
        <a class="button" @click="adding = true"
          ><font-awesome-icon icon="plus" /> {{ $t("listManager.newList") }}</a
        >
      </div>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

import RadDrawer from "@/components/RadDrawer.vue";
import RadListInput from "@/components/RadListInput.vue";

@Component({
  components: {
    RadDrawer,
    RadListInput,
  },
})
export default class RadListManager extends Vue {
  adding = false;

  @Getter readonly lists!: StationList[];

  get makeRemovable(): boolean {
    return this.lists.length >= 2;
  }
}
</script>
