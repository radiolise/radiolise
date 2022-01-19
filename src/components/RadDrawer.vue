<template>
  <div>
    <div class="menu-buttons">
      <rad-link v-if="!isMenu" v-slot="{ navigate }" to="menu">
        <a @click="navigate">
          <fa-icon icon="bars" fixed-width size="lg" />
        </a>
      </rad-link>
      {{ " " }}
      <rad-link v-slot="{ navigate }" :to="null">
        <a @click="navigate">
          <fa-icon icon="times-circle" fixed-width size="lg" />
        </a>
      </rad-link>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import RadLink from "./RadLink.vue";

@Component({
  components: {
    RadLink,
  },
})
export default class RadDrawer extends Vue {
  @Prop({ type: Boolean, default: false }) readonly isMenu!: boolean;
}
</script>

<style scoped>
.menu-buttons {
  float: right;
}
</style>
