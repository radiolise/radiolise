<template>
  <div>
    <div class="play-button">
      <div>
        <component :is="overlay" :class="['w-fixed', { 'animate-spin': buffering }]" />
      </div>
    </div>
    <div class="icon-container">
      <div v-show="loaded" v-if="settings.loadpolicy" class="station-icon">
        <img ref="image" :src="url" alt="Logo" @load="hidePlaceholder()" />
      </div>
      <div
        v-if="!loaded"
        class="station-icon"
        :style="{ background: `hsl(${station.hue}, 50%, 50%)` }"
      >
        <span>{{ station.name[0].toUpperCase() }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

@Component
export default class RadIcon extends Vue {
  loaded = false;

  @Prop({ type: Object, required: true }) readonly station!: Station;

  @Getter readonly settings!: Settings;
  @Getter readonly currentStation?: Station;
  @Getter readonly loading!: boolean;

  @Action updateColor!: (payload: { station: Station; hue: number }) => Promise<void>;

  created(): void {
    if (this.station.hue === undefined) {
      const firstCharCode = this.station.name.toUpperCase().charCodeAt(0);

      this.updateColor({
        station: this.station,
        hue: (firstCharCode * 20) % 360,
      });
    }
  }

  get url(): string {
    return this.station.icon;
  }

  get overlay(): string {
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

<style scoped>
.play-button {
  position: absolute;
  z-index: 1;
  color: #ffffff;
  text-align: center;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  background: rgba(0, 0, 0, 0.5);
  display: table;
  opacity: 0;
  overflow: hidden;
}
.play-button > div {
  display: table-cell;
  vertical-align: middle;
}
.icon-container {
  border-radius: 50%;
  height: 35px;
  width: 35px;
  overflow: hidden;
  box-shadow: 0 0 1px #000;
}
.station-icon {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 22px;
  text-align: center;
  color: #fff;
  background: #fff;
  border-radius: 50%;
}
.station-icon > img {
  width: 100%;
}
.station-icon > span {
  width: 100%;
}
</style>
