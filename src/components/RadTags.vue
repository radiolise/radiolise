<template>
  <div class="scrollbar-avoid">
    <slot />
    <template v-if="renderedTags.length > 0">
      <template v-for="(item, i) in renderedTags">
        {{ " " }}
        <span
          :key="i"
          :class="[
            'mb-0.5 inline-block text-xs',
            compact
              ? 'mr-0.5 text-on-surface/70 after:content-comma last:after:content-none'
              : 'rounded-sm bg-soft px-[0.6em] pt-[0.2em] pb-[0.3em]',
          ]"
          >{{ item }}</span
        >
      </template>
    </template>
    <span v-else class="text-on-surface/50"> {{ $t("general.noTags") }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadTags extends Vue {
  @Prop({ type: Boolean, default: false }) readonly compact!: boolean;
  @Prop({ type: Array, required: true }) readonly labels!: string[];

  get renderedTags(): string[] {
    return this.labels.filter((tag) => tag !== "");
  }
}
</script>
