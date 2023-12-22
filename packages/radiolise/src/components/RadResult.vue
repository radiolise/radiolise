<template>
  <button
    class="flex w-full p-2.5 text-left ring-inset ring-accent transition-[background-color] duration-200 hover:bg-black/10 focus-visible:bg-black/10 focus-visible:ring-2 icons:opacity-100"
    ref="result"
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
  </button>
</template>

<script lang="ts">
import { Component, Emit, Model, Ref, Vue } from "vue-property-decorator";

@Component
export default class RadResult extends Vue {
  @Ref() readonly result!: HTMLElement;

  @Model("change", Boolean) readonly selected!: boolean;

  @Emit("change")
  toggleSelection(): boolean {
    return !this.selected;
  }

  focus() {
    this.result.focus();
  }
}
</script>
