<template>
  <div class="p-5 text-center transition-all">
    <div class="float-right icons:w-fixed icons:text-icon-lg">
      <RadLink v-if="!isMenu" v-slot="{ navigate }" to="menu">
        <a @click="navigate">
          <FasBars />
        </a>
      </RadLink>
      {{ " " }}
      <RadLink v-slot="{ navigate }" :to="null">
        <a @click="navigate">
          <FasTimesCircle />
        </a>
      </RadLink>
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
    FasBars,
    FasTimesCircle,
  },
})
export default class RadDrawer extends Vue {
  @Prop({ type: Boolean, default: false }) readonly isMenu!: boolean;
}
</script>
