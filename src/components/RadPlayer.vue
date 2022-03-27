<template>
  <div
    ref="container"
    v-bind="main ? { id: 'video' } : {}"
    :class="{ hidden: controlsHidden }"
    @mousedown="showControls()"
    @mouseup="showControls()"
    @mousemove="showControls()"
  >
    <slot />
    <div class="media-controls" style="display: table; table-layout: fixed">
      <div style="width: 30px">
        <a
          class="button-primary expand"
          :title="$t('player.advancedView')"
          @click="expand()"
          ><FaIcon
            icon="chevron-down"
            :style="{
              transition: 'transform 0.4s',
              transform: `rotate(${compact ? 0 : -180}deg)`,
            }" /></a
        >&nbsp;
      </div>
      <div>
        <div
          class="player"
          style="
            display: table-row;
            height: 41px;
            width: 100%;
            vertical-align: middle;
          "
        >
          <div v-show="compact" class="main-options">
            <a
              class="button-primary previous-station"
              :title="$t('player.prevStation')"
              @click="playClosestStation(false)"
              ><FaIcon icon="step-backward" fixed-width /></a
            >&nbsp;<a
              class="button-primary"
              :title="$t('player.playStop')"
              @click="toggleStation()"
              ><FaIcon :icon="station ? 'stop' : 'play'" fixed-width /></a
            >&nbsp;<a
              class="button-primary next-station"
              :title="$t('player.nextStation')"
              @click="playClosestStation(true)"
              ><FaIcon icon="step-forward" fixed-width
            /></a>
          </div>
          <div
            class="station"
            :title="tooltip"
            style="
              width: 100%;
              display: table-cell;
              vertical-align: middle;
              padding: 0 10px;
            "
            :style="{
              maxWidth: compact ? 0 : 'none',
              whiteSpace: compact ? 'nowrap' : 'normal',
            }"
            @click="expand()"
          >
            <transition name="slide-fade" mode="out-in" appear>
              <div :key="broadcaster" class="broadcaster">
                <FaIcon v-if="loading" icon="spinner" spin />
                {{ broadcaster }}
              </div>
            </transition>
            <div
              v-show-slide="info && animationFinished && !loading"
              class="info"
              :style="{ maxHeight: expanded ? 'none' : '20px' }"
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
          <div v-show="compact" class="advanced-options">
            <a
              v-if="station"
              class="button-primary like"
              :class="{ active: liked }"
              :title="likeInfo"
              @click="like()"
              ><FaIcon icon="thumbs-up" fixed-width /></a
            >&nbsp;<a
              v-if="station !== undefined"
              class="button-primary homepage"
              target="blank"
              :title="homepageInfo"
              :href="station.homepage"
              ><FaIcon icon="home" fixed-width
            /></a>
            {{ " " }}
            <RadLink v-slot="{ active, navigate }" to="title-manager" toggle>
              <a
                :class="['button-primary', { active }]"
                :title="$t('general.manageTitles')"
                @click="navigate"
              >
                <FaIcon icon="history" fixed-width />
              </a>
            </RadLink>
            {{ " " }}
            <a
              v-if="info"
              class="button-primary"
              :title="$t('player.addBookmark')"
              :class="{ active: bookmarked }"
              @click="toggleBookmark({ station: station.name, info })"
              ><FaIcon icon="music" /><FaIcon
                icon="plus"
                fixed-width
                size="xs"
                style="vertical-align: super"
            /></a>
          </div>
          <div v-if="hasVideo" class="fullscreen-button-container">
            {{ "\xa0"
            }}<a
              class="button-primary fullscreen"
              :title="$t('player.toggleFullscreen')"
              @click="toggleFullscreen()"
              ><FaIcon :icon="fullscreen ? 'compress' : 'expand'" fixed-width
            /></a>
          </div>
        </div>
        <div v-if="main" id="info-box" v-show-slide="!fullscreen && expanded">
          <hr />
          <div id="tags" v-show-slide="!!station" style="margin: 10px 5px 0">
            <div v-if="station" style="padding-bottom: 10px">
              <span class="label">{{ station.country }}</span>
              {{ " " }}<span class="label">{{ station.state }}</span
              ><template v-for="(item, i) in station.tags.split(',')">
                {{ " " }}<span :key="i" class="label">{{ item }}</span>
              </template>
            </div>
          </div>
          <div
            style="white-space: nowrap; padding: 10px 0; vertical-align: middle"
          >
            <a
              class="button-primary previous-station"
              :title="$t('player.prevStation')"
              @click="playClosestStation(false)"
              ><FaIcon icon="step-backward" fixed-width /></a
            >&nbsp;<a
              class="button-primary"
              :title="$t('player.playStop')"
              @click="toggleStation()"
              ><FaIcon :icon="station ? 'stop' : 'play'" fixed-width /></a
            >&nbsp;<a
              class="button-primary next-station"
              :title="$t('player.nextStation')"
              @click="playClosestStation(true)"
              ><FaIcon icon="step-forward" fixed-width
            /></a>
            {{ " " }}
            <RadSlider v-model="volume">
              <template #minusIcon>
                <FaIcon icon="volume-off" fixed-width />
              </template>
              <template #plusIcon>
                <FaIcon icon="volume-up" fixed-width />
              </template>
            </RadSlider>
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
                  <FaIcon icon="thumbs-up" fixed-width style="width: 31px" />
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
                  <FaIcon icon="home" fixed-width style="width: 31px" />{{
                    $t("general.visitHomepage")
                  }}&nbsp;<FaIcon icon="external-link-alt" fixed-width />
                </a>
              </div>
            </div>
            <div>
              <div style="padding-top: 10px">
                <RadLink
                  v-slot="{ active, navigate }"
                  to="title-manager"
                  toggle
                >
                  <a :class="{ active }" @click="navigate">
                    <FaIcon icon="history" fixed-width style="width: 31px" />{{
                      $t("general.manageTitles")
                    }}
                  </a>
                </RadLink>
              </div>
            </div>
            <div v-show-slide="!!info">
              <div style="padding-top: 9px">
                <a
                  v-if="info"
                  :class="{ active: bookmarked }"
                  @click="toggleBookmark({ station: station.name, info })"
                >
                  <FaIcon icon="music" /><FaIcon
                    icon="plus"
                    fixed-width
                    size="xs"
                    style="vertical-align: super"
                  />{{
                    $t(`player.${bookmarked ? "bookmarked" : "addBookmark"}`)
                  }}
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

