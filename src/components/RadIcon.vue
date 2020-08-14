<template>
  <div>
    <div class="playbutton">
      <div style="display: table-cell; vertical-align: middle">
        <font-awesome-icon
          :icon="overlay"
          fixed-width
          :spin="overlay === 'spinner'"
        />
      </div>
    </div>
    <div class="icontain">
      <div v-show="loaded" v-if="settings.loadpolicy" class="icon">
        <img ref="image" :src="url" @load="hidePlaceholder()" />
      </div>
      <div
        v-if="!loaded"
        class="icon"
        :style="{
          background: `hsl(${station.hue}, 50%, 50%)`,
        }"
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

  @Action updateColor!: (payload: {
    station: Station;
    hue: number;
  }) => Promise<void>;

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
    if (this.currentStation?.id === this.station.id) {
      return this.loading ? "spinner" : "stop";
    }

    return "play";
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
