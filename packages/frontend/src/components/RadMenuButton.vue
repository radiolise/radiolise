<template>
  <button
    :class="[
      'h-12.5 cursor-pointer px-2.5 text-xl duration-200',
      active
        ? 'bg-accent text-white icons:opacity-100'
        : 'bg-transparent hover:text-accent active:bg-accent active:text-white icons:opacity-70 icons:hover:opacity-100 icons:active:opacity-100',
    ]"
    v-on="$listeners"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadMenuButton extends Vue {
  @Prop({ type: Boolean, default: false }) readonly active!: boolean;
}
</script>
