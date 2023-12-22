<template>
  <div>
    <div
      :class="[
        'absolute z-10 flex h-8.75 w-8.75 items-center justify-center overflow-hidden rounded-full bg-black/50 text-center text-white icons:opacity-100',
        { 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100': !playing },
      ]"
    >
      <div>
        <component :is="overlay" :class="['w-fixed', { 'animate-spin': buffering }]" />
      </div>
    </div>
    <div class="h-8.75 w-8.75 overflow-hidden rounded-full shadow-[0_0_1px_0] shadow-black">
      <div
        v-if="settings.loadpolicy"
        :class="[
          'flex h-full items-center bg-white',
          playing ? 'blur' : 'group-hover:blur group-focus-visible:blur',
          { hidden: !loaded },
        ]"
      >
        <img class="w-full" :src="url" alt="Logo" @load="hidePlaceholder()" />
      </div>
      <div
        v-if="!loaded"
        :class="[
          'flex h-full w-full items-center text-center text-xl text-white',
          playing ? 'blur' : 'group-hover:blur group-focus-visible:blur',
        ]"
        :style="{ backgroundColor: `hsl(${station.hue} 50% 50%)` }"
      >
        <div class="w-full">{{ station.name[0].toUpperCase() }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import FasSpinner from "~icons/fa-solid/spinner";
import FasStop from "~icons/fa-solid/stop";
import FasPlay from "~icons/fa-solid/play";

@Component
export default class RadIcon extends Vue {
  loaded = false;

  @Prop(Boolean) readonly playing!: boolean;
  @Prop({ type: Object, required: true }) readonly station!: Station;

  @Getter readonly settings!: Settings;
  @Getter readonly currentStation?: Station;
  @Getter readonly loading!: boolean;

  @Action updateColor!: (payload: { station: Station; hue: number }) => Promise<void>;

  created(): void {
    if (this.station.hue === undefined) {
      const firstCharCode = this.station.name.toUpperCase().codePointAt(0)!;

      this.updateColor({
        station: this.station,
        hue: (firstCharCode * 20) % 360,
      });
    }
  }

  get url(): string {
    return this.station.icon;
  }

  get overlay(): any {
    if (this.buffering) {
      return FasSpinner;
    }

    return this.active ? FasStop : FasPlay;
  }

  get active(): boolean {
    return this.currentStation?.id === this.station.id;
  }

  get buffering(): boolean {
    return this.active && this.loading;
  }

  @Watch("settings.loadpolicy")
  handleLoadPolicyChanged(): void {
    this.showPlaceholder();
  }

  @Watch("url")
  handleUrlChanged(): void {
    this.showPlaceholder();
  }

  showPlaceholder(): void {
    this.loaded = false;
  }

  hidePlaceholder(): void {
    this.loaded = true;
  }
}
</script>
