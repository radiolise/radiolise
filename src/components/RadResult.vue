<template>
  <div class="result" :class="{ selected }" @click="toggleSelection()">
    <div class="check-mark highlighted">
      <FaIcon icon="check" style="margin-left: 10px" />
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

<style scoped>
.result {
  cursor: pointer;
  display: table;
  table-layout: fixed;
  width: 100%;
  transition: background 0.2s;
}
.result:hover {
  background: rgba(0, 0, 0, 0.1);
}
.check-mark {
  display: table-cell;
  opacity: 0;
  width: 0;
  transition-property: opacity, width;
  transition-duration: 0.2s;
}
.selected .check-mark {
  opacity: 1;
  width: 25px;
}
</style>
