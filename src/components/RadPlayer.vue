<template>
  <div
    :id="main && 'video'"
    ref="container"
    :class="{ hidden: controlsHidden }"
    @mousedown="showControls()"
    @mouseup="showControls()"
    @mousemove="showControls()"
  >
    <slot />
    <div class="videobar" style="display: table; table-layout: fixed">
      <div style="width: 30px">
        <a
          class="button-primary expand"
          :title="$t('player.advancedView')"
          @click="expand()"
          ><font-awesome-icon
            icon="chevron-down"
            style="transition: transform .4s"
            :style="{
              transform: 'rotate(' + (compact ? 0 : -180) + 'deg)',
            }"/></a
        >&nbsp;
      </div>
      <div>
        <div
          class="player"
          style="display: table-row; height: 41px; width: 100%; vertical-align: middle"
        >
          <div
            v-show="compact"
            class="mainopts"
            style="white-space: nowrap; display: table-cell; vertical-align: middle; max-width: 100%; transition: max-width .4s"
          >
            <a
              class="button-primary prevstation"
              :title="$t('player.prevStation')"
              @click="playClosestStation(false)"
              ><font-awesome-icon icon="step-backward" fixed-width/></a
            >&nbsp;<a
              class="button-primary stop"
              :title="$t('player.playStop')"
              @click="toggleStation()"
              ><font-awesome-icon
                :icon="station ? 'stop' : 'play'"
                fixed-width/></a
            >&nbsp;<a
              class="button-primary nextstation"
              :title="$t('player.nextStation')"
              @click="playClosestStation(true)"
              ><font-awesome-icon icon="step-forward" fixed-width
            /></a>
          </div>
          <div
            class="station"
            style="width: 100%; display: table-cell; vertical-align: middle; padding: 0 10px"
            :style="{
              maxWidth: compact ? 0 : 'none',
              whiteSpace: compact ? 'nowrap' : 'normal',
            }"
            @click="expand()"
          >
            <transition name="slide-fade" mode="out-in" appear>
              <div :key="broadcaster" class="broadcaster" :title="broadcaster">
                <font-awesome-icon v-if="loading" icon="spinner" spin />
                {{ broadcaster }}
              </div>
            </transition>
            <div
              v-show-slide="!!info && animationFinished"
              class="info"
              :style="{ maxHeight: expanded ? 'none' : '20px' }"
              :title="renderedInfo"
            >
              <transition name="slide-fade" mode="out-in" appear>
                <span
                  :key="animationTrigger"
                  :style="{ display: expanded ? 'block' : 'inline-block' }"
                  >{{ renderedInfo }}</span
                >
              </transition>
            </div>
          </div>
          <div
            v-show="compact"
            class="advopts"
            style="display: table-cell; white-space: nowrap; vertical-align: middle"
          >
            <a
              v-if="station"
              class="button-primary like"
              :class="{ active: liked }"
              :title="likeInfo"
              @click="like()"
              ><font-awesome-icon icon="thumbs-up" fixed-width/></a
            >&nbsp;<a
              v-if="station !== undefined"
              class="button-primary homepage"
              target="blank"
              :title="homepageInfo"
              :href="station.homepage"
              ><font-awesome-icon icon="home" fixed-width
            /></a>
            &nbsp;
            <rad-router-toggle
              class="button-primary showhistory"
              :title="$t('general.manageTitles')"
              to="/title-manager"
            >
              <font-awesome-icon icon="history" fixed-width />
            </rad-router-toggle>
            &nbsp;
            <a
              v-if="info"
              class="button-primary plushistory"
              :title="$t('player.addBookmark')"
              :class="{ active: bookmarked }"
              @click="toggleBookmark({ station: station.name, info })"
              ><font-awesome-icon icon="music"/><font-awesome-icon
                icon="plus"
                fixed-width
                size="xs"
                style="vertical-align: super"
            /></a>
          </div>
          <div v-if="hasVideo" class="fsdiv">
            {{ "\xa0"
            }}<a
              class="button-primary fullscreen"
              :title="$t('player.toggleFullscreen')"
              @click="toggleFullscreen()"
              ><font-awesome-icon
                :icon="fullscreen ? 'compress' : 'expand'"
                fixed-width
            /></a>
          </div>
        </div>
        <div v-if="main" id="infobox" v-show-slide="!fullscreen && expanded">
          <div class="hr" />
          <div id="tags" v-show-slide="!!station" style="margin: 10px 5px 0">
            <div v-if="station" style="padding-bottom: 10px">
              <span class="label">{{ station.country }}</span>
              &nbsp;<span class="label">{{ station.state }}</span
              ><template v-for="(item, i) in station.tags.split(',')">
                &nbsp;<span :key="i" class="label">{{ item }}</span>
              </template>
            </div>
          </div>
          <div
            style="white-space: nowrap; padding: 10px 0; vertical-align: middle"
          >
            <a
              class="button-primary prevstation"
              :title="$t('player.prevStation')"
              @click="playClosestStation(false)"
              ><font-awesome-icon icon="step-backward" fixed-width/></a
            >&nbsp;<a
              class="button-primary stop"
              :title="$t('player.playStop')"
              @click="toggleStation()"
              ><font-awesome-icon
                :icon="station ? 'stop' : 'play'"
                fixed-width/></a
            >&nbsp;<a
              class="button-primary nextstation"
              :title="$t('player.nextStation')"
              @click="playClosestStation(true)"
              ><font-awesome-icon icon="step-forward" fixed-width
            /></a>
            &nbsp;
            <rad-slider v-model="volume">
              <template #minusIcon>
                <font-awesome-icon icon="volume-off" fixed-width />
              </template>
              <template #plusIcon>
                <font-awesome-icon icon="volume-up" fixed-width />
              </template>
            </rad-slider>
          </div>
          <div style="padding-bottom: 5px">
            <div v-show-slide="station !== undefined">
              <div style="padding-top: 10px">
                <a
                  v-if="station"
                  class="like"
                  :class="{ active: liked }"
                  :title="likeInfo"
                  @click="like()"
                >
                  <font-awesome-icon
                    icon="thumbs-up"
                    fixed-width
                    style="width: 31px"
                  />
                  <template v-if="likeCount !== undefined"
                    >{{ formattedlikeCount }} |
                  </template>
                  <template v-if="liked">{{
                    $t("player.alreadyVoted")
                  }}</template>
                  <template v-else>{{ $t("general.like.submit") }}</template>
                </a>
              </div>
            </div>
            <div v-show-slide="!!station">
              <div style="padding-top: 10px">
                <a
                  v-if="station"
                  class="homepage"
                  target="blank"
                  :title="homepageInfo"
                  :href="station.homepage"
                >
                  <font-awesome-icon
                    icon="home"
                    fixed-width
                    style="width: 31px"
                  />{{ $t("general.visitHomepage") }}&nbsp;<font-awesome-icon
                    icon="external-link-alt"
                    fixed-width
                  />
                </a>
              </div>
            </div>
            <div>
              <div style="padding-top: 10px">
                <rad-router-toggle class="showhistory" to="/title-manager">
                  <font-awesome-icon
                    icon="history"
                    fixed-width
                    style="width: 31px"
                  />{{ $t("general.manageTitles") }}
                </rad-router-toggle>
              </div>
            </div>
            <div v-show-slide="!!info">
              <div style="padding-top: 9px">
                <a
                  v-if="info"
                  class="plushistory"
                  :class="{ active: bookmarked }"
                  @click="toggleBookmark({ station: station.name, info })"
                >
                  <font-awesome-icon icon="music" /><font-awesome-icon
                    icon="plus"
                    fixed-width
                    size="xs"
                    style="vertical-align: super"
                  /><span class="unlessactive">{{
                    $t("player.addBookmark")
                  }}</span
                  ><span class="ifactive">{{ $t("player.bookmarked") }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import RadRouterToggle from "./RadRouterToggle.vue";
import RadSlider from "./RadSlider.vue";
import BookmarkHelper from "@/mixins/BookmarkHelper";

@Component({
  components: {
    RadRouterToggle,
    RadSlider,
  },
})
export default class RadPlayer extends Mixins(BookmarkHelper) {
  animationFinished = true;
  animationTrigger = false;
  renderedInfo = "";
  controlsHidden = false;
  hideTimeout?: number;

  @Getter readonly fixedPlayer!: boolean;
  @Getter("currentLikeCount") readonly likeCount: number | undefined;
  @Getter("currentStation") readonly station: Station | undefined;
  @Getter("currentInfo") readonly info!: string;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly fullscreen!: boolean;
  @Getter("isPlayerExpanded") readonly expanded!: boolean;
  @Getter readonly loading!: boolean;
  @Getter readonly likes!: string[];
  @Getter readonly bookmarks!: Title[];
  @Getter("volume") readonly globalVolume!: number;
  @Getter readonly playing!: boolean;

  @Action changeVolume!: (volume: number) => Promise<void>;
  @Action expandPlayer!: (expand: boolean) => Promise<void>;
  @Action fetchLikeCount!: (id?: string) => Promise<number>;
  @Action likeStation!: (id: string) => Promise<void>;
  @Action playClosestStation!: (forward: boolean) => Promise<void>;
  @Action toggleFullscreen!: () => Promise<void>;
  @Action toggleStation!: () => Promise<void>;

  get main(): boolean {
    return "default" in this.$slots;
  }

  get broadcaster(): string {
    if (this.loading) {
      return this.$t("general.loading") as string;
    }

    if (this.station !== undefined) {
      return this.station.name;
    }

    return this.$t("player.ready") as string;
  }

  get compact(): boolean {
    return !this.main || !this.expanded;
  }

  get homepageInfo(): string | null {
    if (this.station === undefined) {
      return null;
    }

    return this.station.homepage !== ""
      ? `${this.$t("general.visitHomepage")}\n${
          new URL(this.station.homepage).hostname
        }`
      : "player.noHomepage";
  }

  get formattedlikeCount(): string | undefined {
    return this.likeCount?.toLocaleString(this.$i18n.locale);
  }

  get liked(): boolean {
    return this.station !== undefined && this.likes.includes(this.station.id);
  }

  get likeInfo(): string {
    let info = this.$t("general.like.submit") as string;

    if (this.likeCount !== undefined) {
      info += `\n${this.$t("general.like.count", [this.formattedlikeCount])}`;
    }

    return info;
  }

  get bookmarked(): boolean {
    const { station } = this;

    if (station === undefined) {
      return false;
    }

    return this.bookmarks.some(
      title => title.station === station.name && title.info === this.info
    );
  }

  get volume(): number {
    return this.globalVolume;
  }

  set volume(volume: number) {
    this.changeVolume(volume);
  }

  @Watch("info")
  onInfoChanged(info: string, oldInfo: string): void {
    if (info) {
      this.renderedInfo = info;

      if (oldInfo) {
        this.animationTrigger = !this.animationTrigger;
      }
    }
  }

  @Watch("playing")
  onPlayingChanged(playing: boolean): void {
    if (playing) {
      this.animationFinished = false;

      setTimeout(() => {
        this.animationFinished = true;
      }, 600);
    }
  }

  @Watch("station")
  onStationChanged(station?: Station): void {
    if (this.main && station !== undefined) {
      this.fetchLikeCount().catch(() => {});
    }
  }

  @Watch("fullscreen")
  onFullscreenChanged(fullscreen: boolean): void {
    this.showControls();
  }

  expand(): void {
    this.$scrollTo({
      element: document.documentElement,
    });

    if (this.main) {
      this.expandPlayer(!this.expanded);
    } else if (!this.expanded) {
      this.expandPlayer(true);
    }
  }

  like(): void {
    const station = this.station as Station;
    this.likeStation(station.id);
  }

  showControls(): void {
    if (this.hideTimeout !== undefined) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    this.controlsHidden = false;

    if (this.fullscreen) {
      this.hideTimeout = setTimeout(() => {
        this.controlsHidden = true;
      }, 3000);
    }
  }
}
</script>
