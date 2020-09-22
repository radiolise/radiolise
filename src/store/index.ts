import Vue from "vue";
import Vuex from "vuex";

import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import { defaultMemory } from "./default-data";

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
  currentInfo?: string;
  darkMode: boolean;
  editing?: Station;
  enterKeyAllowed: boolean;
  fixedPlayer: boolean;
  fullscreen: boolean;
  hasVideo: boolean;
  initialized: boolean;
  likeState?: LikeState;
  memory: Memory;
  messages: Required<ModalOptions>[];
  playerExpanded: boolean;
  playing: boolean;
  ready: boolean;
  relaxed: boolean;
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
    store => {
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
    currentInfo: undefined,
    darkMode: false,
    editing: undefined,
    enterKeyAllowed: true,
    fixedPlayer: false,
    fullscreen: false,
    hasVideo: false,
    initialized: false,
    likeState: undefined,
    memory: defaultMemory,
    messages: [],
    playerExpanded: false,
    playing: false,
    ready: false,
    relaxed: false,
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
    volume: defaultMemory.settings.volume / 100,
  },

  getters,
  mutations,
  actions,
});

export default store;
