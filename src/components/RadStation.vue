<template>
  <div
    ref="station-row"
    class="station-row"
    :class="{ dragging, playing, transition }"
    :style="{ transform: dragging ? `translateY(${currentTranslate}px)` : '' }"
    @click="handleClick()"
    @mousedown.left="handleMouseDown"
  >
    <div>
      <RadIcon :station="station" />
    </div>
    <div>
      <div
        style="display: block; padding-bottom: var(--rad-station-padding-inner)"
      >
        <div>
          <h4 style="font-weight: bold; display: inline">
            {{ station.name }}
          </h4>
        </div>
      </div>
      <div style="overflow: hidden; height: var(--rad-station-tags-height)">
        <div
          class="avoid-scrollbar"
          style="overflow: scroll hidden; width: 100%"
        >
          <div
            style="white-space: nowrap; height: var(--rad-station-tags-height)"
          >
            <RadTags :labels="labels" />
          </div>
        </div>
      </div>
    </div>
    <div @click.stop @mousedown.stop>
      <RadDropdown
        :actions="[$t('general.cancel')]"
        :label="$t('station.options', [station.name])"
        :data="menuOptions"
        flex-align
        @change="trigger"
      >
        <FaIcon icon="ellipsis-v" fixed-width />
      </RadDropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Mixins } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import RadDropdown from "./RadDropdown.vue";
import RadIcon from "./RadIcon.vue";
import RadTags from "./RadTags.vue";

import DragHelper from "@/mixins/DragHelper";
import { navigate } from "@/common/routing";

@Component({
  components: {
    RadDropdown,
    RadIcon,
    RadTags,
  },
})
export default class RadStation extends Mixins(DragHelper) {
  @Prop({ type: Object, required: true }) readonly station!: Station;

  @Ref() readonly menu!: HTMLSelectElement;

  @State readonly editing?: Station;

  @Getter readonly currentStation?: Station;
  @Getter readonly selectedList!: number;

  @Action("removeStation") handleDelete!: (index: number) => Promise<void>;
  @Action likeStation!: (id: string) => Promise<void>;
  @Action toggleStation!: (station: Station) => Promise<void>;

  get transition(): boolean {
    return !this.dragging && this.sortIndex !== undefined;
  }

  get labels(): string[] {
    return [
      this.station.country,
      this.station.state,
      ...this.station.tags.split(","),
    ];
  }

  get menuOptions(): DropdownOption[] {
    const options = [
      { id: "like", name: this.$t("general.like.submit") as string },
      { id: "visitHomepage", name: this.$t("general.visitHomepage") as string },
      { id: "edit", name: this.$t("station.edit") as string },
    ];

    if (this.index > 0) {
      options.push({ id: "moveUp", name: this.$t("station.moveUp") as string });
    }

    if (this.index < this.currentList.length - 1) {
      options.push({
        id: "moveDown",
        name: this.$t("station.moveDown") as string,
      });
    }

    options.push({ id: "delete", name: this.$t("station.delete") as string });
    return options;
  }

  get playing(): boolean {
    if (this.currentStation === undefined) {
      return false;
    }

    return this.currentStation.id === this.station.id;
  }

  handleClick(): void {
    this.finishSorting();
    this.toggleStation(this.station);
  }

  visitHomepage(): void {
    window.open(this.station.homepage, "_blank");
  }

  edit(): void {
    const props = {
      list: this.selectedList,
      id: this.station.id,
    };

    const historyState = window.history.state;

    const otherRouteActive =
      historyState?.viewId !== "editor" ||
      historyState?.props.list !== props.list ||
      historyState?.props.id !== props.id;

    if (otherRouteActive) {
      navigate("editor", { props, force: true });
    }
  }

  moveUp(): void {
    this.moveStation({ index: this.index, newIndex: this.index - 1 });
  }

  moveDown(): void {
    this.moveStation({ index: this.index, newIndex: this.index + 1 });
  }

  delete(index = this.index): void {
    if (this.editing === this.station) {
      navigate(null, { replace: true });
    }

    this.handleDelete(index);
  }

  trigger(option: string): void {
    switch (option) {
      case "like":
        this.likeStation(this.station.id);
        break;
      case "visitHomepage":
        this.visitHomepage();
        break;
      case "edit":
        this.edit();
        break;
      case "moveUp":
        this.moveUp();
        break;
      case "moveDown":
        this.moveDown();
        break;
      case "delete":
        this.delete();
        break;
      default:
        throw new Error(`Unknown option '${option}'.`);
    }
  }
}
</script>

<style scoped>
.station-row {
  --rad-station-padding-standard: 20px;
  --rad-station-padding-small: 15px;
  --rad-station-padding-inner: 20px;
  --rad-station-tags-height: 30px;
  cursor: pointer;
  display: table;
  transition: background 0.2s;
}
.compact-mode .station-row {
  --rad-station-padding-standard: 15px;
  --rad-station-padding-small: 10px;
  --rad-station-padding-inner: 5px;
  --rad-station-tags-height: auto;
}
.station-row:hover {
  background: rgba(0, 0, 0, 0.1);
}
.station-row > div {
  display: table-cell;
  padding-top: var(--rad-station-padding-standard);
  padding-bottom: var(--rad-station-padding-standard);
}
.station-row > :first-child {
  padding: var(--rad-station-padding-standard);
  vertical-align: top;
}
.station-row > :nth-child(2) {
  text-align: left;
  width: 100%;
  max-width: 0;
}
.station-row > :last-child {
  cursor: auto;
  vertical-align: middle;
  padding: 0 var(--rad-station-padding-small) 0 0;
}
.dragging {
  position: relative;
  z-index: 10;
  opacity: 0.8;
}
.transition {
  transition: transform 0.3s;
}
.avoid-scrollbar {
  scrollbar-width: none;
}
.avoid-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
