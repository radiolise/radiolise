<template>
  <rad-drawer id="title-manager">
    <h3>
      <font-awesome-icon icon="history" fixed-width />
      {{ $t("titleManager.title") }}
    </h3>
    <div style="display: table; width: 100%">
      <button
        id="showrecent"
        style="display: table-cell; width: 100%"
        @click="showTitles = !showTitles"
      >
        <font-awesome-icon
          icon="chevron-down"
          fixed-width
          :style="{ transform: `rotate(${showTitles ? -180 : 0}deg)` }"
        />
        {{ $t("titleManager.recentTitles") }}
      </button>
      <div
        class="reload"
        style="display: none; font-size: 20px; width: 35px; text-align: right"
      >
        <a><font-awesome-icon icon="redo" fixed-width/></a>
      </div>
    </div>
    <div id="recent" v-show-slide="showTitles" style="text-align: left">
      <div
        v-if="history.length === 0"
        style="padding: 15px 0; text-align: center"
      >
        {{ $t("titleManager.listEmpty") }}
      </div>
      <rad-title-row
        v-for="title in history"
        v-else
        :key="title.time"
        :title="title"
        :active="activeTitle === title.time"
        @click.native="
          activeTitle = activeTitle !== title.time ? title.time : -1
        "
      />
    </div>
    <div style="display: table; width: 100%">
      <button id="showbookmarks" @click="showBookmarks = !showBookmarks">
        <font-awesome-icon
          icon="chevron-down"
          fixed-width
          :style="{
            transform: 'rotate(' + (showBookmarks ? -180 : 0) + 'deg)',
          }"
        />
        {{ $tc("titleManager.bookmark", 0) }}
      </button>
      <div
        class="download"
        style="display: table-cell; font-size: 20px; width: 35px; text-align: right"
      >
        <a @click="exportBookmarks()"
          ><font-awesome-icon icon="download" fixed-width
        /></a>
      </div>
    </div>
    <div id="favorites" v-show-slide="showBookmarks" style="text-align: left">
      <div
        v-if="bookmarks.length === 0"
        style="padding: 15px 0; text-align: center"
      >
        {{ $t("titleManager.listEmpty") }}
      </div>
      <template v-for="title in bookmarks" v-else>
        <rad-title-row
          v-if="title.hasOwnProperty('station')"
          :key="title.time"
          :title="title"
          :active="activeBookmark === title.time"
          is-bookmark
          @click.native="
            activeBookmark = activeBookmark !== title.time ? title.time : -1
          "
        />
        <div
          v-else
          :key="title"
          class="monthseparator"
          style="margin: 10px 0; padding: 5px 10px; font-size: 20px; font-weight: bold; opacity: .7"
        >
          {{ title }}
        </div>
      </template>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Moment from "moment";
import { State } from "vuex-class";
import download from "@/utils/downloader";
import RadDrawer from "@/components/RadDrawer.vue";
import RadTitleRow from "@/components/RadTitleRow.vue";

@Component({
  components: {
    RadDrawer,
    RadTitleRow,
  },
})
export default class RadTitleManager extends Vue {
  showTitles = false;
  showBookmarks = true;
  activeTitle = -1;
  activeBookmark = -1;

  @State readonly memory!: Memory;

  get bookmarks(): (string | Title)[] {
    let month: string;
    const content: (string | Title)[] = [];

    [...this.memory.titles.favorites].reverse().forEach(item => {
      const currentMonth = Moment(item.time * 60).format("MMMM YYYY");

      if (currentMonth !== month) {
        content.push(currentMonth);
        month = currentMonth;
      }

      content.push(item);
    });

    return content;
  }

  get history(): Title[] {
    return [...this.memory.titles.history].reverse();
  }

  exportBookmarks(): void {
    download({ name: "Bookmarks", type: "txt", output: this.bookmarks });
  }
}
</script>