import RadLink from "./RadLink.vue";
import RadSlider from "./RadSlider.vue";
import BookmarkHelper from "@/mixins/BookmarkHelper";

@Component({
  components: {
    RadLink,
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
  @Action("toggleStation") _toggleStation!: () => Promise<void>;

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
      (title) => title.station === station.name && title.info === this.info
    );
  }

  get tooltip(): string {
    if (!this.loading && this.info !== undefined) {
      return `${this.broadcaster}\n${this.info}`;
    }
    return this.broadcaster;
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

  @Watch("broadcaster")
  onPlayingChanged(playing: boolean): void {
    this.animationFinished = false;

    setTimeout(() => {
      this.animationFinished = true;
    }, 600);
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

  toggleStation(): void {
    this._toggleStation().catch(() => {
      this.showToast({
        icon: "exclamation-triangle",
        message: this.$t("general.listEmpty[0]") as string,
      });
    });
  }
}
</script>

<style scoped>
#video {
  width: calc(100% + 120px);
  max-width: 100vw;
  transform: translateX(-60px);
  position: relative;
  height: 100%;
}
.media-controls {
  padding: 15px 10px;
  width: calc(100% - 20px);
  bottom: 0;
  text-align: left;
  display: table;
  height: 41px;
  visibility: visible;
  opacity: 1;
}
.hidden {
  cursor: none;
}
.hidden .media-controls {
  visibility: hidden;
  opacity: 0;
  transition-property: opacity, visibility;
  transition-duration: 0.3s;
}
.media-controls > div {
  display: table-cell;
  vertical-align: middle;
}
.station {
  width: 100%;
  max-width: 0;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  font-size: 18px;
}
.broadcaster {
  font-weight: bold;
  line-height: 21px;
}
.info {
  font-size: 17px;
  line-height: 20px;
}
.broadcaster,
.info > span {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition-property: transform, opacity;
  transition-duration: 0.3s;
}
.info > span.slide-fade-enter,
.info > span.slide-fade-leave-to {
  transform: translateX(30px);
}
.fullscreen-button-container {
  display: table-cell;
  vertical-align: middle;
  white-space: nowrap;
}
.main-options {
  white-space: nowrap;
  display: table-cell;
  vertical-align: middle;
  max-width: 100%;
  transition: max-width 0.4s;
}
.advanced-options {
  display: table-cell;
  white-space: nowrap;
  vertical-align: middle;
}
hr {
  margin-top: 10px;
  height: 2px;
  border-width: 0;
}
#info-box {
  font-size: 16px;
  margin-left: 5px;
}
#info-box > :last-child a {
  display: block;
  width: 100%;
  max-width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 820px) {
  #video {
    border-top-left-radius: 0;
  }
}
@media (max-width: 680px) {
  .advanced-options {
    display: none;
  }
}
@media (max-width: 600px) {
  #video {
    width: calc(100% + 40px);
    transform: translateX(-20px);
  }
}
@media (max-width: 480px) {
  .main-options .previous-station,
  .main-options .next-station {
    display: none;
  }
}
</style>
