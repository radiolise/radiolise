<template>
  <div class="tags">
    <slot />
    <template v-if="renderedTags.length > 0">
      <template v-for="(item, i) in renderedTags">
        &nbsp;<span :key="i" class="label">{{ item }}</span>
      </template>
    </template>
    <span v-else style="opacity: 0.5">{{ this.$t("general.noTags") }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadTags extends Vue {
  @Prop({ type: Array, required: true }) readonly labels!: string[];

  get renderedTags(): string[] {
    return this.labels.filter(tag => tag !== "");
  }
}
</script>
