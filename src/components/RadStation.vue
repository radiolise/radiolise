<template>
  <div
    ref="stationRow"
    :class="[
      'station group flex cursor-pointer duration-200 hover:bg-black/10',
      transition ? 'transition-transform' : 'transition-[background-color]',
      { 'relative z-50 bg-mute opacity-80': dragged },
    ]"
    :style="{ transform: dragged ? `translateY(${currentTranslation}px)` : '' }"
    @click="handleClick()"
    @mousedown.left="handleMouseDown"
  >
    <div class="p-station">
      <RadIcon :station="station" :playing="playing" />
    </div>
    <div class="w-full overflow-x-hidden py-station">
      <div class="block pb-station-inner">
        <h4 class="mt-0 inline font-bold">
          {{ station.name }}
        </h4>
      </div>
      <div class="h-tags max-w-full">
        <div class="scrollbar-avoid overflow-y-hidden overflow-x-scroll">
          <div class="h-tags max-w-0 whitespace-nowrap">
            <RadTags :labels="labels" :compact="settings.compactMode" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex cursor-auto items-center pr-station-sm" @click.stop @mousedown.stop>
      <RadDropdown
        :actions="[$t('general.cancel')]"
        :label="$t('station.options', [station.name])"
        :data="menuOptions"
        @change="trigger"
      >
        <div class="flex h-10 w-10 items-center justify-center text-lg">
          <FasEllipsisV class="w-fixed" />
        </div>
      </RadDropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import DragHelper from "@/mixins/DragHelper";
import { navigate } from "@/common/routing";

@Component
export default class RadStation extends Mixins(DragHelper) {
  @Prop({ type: Object, required: true }) readonly station!: Station;

  @State readonly editing?: Station;

  @Getter readonly currentStation?: Station;
  @Getter readonly selectedList!: number;
  @Getter readonly settings!: Settings;

  @Action("removeStation") handleDelete!: (index: number) => Promise<void>;
  @Action("likeStation") like!: (id: string) => Promise<void>;
  @Action toggleStation!: (station: Station) => Promise<void>;

  get transition(): boolean {
    return !this.dragged && this.sortIndex !== undefined;
  }

  get labels(): string[] {
    return [this.station.country, this.station.state, ...this.station.tags.split(",")];
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

  trigger(optionName: keyof RadStation) {
    const option = this[optionName];
    if (typeof option === "function") {
      return option();
    }
    throw new Error(`Unknown option '${optionName}'.`);
  }
}
</script>
