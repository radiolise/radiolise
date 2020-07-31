<template>
  <div>
    <div class="menuButtons">
      <router-link v-if="!isMenu" to="/menu">
        <font-awesome-icon icon="bars" fixed-width size="lg" />
      </router-link>
      &nbsp;
      <router-link to="/">
        <font-awesome-icon icon="times-circle" fixed-width size="lg" />
      </router-link>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadDrawer extends Vue {
  @Prop({ type: Boolean, default: false }) readonly isMenu!: boolean;
}
</script>

<style lang="less" scoped>
.menuButtons {
  float: right;
}
</style>
