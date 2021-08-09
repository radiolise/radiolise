<template>
  <router-link v-if="custom" v-slot="slotProps" :to="destination" custom>
    <slot v-bind="slotProps" :active="active" />
  </router-link>
  <router-link v-else :class="{ active }" :to="destination">
    <slot />
  </router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadRouterToggle extends Vue {
  @Prop({ type: String, required: true }) readonly to!: string;
  @Prop({ type: Boolean, default: false }) readonly custom!: boolean;

  get active() {
    return this.$route.path === this.to;
  }

  get destination() {
    return this.active ? "/" : this.to;
  }
}
</script>
