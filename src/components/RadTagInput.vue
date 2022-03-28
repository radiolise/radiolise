<template>
  <div class="tag-input">
    <span style="display: table-cell">{{ $t("tagInput.label") }}: </span
    ><RadInput
      :value="renderedTags"
      style="display: table-cell; width: 100%"
      :placeholder="$t('general.tags')"
      type="text"
      @input="renderedTags = $event"
      @change="syncedTags = $event"
    />
    <div class="text-left" style="display: table">
      <div style="display: table-cell">{{ $t("tagInput.preview") }}:{{ "\xa0" }}</div>
      <div style="display: table-cell">
        <RadTags :labels="renderedTags.split(',')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from "vue-property-decorator";

import RadInput from "@/components/RadInput.vue";
import RadTags from "@/components/RadTags.vue";

@Component({
  components: {
    RadInput,
    RadTags,
  },
})
export default class RadTagInput extends Vue {
  renderedTags = "";

  @PropSync("tags", { type: String, required: true }) syncedTags!: string;

  created(): void {
    this.renderedTags = this.syncedTags;
  }
}
</script>
