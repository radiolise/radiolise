<template>
  <div style="pointer-events: all">
    <div id="banner" v-show-slide="shown">
      <transition name="progress" appear>
        <div id="progress-bar" :key="animationTrigger" :class="{ active: autoHide }" />
      </transition>
      <div
        class="icons:w-fixed"
        style="display: table; padding: 10px; margin: 0 auto; max-width: 800px"
      >
        <div style="padding: 14px 20px; float: left"><FasInfoCircle /> {{ message }}</div>
        <div class="float-right whitespace-nowrap py-2.5">
          <RadButton @click="undo()"><FasUndo />{{ $t("general.undo") }}</RadButton>
          <RadButton @click="confirm()"><FasCheck />{{ $t("general.ok") }}</RadButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";
import { SearchStats, UndoableEvent } from "@/store";
import { navigate } from "@/common/routing";

import RadButton from "./RadButton.vue";

@Component({
  components: {
    RadButton,
    FasInfoCircle,
    FasUndo,
    FasCheck,
  },
})
export default class RadBanner extends Vue {
  timer?: number;
  message = "";
  autoHide = false;
  animationTrigger = false;

  @State readonly searchStats!: SearchStats;
  @State readonly stationBackup!: Station[];
  @State readonly undoableEvent?: UndoableEvent;

  @Getter readonly currentList!: Station[];
  @Getter readonly selectedList!: number;

  @Action discardUndoableEvent!: () => Promise<void>;

  @Action updateList!: (payload: { name?: string; content: Station[] }) => Promise<void>;

  get itemRemoved(): boolean {
    return this.undoableEvent !== undefined;
  }

  get listModified(): boolean {
    return (
      this.searchStats.added.length > 0 ||
      this.searchStats.removed.length > 0 ||
      this.searchStats.orderChanged
    );
  }

  get shown(): boolean {
    return this.itemRemoved || this.listModified;
  }

  undo(): void {
    if (this.itemRemoved) {
      if (this.undoableEvent !== undefined) {
        this.undoableEvent.undo();
        this.discardUndoableEvent();
      }
    } else {
      this.updateList({ content: this.stationBackup });
    }
  }

  confirm(): void {
    if (this.itemRemoved) {
      this.discardUndoableEvent();
    } else {
      navigate(null);
    }
  }

  @Watch("searchStats")
  onSearchStatsChanged(searchStats: SearchStats): void {
    if (searchStats.orderChanged) {
      this.message = this.$t("search.comparison.orderChanged") as string;
      return;
    }

    const numberOfChanges = searchStats.added.length + searchStats.removed.length;

    if (numberOfChanges === 0) {
      return;
    }

    if (numberOfChanges === 1) {
      const added = searchStats.added.length === 1;

      this.message = this.$t("search.comparison.oneChange", {
        name: added ? searchStats.added[0] : searchStats.removed[0],
        modified: this.$tc(`search.comparison.${added ? "added" : "removed"}`, 1),
      }) as string;

      return;
    }

    this.message = this.$t(
      `search.comparison.${
        searchStats.added.length > 0
          ? searchStats.removed.length > 0
            ? "diff"
            : "stationsAdded"
          : "stationsRemoved"
      }`,
      {
        plus: searchStats.added.length,
        minus: searchStats.removed.length,
        station: this.$tc("search.comparison.station", searchStats.added.length),
        added: this.$tc("search.comparison.added", searchStats.added.length),
        removed: this.$tc("search.comparison.removed", searchStats.removed.length),
      }
    ) as string;
  }

  @Watch("undoableEvent")
  onEventChanged(event?: UndoableEvent): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (event !== undefined) {
      this.autoHide = true;
      this.animationTrigger = !this.animationTrigger;

      this.message = this.$t(`general.undoableEvent.${event.kind}`, event.affected) as string;

      this.timer = setTimeout(this.discardUndoableEvent, 10000);
    } else {
      this.autoHide = false;
    }
  }

  @Watch("listModified")
  onListModified(listModified: boolean): void {
    if (listModified && this.itemRemoved) {
      this.discardUndoableEvent();
    }
  }
}
</script>

<style scoped>
#banner {
  text-align: center;
  font-size: 20px;
}
#progress-bar.progress-enter-active {
  animation: progress 10s linear;
}
#progress-bar.progress-leave-active {
  animation: none;
}
#progress-bar {
  height: 3px;
  transform-origin: left;
  visibility: hidden;
}
#progress-bar.active {
  visibility: visible;
}
</style>
