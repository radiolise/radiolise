<template>
  <button
    :class="[
      'h-12.5 truncate px-2.5 text-xl duration-200',
      active
        ? 'bg-accent text-white focus-visible:bg-transparent focus-visible:text-inherit icons:opacity-100 icons:focus-visible:opacity-70'
        : 'bg-transparent hover:text-accent focus-visible:bg-accent focus-visible:text-white active:bg-accent active:text-white icons:opacity-70 icons:hover:opacity-100 icons:focus-visible:opacity-100 icons:active:opacity-100',
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
