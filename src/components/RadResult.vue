<template>
  <div
    class="flex cursor-pointer p-2.5 transition-[background-color] duration-200 hover:bg-black/10"
    @click="toggleSelection()"
  >
    <div :class="['w-0 text-emphasis duration-200', selected ? 'mr-6.25' : 'opacity-0']">
      <FasCheck />
    </div>
    <div>
      <h4 class="m-0">
        <slot></slot>
      </h4>
      <br />
      <slot name="tags"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Vue } from "vue-property-decorator";

@Component
export default class RadResult extends Vue {
  @Model("change", Boolean) readonly selected!: boolean;

  @Emit("change")
  toggleSelection(): boolean {
    return !this.selected;
  }
}
</script>
