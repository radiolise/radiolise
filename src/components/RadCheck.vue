<template>
  <div class="checkbox" :class="{ checked }" @click="toggleChecked()">
    <div>
      <transition name="fade" mode="out-in">
        <FasCheckSquare v-if="checked" key="checked" />
        <FarSquare v-else key="notChecked" class="opacity-70" />
      </transition>
    </div>
    <div>
      <strong v-if="strongHeading"><slot /></strong>
      <slot v-else />
      <template v-if="hasDescription">
        <br /><span class="description"><slot name="description" /></span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {
    FasCheckSquare,
    FarSquare,
  },
})
export default class RadCheck extends Vue {
  @Model("change", { type: Boolean, default: false })
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

<style scoped>
.checkbox {
  cursor: pointer;
}
.checkbox > div {
  vertical-align: top;
  display: table-cell;
}
.checkbox > :first-child {
  width: 25px;
  font-size: 20px;
}
.checkbox > :last-child {
  padding-top: 3px;
}
.fade-enter-active,
.fade-leave-active {
  transition: transform 80ms;
}
.fade-enter,
.fade-leave-to {
  transform: scale(0.8, 0.7);
}
</style>
