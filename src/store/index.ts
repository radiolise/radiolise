import Vue from "vue";
import Vuex, { Store, StoreOptions } from "vuex";

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
  initialized: boolean;
  ready: boolean;
  darkMode: boolean;
  active: boolean;
  currentInfo?: string;
  editing?: Station;
  fixedPlayer: boolean;
  fullscreen: boolean;
  hasVideo: boolean;
  memory: Memory;
  messages: ModalOptions[];
  hint: Hint | null;
  playerExpanded: boolean;
  playing: boolean;
  relaxed: boolean;
  bufferFine: boolean;
  volume: number;
  undoableEvent?: UndoableEvent;
  stationBackup?: Station[];
  searchStats: SearchStats;
  sortMode: {
    index?: number;
    newIndex?: number;
  };
  likeState?: LikeState;
}

const storeOptions: StoreOptions<StoreState> = {
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
    initialized: false,
    ready: false,
    darkMode: false,
    active: false,
    playing: false,
    relaxed: false,
    bufferFine: true,
    playerExpanded: false,
    hasVideo: false,
    fullscreen: false,
    fixedPlayer: false,
    volume: defaultMemory.settings.volume / 100,
    editing: undefined,
    memory: defaultMemory,
    currentInfo: undefined,
    messages: [],
    hint: null,
    undoableEvent: undefined,
    stationBackup: undefined,
    searchStats: {
      added: [],
      removed: [],
      orderChanged: false,
    },
    sortMode: {
      index: undefined,
      newIndex: undefined,
    },
    likeState: undefined,
  },

  getters,
  mutations,
  actions,
};

export default new Store(storeOptions);
