<template>
  <div class="text-left">
    {{ $t("tagInput.label") }}:
    <RadInput
      :value="renderedTags"
      class="mb-2.5 w-full"
      :placeholder="$t('general.tags')"
      type="text"
      @input="renderedTags = $event"
      @change="syncedTags = $event"
    />
    <div class="flex">
      {{ $t("tagInput.preview") }}:&nbsp;
      <RadTags :labels="renderedTags.split(',')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from "vue-property-decorator";

@Component
export default class RadTagInput extends Vue {
  renderedTags = "";

  @PropSync("tags", { type: String, required: true }) syncedTags!: string;

  created(): void {
    this.renderedTags = this.syncedTags;
  }
}
</script>
