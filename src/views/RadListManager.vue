<template>
  <RadDrawer>
    <h3>
      <FasListAlt class="w-fixed" />
      {{ $t("general.stationLists") }}
    </h3>
    <p class="description mb-3.75 py-2.5">{{ $t("listManager.description") }}</p>
    <div>
      <div class="mx-auto inline-block pb-2.5 text-xl">
        <RadListInput
          v-for="(list, index) in lists"
          :key="index"
          :index="index"
          :name="list.name"
          :content="list.content"
          :removable="makeRemovable"
        />
        <RadListInput :adding="adding" @blur="adding = false" />
      </div>
      <div class="py-2.5 text-right">
        <RadLink v-slot="{ navigate }" to="import-wizard" :props="{ type: 'list' }">
          <RadButton @click="navigate">
            <FasFileImport />
            {{ $t("general.importBackup") }}
          </RadButton>
        </RadLink>
        <RadButton @click="adding = true">
          <FasPlus />
          {{ $t("listManager.newList") }}
        </RadButton>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

import RadButton from "@/components/RadButton.vue";
import RadDrawer from "@/components/RadDrawer.vue";
import RadLink from "@/components/RadLink.vue";
import RadListInput from "@/components/RadListInput.vue";

@Component({
  components: {
    RadButton,
    RadDrawer,
    RadLink,
    RadListInput,
    FasListAlt,
    FasFileImport,
    FasPlus,
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
