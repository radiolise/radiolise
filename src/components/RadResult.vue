<template>
  <div
    style="cursor: pointer; display: table; table-layout: fixed; width: 100%"
    class="result"
    :class="{ selected }"
    @click="toggleSelection()"
  >
    <div class="checkmark highlighted" style="display: table-cell">
      <font-awesome-icon icon="check" style="margin-left: 10px" />
    </div>
    <div style="padding: 10px; margin-bottom: 10px; display: table-cell">
      <h4 style="margin: 0">
        <slot />
      </h4>
      <br />
      <slot name="tags" />
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
