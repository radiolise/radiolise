<template>
  <div class="listitem" style="padding: 10px">
    <div
      style="margin-bottom: 5px; font-weight: normal; font-size: 17px; font-weight: bold"
    >
      {{ title.info }}
    </div>
    <div style="opacity: .7; overflow: auto">
      <span>{{ title.station }}</span
      ><span style="margin-left: 15px; float: right">{{ timeStamp }}</span>
    </div>
    <div v-show-slide="active" class="options" @click.stop>
      <a
        v-if="!isBookmark"
        class="button"
        style="margin-bottom: 0"
        :class="{ active: bookmarked }"
        @click="toggleBookmark({ station: title.station, info: title.info })"
        ><font-awesome-icon icon="music" /><font-awesome-icon
          icon="plus"
          fixed-width
          size="xs"
          style="vertical-align: super; margin: 0"
        />{{ $tc("titleManager.bookmark", 1) }}</a
      >
      <a
        class="button"
        :href="
          `https://musicbrainz.org/search?query=${encodeURIComponent(
            title.info
          )}&type=recording`
        "
        target="_blank"
        style="margin-bottom: 0"
        ><font-awesome-icon icon="search" fixed-width />MusicBrainz</a
      ><a
        v-if="isBookmark"
        class="button"
        style="margin-bottom: 0"
        @click="toggleBookmark({ station: title.station, info: title.info })"
        ><font-awesome-icon icon="times" fixed-width /><span>{{
          $t("titleManager.remove")
        }}</span></a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Moment from "moment";
import { Getter, Action } from "vuex-class";

@Component
export default class RadTitleRow extends Vue {
  updateInterval: number | null = null;
  timeStamp: string | null = null;

  @Prop({ required: true }) readonly title!: Title;
  @Prop({ default: false }) readonly active!: boolean;
  @Prop({ type: Boolean, default: false }) readonly isBookmark!: boolean;

  @Getter readonly bookmarks!: Title[];

  @Action toggleBookmark!: (payload: { station: string; info: string }) => void;

  created(): void {
    const update = (): void => {
      this.timeStamp = Moment(this.title.time * 60).fromNow();
    };

    this.$nextTick(() => {
      this.updateInterval = setInterval(update, 5000);
      update();
    });
  }

  destroyed(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
    }
  }

  get bookmarked(): boolean {
    return this.bookmarks.some(
      item =>
        item.station === this.title.station && item.info === this.title.info
    );
  }
}
</script>
