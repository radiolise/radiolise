<template>
  <a
    :class="[
      'inline-block cursor-pointer rounded-[3px] px-3.75 py-2 duration-200 hover:text-accent active:bg-accent active:text-white first:icons:-ml-1.25 icons:active:opacity-100',
      fontSizeClass,
      { 'font-bold text-accent icons:opacity-100': active },
    ]"
    v-on="$listeners"
  >
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadButton extends Vue {
  @Prop({ type: Boolean, default: false }) readonly active!: boolean;
  @Prop({ type: String, default: "text-xl" }) readonly fontSizeClass!: string;
}
</script>
