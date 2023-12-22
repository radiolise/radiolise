<template>
  <div class="p-5 text-center transition-all">
    <div class="float-right icons:w-fixed icons:text-icon-lg">
      <RadLink v-if="!isMenu" v-slot="{ navigate }" to="menu">
        <button
          class="ring-inset ring-accent focus-visible:ring-2"
          @click="navigate"
          ref="menuButton"
        >
          <FasBars />
        </button>
      </RadLink>
      {{ " " }}
      <RadLink v-slot="{ navigate }" :to="null">
        <button
          class="ring-inset ring-accent focus-visible:ring-2"
          @click="navigate"
          ref="closeButton"
        >
          <FasTimesCircle />
        </button>
      </RadLink>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "vue-property-decorator";

@Component
export default class RadDrawer extends Vue {
  @Prop({ type: Boolean, default: false }) readonly isMenu!: boolean;
  @Ref() readonly menuButton!: HTMLElement;
  @Ref() readonly closeButton!: HTMLElement;

  mounted() {
    (document.activeElement as HTMLElement).blur();
    setTimeout(() => {
      if (this.isMenu) {
        this.closeButton.focus();
        return;
      }
      this.menuButton.focus();
    }, 300);
  }
}
</script>
