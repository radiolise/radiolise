import { MutationTree } from "vuex";

import { StoreState, ModalOptions, UndoableEvent, SearchStats } from ".";

const mutations: MutationTree<StoreState> = {
  INITIALIZE(state, memory: Memory) {
    state.memory = memory;
    state.volume = memory.settings.volume / 100;
    state.ready = true;
  },

  SET_EDITING_REF(state, station?: Station): void {
    state.editing = station;
  },

  UPDATE_STATION(state, station: Station): void {
    Object.assign(state.editing, station);
  },

  SET_LISTS(state, lists: StationList[]): void {
    state.memory.lists = lists;
  },

  PUSH_LIST(state, list: StationList): void {
    state.memory.lists.push(list);
  },

  SET_LIST_NAME(state, { index, name }: { index: number; name: string }): void {
    state.memory.lists[index].name = name;
  },

  SET_LIST_CONTENT(state, { index, content }: { index: number; content: Station[] }): void {
    state.memory.lists[index].content = content;
  },

  SET_SEARCH_STATS(state, searchStats: SearchStats): void {
    state.searchStats = searchStats;
  },

  SET_SELECTED_LIST(state, index: number): void {
    if (index < 0) {
      index += state.memory.lists.length;
    }

    state.memory.lastList = index;
  },

  REMOVE_LIST({ memory }, index: number): void {
    memory.lists.splice(index, 1);
  },

  SET_SETTINGS({ memory }, settings: Settings): void {
    memory.settings = settings;
  },

  SET_CACHE_ITEM({ memory }, cacheItem: StationCache): void {
    memory.cache = { ...memory.cache, ...cacheItem };
  },

  SET_BOOKMARKS(state, bookmarks: Title[]): void {
    state.memory.titles.favorites = bookmarks;
  },

  SET_STATION_HUE(_, { station, hue }: { station: Station; hue: number }): void {
    Object.assign(station, { hue });
  },

  SET_PLAYER_EXPANDED(state, expand: boolean): void {
    state.playerExpanded = expand;
  },

  SET_LAST_STATION(state, station: Station): void {
    state.memory.lastStation = station;
  },

  SET_ACTIVE(state, active: boolean): void {
    state.active = active;
  },

  SET_HAS_VIDEO(state, hasVideo: boolean): void {
    state.hasVideo = hasVideo;
  },

  SET_FULLSCREEN(state, fullscreen: boolean): void {
    state.fullscreen = fullscreen;
  },

  SET_VOLUME(state, volume: number): void {
    state.volume = volume;
  },

  PUSH_MESSAGE(state, options: Required<ModalOptions>): void {
    state.messages.push(options);
  },

  SHIFT_MESSAGES(state): void {
    state.messages.shift();
  },

  SET_TOAST(state, toast: Toast | null): void {
    state.toast = toast;
  },

  SET_PLAYING(state, playing: boolean): void {
    state.playing = playing;
  },

  SET_RELAXED(state, relaxed: boolean): void {
    state.relaxed = relaxed;
  },

  SET_FELL_ASLEEP(state, fellAsleep: boolean): void {
    state.fellAsleep = fellAsleep;
  },

  SET_BUFFER_FINE(state, bufferFine: boolean): void {
    state.bufferFine = bufferFine;
  },

  SET_STICKY_PLAYER(state, sticky: boolean): void {
    state.stickyPlayer = sticky;
  },

  SET_CURRENT_INFO(state, info: string): void {
    state.currentInfo = info;
  },

  SET_HISTORY(state, history: Title[]): void {
    state.memory.titles.history = history;
  },

  PUSH_BOOKMARK(state, title: Title): void {
    state.memory.titles.favorites.push(title);
  },

  REMOVE_BOOKMARK(state, index: number): void {
    state.memory.titles.favorites.splice(index, 1);
  },

  SET_UNDOABLE_EVENT(state, undoableEvent?: UndoableEvent): void {
    state.undoableEvent = undoableEvent;
  },

  SET_STATION_BACKUP(state, stationBackup?: Station[]): void {
    state.stationBackup = stationBackup;
  },

  SET_SORT_INDEX(state, index?: number): void {
    state.sortMode.index = index;
  },

  SET_DARK_MODE(state, darkMode: boolean): void {
    state.darkMode = darkMode;
  },

  SET_LIKE_STATE(state, likeState: LikeState): void {
    state.likeState = likeState;
  },

  SET_ENTER_KEY_ALLOWED(state, enterKeyAllowed: boolean): void {
    state.enterKeyAllowed = enterKeyAllowed;
  },

  SET_DATE_FNS_LOCALE(state, locale: Locale): void {
    state.dateFnsLocale = locale;
  },

  SET_DIALOG(state, dialog: DialogState | null) {
    state.currentDialog = dialog;
  },

  SET_NAVBAR_SHOWN(state, navbarShown: boolean) {
    state.navbarShown = navbarShown;
  },
};

export default mutations;
