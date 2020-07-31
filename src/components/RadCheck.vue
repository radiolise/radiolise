<template>
  <div :class="{ checkable: true, checked }" @click="toggleChecked()">
    <div>
      <transition name="fade" mode="out-in">
        <font-awesome-icon v-if="checked" key="checked" icon="check-square" />
        <font-awesome-icon v-else key="notChecked" :icon="['far', 'square']" />
      </transition>
    </div>
    <div>
      <strong v-if="strongHeading"><slot /></strong>
      <slot v-else />
      <template v-if="hasDescription">
        <br /><span class="description"><slot name="description"/></span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadCheck extends Vue {
  @Model("change", { type: Boolean, required: true })
  readonly checked!: boolean;

  @Prop({ type: Boolean, default: false }) readonly setting!: boolean;

  get hasDescription(): boolean {
    return this.$slots.description !== undefined;
  }

  get strongHeading(): boolean {
    return this.hasDescription || this.setting;
  }

  @Emit("change")
  toggleChecked(): boolean {
    return !this.checked;
  }
}
</script>

<style lang="less" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: transform 80ms;
}
.fade-enter,
.fade-leave-to {
  transform: scale(0.8, 0.7);
}
</style>
