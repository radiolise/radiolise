import { GetterTree } from "vuex";
import { StoreState, ModalOptions } from ".";

const getters: GetterTree<StoreState, StoreState> = {
  listName(state): string {
    return state.memory.lists[state.memory.lastList]?.name;
  },

  currentList(state): Station[] {
    return state.memory.lists[state.memory.lastList]?.content;
  },

  currentStation(state): Station | undefined {
    return state.memory.lastStation !== null && state.active ? state.memory.lastStation : undefined;
  },

  selectedList(state): number {
    return state.memory.lastList;
  },

  currentInfo(state): string | undefined {
    return state.currentInfo;
  },

  dateFnsLocale(state): Locale | undefined {
    return state.dateFnsLocale ?? undefined;
  },

  settings(state): Settings {
    return { ...state.memory.settings };
  },

  colorScheme(state): string | null {
    return state.initialized ? state.memory.settings.colorScheme : null;
  },

  language(state): string {
    return state.memory.settings.language;
  },

  playing(state): boolean {
    return state.playing;
  },

  hasVideo(state): boolean {
    return state.hasVideo;
  },

  fullscreen(state): boolean {
    return state.fullscreen;
  },

  fixedPlayer(state): boolean {
    return state.fixedPlayer;
  },

  volume(state): number {
    return state.volume;
  },

  isPlayerExpanded(state): boolean {
    return state.playerExpanded;
  },

  lists(state): StationList[] {
    return state.memory.lists;
  },

  visualizationActive(state): boolean {
    return (
      (state.memory.settings.visualization && state.playing && !state.hasVideo) || state.relaxed
    );
  },

  dragging(state): boolean {
    return state.sortMode.index !== undefined;
  },

  editing(state): Station | undefined {
    return state.editing;
  },

  modalOptions(state): Required<ModalOptions> | undefined {
    return state.messages[0];
  },

  loading(state): boolean {
    return state.active && (!state.playing || !state.bufferFine);
  },

  changeColor(state): boolean {
    return state.memory.settings.changecolor || state.relaxed;
  },

  likes(state): string[] {
    return Object.entries(state.memory.cache)
      .filter(([_, stationData]) => stationData.liked)
      .map(([id]) => id);
  },

  bookmarks(state): Title[] {
    return state.memory.titles.favorites;
  },

  sortIndex(state): number | undefined {
    return state.sortMode.index;
  },

  ready(state): boolean {
    return state.ready;
  },

  likeState(state): LikeState | undefined {
    return state.likeState;
  },

  currentLikeCount(state): number | undefined {
    const station = state.memory.lastStation;

    if (station !== null) {
      return state.memory.cache[station.id]?.likeCount;
    }

    return undefined;
  },
};

export default getters;
