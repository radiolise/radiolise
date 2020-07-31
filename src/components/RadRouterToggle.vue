<template>
  <router-link :to="destination" v-bind="$attrs" :class="{ active }">
    <slot />
  </router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadRouterToggle extends Vue {
  @Prop({ type: String, required: true }) readonly to!: string;

  get active(): boolean {
    return this.$route.path === this.to;
  }

  get destination(): string {
    return this.active ? "/" : this.to;
  }
}
</script>
