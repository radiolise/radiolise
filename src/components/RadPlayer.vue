<template>
  <div
    :class="[
      fullscreen ? 'absolute top-0 left-0 flex h-screen w-full' : 'contents',
      { 'cursor-none': controlsHidden },
    ]"
    @mousedown="showControls()"
    @mouseup="showControls()"
    @mousemove="showControls()"
  >
    <RadMedia />
    <div
      ref="controls"
      :class="[
        'pointer-events-none z-20 h-full overflow-hidden pb-10 mobile:mb-0',
        {
          'absolute bottom-0 w-full transform-none': fullscreen,
          'sticky top-12.5 -mb-borders': stickyPlayer,
        },
      ]"
    >
      <div
        :class="[
          'action-bar pointer-events-auto table w-full table-fixed text-left',
          fullscreen
            ? 'absolute bottom-0 bg-brand/90 px-3.75 py-5 text-white icons:text-[27px]'
            : 'bg-surface py-3.75 px-2.5 text-on-surface shadow-theme',
          stickyPlayer ? 'border-b' : 'mobile:border-b',
          { 'invisible opacity-0 transition-all': controlsHidden },
        ]"
      >
        <div :class="['table-cell w-7.5 align-middle', { hidden: fullscreen }]">
          <a class="p-1.25 text-lg" :title="$t('player.advancedView')" @click="expand()"
            ><FasChevronDown :class="{ '-rotate-180': detailsShown }" /></a
          >&nbsp;
        </div>
        <div class="table-cell align-middle">
          <div class="table-row h-10.25 w-full align-middle">
            <div
              :class="[
                'table-cell max-w-full whitespace-nowrap align-middle icons:w-fixed',
                { hidden: detailsShown },
              ]"
            >
              <a
                class="hidden p-1.25 text-lg xs:inline"
                :title="$t('player.prevStation')"
                @click="playClosestStation(false)"
                ><FasStepBackward /></a
              >&nbsp;<a
                class="p-1.25 text-lg"
                :title="$t('player.playStop')"
                @click="toggleStation()"
                ><component :is="station ? 'FasStop' : 'FasPlay'" /></a
              >&nbsp;<a
                class="hidden p-1.25 text-lg xs:inline"
                :title="$t('player.nextStation')"
                @click="playClosestStation(true)"
                ><FasStepForward
              /></a>
            </div>
            <div
              :class="[
                'table-cell w-full overflow-hidden px-2.5 align-middle text-lg',
                { 'max-w-0 whitespace-nowrap': !detailsShown, 'text-[27px]': fullscreen },
              ]"
              :title="tooltip"
              @click="expand()"
            >
              <transition enter-class="opacity-0" leave-to-class="opacity-0" mode="out-in" appear>
                <div
                  :key="broadcaster"
                  class="max-w-full overflow-hidden text-ellipsis font-bold transition-opacity"
                  :class="{ 'leading-[21px]': !fullscreen }"
                >
                  <FasSpinner v-if="loading" class="animate-spin" />
                  {{ broadcaster }}
                </div>
              </transition>
              <div
                v-show-slide="info && animationFinished && !loading"
                class="text-[17px]"
                :class="['leading-5', { 'max-h-5': !detailsShown }]"
              >
                <transition
                  enter-class="translate-x-7.5 opacity-0"
                  leave-to-class="translate-x-7.5 opacity-0"
                  mode="out-in"
                  appear
                >
                  <span
                    :key="animationTrigger"
                    :class="[
                      'max-w-full overflow-hidden text-ellipsis transition-[opacity,_transform]',
                      detailsShown ? 'block' : 'inline-block',
                    ]"
                    >{{ renderedInfo }}</span
                  >
                </transition>
              </div>
            </div>
            <div
              :class="['hidden whitespace-nowrap align-middle', { 'md:table-cell': !detailsShown }]"
            >
              <a
                v-if="station"
                :class="['p-1.25 text-lg', { 'text-accent icons:opacity-100': liked }]"
                :title="likeInfo"
                @click="like()"
                ><FasThumbsUp class="w-fixed" /></a
              >&nbsp;<a
                v-if="station !== undefined"
                class="p-1.25 text-lg"
                target="blank"
                :title="homepageInfo"
                :href="station.homepage"
                ><FasHome class="w-fixed"
              /></a>
              {{ " " }}
              <RadLink v-slot="{ active, navigate }" to="title-manager" toggle>
                <a
                  :class="['p-1.25 text-lg', { 'text-accent icons:opacity-100': active }]"
                  :title="$t('general.manageTitles')"
                  @click="navigate"
                >
                  <FasHistory class="w-fixed" />
                </a>
              </RadLink>
              {{ " " }}
              <a
                v-if="info"
                :title="$t('player.addBookmark')"
                :class="['p-1.25 text-lg', { 'text-accent icons:opacity-100': bookmarked }]"
                @click="toggleBookmark({ station: station.name, info })"
                ><FasMusic /><FasPlus class="relative -top-2 w-fixed text-icon-xs"
              /></a>
            </div>
            <div v-if="hasVideo" class="table-cell whitespace-nowrap align-middle">
              {{ "\xa0"
              }}<a
                class="p-1.25 text-lg"
                :title="$t('player.toggleFullscreen')"
                @click="toggleFullscreen()"
                ><component :is="fullscreen ? 'FasCompress' : 'FasExpand'" class="w-fixed"
              /></a>
            </div>
          </div>
          <div v-show-slide="!fullscreen && detailsShown" class="ml-1.25">
            <hr class="mt-2.5 h-0 border-t-2 border-mute-contrast/30" />
            <div v-show-slide="!!station" class="mx-1.25 mt-2.5">
              <div v-if="station" class="pb-2.5">
                <span
                  class="mb-0.5 inline-block bg-soft px-[0.6em] pt-[0.2em] pb-[0.3em] text-xs empty:hidden"
                  >{{ station.country }}</span
                >
                {{ " "
                }}<span
                  class="mb-0.5 inline-block bg-soft px-[0.6em] pt-[0.2em] pb-[0.3em] text-xs empty:hidden"
                  >{{ station.state }}</span
                ><template v-for="(item, i) in station.tags.split(',')">
                  {{ " "
                  }}<span
                    :key="i"
                    class="mb-0.5 inline-block bg-soft px-[0.6em] pt-[0.2em] pb-[0.3em] text-xs empty:hidden"
                    >{{ item }}</span
                  >
                </template>
              </div>
            </div>
            <div class="whitespace-nowrap py-2.5 align-middle">
              <a
                class="p-1.25 text-lg"
                :title="$t('player.prevStation')"
                @click="playClosestStation(false)"
                ><FasStepBackward class="w-fixed" /></a
              >&nbsp;<a
                class="p-1.25 text-lg"
                :title="$t('player.playStop')"
                @click="toggleStation()"
                ><component :is="station ? 'FasStop' : 'FasPlay'" class="w-fixed" /></a
              >&nbsp;<a
                class="p-1.25 text-lg"
                :title="$t('player.nextStation')"
                @click="playClosestStation(true)"
                ><FasStepForward class="w-fixed"
              /></a>
              {{ " " }}
              <RadSlider v-model="volume">
                <template #minusIcon>
                  <FasVolumeOff class="w-fixed" />
                </template>
                <template #plusIcon>
                  <FasVolumeUp class="w-fixed" />
                </template>
              </RadSlider>
            </div>
            <div class="pb-1.25">
              <div v-show-slide="station !== undefined">
                <div class="pt-2.5">
                  <a
                    v-if="station"
                    :class="[
                      'block w-full overflow-x-hidden text-ellipsis',
                      { 'font-bold text-accent icons:opacity-100': liked },
                    ]"
                    :title="likeInfo"
                    @click="like()"
                  >
                    <FasThumbsUp class="w-7.75" />
                    <template v-if="likeCount !== undefined">{{ formattedlikeCount }} | </template>
                    <template v-if="liked">{{ $t("player.alreadyVoted") }}</template>
                    <template v-else>{{ $t("general.like.submit") }}</template>
                  </a>
                </div>
              </div>
              <div v-show-slide="!!station">
                <div class="w-full overflow-x-hidden text-ellipsis pt-2.5">
                  <a v-if="station" target="blank" :title="homepageInfo" :href="station.homepage">
                    <FasHome class="w-7.75" />{{
                      $t("general.visitHomepage")
                    }}&nbsp;<FasExternalLinkAlt class="w-fixed" />
                  </a>
                </div>
              </div>
              <div>
                <div class="w-full overflow-x-hidden text-ellipsis pt-2.5">
                  <RadLink v-slot="{ active, navigate }" to="title-manager" toggle>
                    <a
                      :class="{ 'font-bold text-accent icons:opacity-100': active }"
                      @click="navigate"
                    >
                      <FasHistory class="w-7.75" />{{ $t("general.manageTitles") }}
                    </a>
                  </RadLink>
                </div>
              </div>
              <div v-show-slide="!!info">
                <div class="w-full overflow-x-hidden text-ellipsis pt-2.5">
                  <a
                    v-if="info"
                    :class="{ 'font-bold text-accent icons:opacity-100': bookmarked }"
                    @click="toggleBookmark({ station: station.name, info })"
                  >
                    <FasMusic /><FasPlus class="relative -top-1.5 w-fixed text-icon-xs" />{{
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
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import RadLink from "./RadLink.vue";
import RadMedia from "./RadMedia.vue";
import RadSlider from "./RadSlider.vue";
import BookmarkHelper from "@/mixins/BookmarkHelper";
import ScrollHelper from "@/mixins/ScrollHelper";

@Component({
  components: {
    RadLink,
    RadMedia,
    RadSlider,
    FasChevronDown,
    FasStepBackward,
    FasStop,
    FasPlay,
    FasStepForward,
    FasSpinner,
    FasThumbsUp,
    FasHome,
    FasHistory,
    FasMusic,
    FasPlus,
    FasCompress,
    FasExpand,
    FasVolumeOff,
    FasVolumeUp,
    FasExternalLinkAlt,
  },
})
export default class RadPlayer extends Mixins(BookmarkHelper, ScrollHelper) {
  animationFinished = true;
  animationTrigger = false;
  renderedInfo = "";
  controlsHidden = false;
  hideTimeout?: number;

  @Getter("currentLikeCount") readonly likeCount: number | undefined;
  @Getter("currentStation") readonly station: Station | undefined;
  @Getter("currentInfo") readonly info!: string;
  @Getter("isPlayerExpanded") readonly detailsShown!: boolean;
  @Getter readonly loading!: boolean;
  @Getter readonly likes!: string[];
  @Getter readonly bookmarks!: Title[];
  @Getter("volume") readonly globalVolume!: number;
  @Getter readonly playing!: boolean;

  @Action changeVolume!: (volume: number) => Promise<void>;
  @Action fetchLikeCount!: (id?: string) => Promise<number>;
  @Action likeStation!: (id: string) => Promise<void>;
  @Action playClosestStation!: (forward: boolean) => Promise<void>;
  @Action toggleFullscreen!: () => Promise<void>;
  @Action("toggleStation") _toggleStation!: () => Promise<void>;

  get broadcaster(): string {
    if (this.loading) {
      return this.$t("general.loading") as string;
    }

    if (this.station !== undefined) {
      return this.station.name;
    }

    return this.$t("player.ready") as string;
  }

  get homepageInfo(): string | null {
    if (this.station === undefined) {
      return null;
    }

    return this.station.homepage !== ""
      ? `${this.$t("general.visitHomepage")}\n${new URL(this.station.homepage).hostname}`
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
  onPlayingChanged(): void {
    this.animationFinished = false;

    setTimeout(() => {
      this.animationFinished = true;
    }, 600);
  }

  @Watch("station")
  onStationChanged(station?: Station): void {
    if (station !== undefined) {
      this.fetchLikeCount().catch(() => {});
    }
  }

  @Watch("fullscreen")
  onFullscreenChanged(): void {
    this.showControls();
  }

  expand(): void {
    this.expandPlayer(!this.detailsShown);

    if (this.detailsShown) {
      this.$scrollTo({
        element: document.documentElement,
      });
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
        icon: FasExclamationTriangle,
        message: this.$t("general.listEmpty[0]") as string,
      });
    });
  }
}
</script>
