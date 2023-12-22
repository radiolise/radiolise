<template>
  <div
    ref="titleRow"
    class="p-2.5 text-left ring-inset ring-accent transition-[background-color] duration-200 hover:bg-black/10 focus-visible:bg-black/10 focus-visible:ring-2"
    tabindex="0"
    role="button"
    @keydown.space="$event.preventDefault()"
    @keydown.enter="titleRow.click()"
    @keyup.space="titleRow.click()"
  >
    <div class="mb-1.25 text-[17px] font-bold">
      {{ title.info }}
    </div>
    <div class="text-on-surface/70">
      <span>{{ title.station }}</span
      ><span class="float-right ml-3.75">{{ timeStamp }}</span>
    </div>
    <div v-show-slide="active">
      <div class="pt-2.5" @click.stop>
        <RadButton
          v-if="!isBookmark"
          class="px-3 py-1.5"
          font-size-class="text-lg"
          :active="bookmarked"
          @click="toggleBookmark({ station: title.station, info: title.info })"
        >
          <FasMusic /><FasPlus class="relative -top-2 m-0 w-fixed text-icon-xs" />{{
            $tc("titleManager.bookmark", 1)
          }}
        </RadButton>
        <RadButton
          class="px-3 py-1.5"
          font-size-class="text-lg"
          :href="`https://musicbrainz.org/search?query=${encodeURIComponent(
            title.info
          )}&type=recording`"
          target="_blank"
        >
          <FasSearch class="w-fixed" />MusicBrainz
        </RadButton>
        <RadButton
          v-if="isBookmark"
          class="px-3 py-1.5"
          font-size-class="text-lg"
          @click="toggleBookmark({ station: title.station, info: title.info })"
        >
          <FasTimes class="w-fixed" />{{ $t("titleManager.remove") }}
        </RadButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Mixins } from "vue-property-decorator";
import { formatDistanceToNow } from "date-fns";
import { Getter, Action } from "vuex-class";

import BookmarkHelper from "@/mixins/BookmarkHelper";

@Component
export default class RadTitleRow extends Mixins(BookmarkHelper) {
  updateInterval: number | null = null;
  timeStamp: string | null = null;

  @Ref() readonly titleRow!: HTMLElement;

  @Prop({ required: true })
  readonly title!: Title;

  @Prop({ default: false }) readonly active!: boolean;
  @Prop({ type: Boolean, default: false }) readonly isBookmark!: boolean;

  @Getter readonly bookmarks!: Title[];
  @Getter readonly dateFnsLocale?: Locale;

  @Action determineDateFnsLocale!: (locale: string) => Promise<Locale | undefined>;

  async created(): Promise<void> {
    await this.$nextTick();
    this.updateInterval = window.setInterval(this.updateTimestamp, 1000);
    this.updateTimestamp();
  }

  destroyed(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
    }
  }

  get bookmarked(): boolean {
    return this.bookmarks.some(
      (item) => item.station === this.title.station && item.info === this.title.info
    );
  }

  updateTimestamp(): void {
    this.determineDateFnsLocale(this.$i18n.locale);
    this.timeStamp = formatDistanceToNow(this.title.time * 60, {
      addSuffix: true,
      locale: this.dateFnsLocale,
    });
  }
}
</script>
