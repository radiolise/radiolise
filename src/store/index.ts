import Vue from "vue";
import Vuex from "vuex";

import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import { DEFAULT_MEMORY } from "@/common/default-data";

Vue.use(Vuex);

export enum ModalType {
  NONE,
  ERROR,
  QUESTION,
  WARNING,
  INFO,
}

export interface ModalOptions {
  type?: ModalType;
  buttons: string[];
  title?: string;
  message: string;
  closeable?: boolean;
  handleButtonClicked?: (button: number) => void;
}

export enum ChangeKinds {
  STATION = "station",
  LIST = "list",
  BOOKMARK = "bookmark",
}

export interface UndoableEvent {
  kind: ChangeKinds;
  affected: string[];
  undo(): void;
}

export interface SearchStats {
  added: string[];
  removed: string[];
  orderChanged: boolean;
}

export interface StoreState {
  active: boolean;
  bufferFine: boolean;
  currentDialog: DialogState | null;
  currentInfo?: string;
  darkMode: boolean;
  dateFnsLocale: Locale | null;
  editing?: Station;
  enterKeyAllowed: boolean;
  stickyPlayer: boolean;
  fullscreen: boolean;
  hasVideo: boolean;
  likeState?: LikeState;
  memory: Memory;
  messages: Required<ModalOptions>[];
  navbarShown: boolean;
  playerExpanded: boolean;
  playing: boolean;
  ready: boolean;
  relaxed: boolean;
  fellAsleep: boolean;
  searchStats: SearchStats;
  sortMode: {
    index?: number;
    newIndex?: number;
  };
  stationBackup?: Station[];
  toast: Toast | null;
  undoableEvent?: UndoableEvent;
  volume: number;
}

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== "production",

  plugins: [
    (store) => {
      store.subscribe((_, state) => {
        if (state.ready) {
          localStorage.data = JSON.stringify(state.memory);
        }
      });

      store.dispatch("applySettings", store.state.memory?.settings);
    },
  ],

  state: {
    active: false,
    bufferFine: true,
    currentDialog: null,
    currentInfo: undefined,
    darkMode: false,
    dateFnsLocale: null,
    editing: undefined,
    enterKeyAllowed: true,
    stickyPlayer: false,
    fullscreen: false,
    hasVideo: false,
    likeState: undefined,
    memory: DEFAULT_MEMORY,
    messages: [],
    navbarShown: true,
    playerExpanded: false,
    playing: false,
    ready: false,
    relaxed: false,
    fellAsleep: false,
    searchStats: {
      added: [],
      removed: [],
      orderChanged: false,
    },
    sortMode: {
      index: undefined,
      newIndex: undefined,
    },
    stationBackup: undefined,
    toast: null,
    undoableEvent: undefined,
    volume: DEFAULT_MEMORY.settings.volume / 100,
  },

  getters,
  mutations,
  actions,
});

export default store;
