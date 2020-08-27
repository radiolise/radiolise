import { ActionTree } from "vuex";
import XorWith from "lodash.xorwith";

import Screenfull from "screenfull";

import { StoreState, ModalOptions, ModalType, ChangeKinds } from ".";
import { defaultSettings } from "./default-data";

import network, {
  fetchNowPlayingInfo,
  fetchTheme,
  voteForStation,
  fetchVoteNumber,
} from "@/utils/network";

let source = network.CancelToken.source();
let updateTimer: number;
let sleepTimer: number;
let relaxTimer: number;
let hintTimer: number;

const actions: ActionTree<StoreState, StoreState> = {
  init({ commit }, memory: Memory): void {
    commit("INITIALIZE", memory);
  },

  setDarkMode({ commit }, darkMode: boolean): void {
    commit("SET_DARK_MODE", darkMode);
  },

  expandPlayer({ commit, state }, expand: boolean): void {
    if (state.playerExpanded !== expand && (!expand || !state.fullscreen)) {
      commit("SET_PLAYER_EXPANDED", expand);
    }
  },

  fixPlayer({ commit }, fixedPlayer: boolean): void {
    commit("SET_FIXED_PLAYER", fixedPlayer);
  },

  discardUndoableEvent({ commit }): void {
    commit("SET_UNDOABLE_EVENT", undefined);
  },

  validateListName({ state }, listName: string): void {
    if (listName === "") {
      throw new Error("List name must not be empty.");
    }

    const listNameExists = state.memory.lists
      .map(list => list.name)
      .includes(listName);

    if (listNameExists) {
      throw new Error("List name already taken.");
    }
  },

  createList({ commit, dispatch }, list: StationList): void {
    dispatch("validateListName", list.name);
    commit("PUSH_LIST", list);
  },

  renameList(
    { commit, dispatch },
    payload: { index: number; name: string }
  ): void {
    dispatch("validateListName", payload.name);
    commit("SET_LIST_NAME", payload);
  },

  changeList({ commit }, index: number): void {
    commit("SET_SELECTED_LIST", index);
  },

  removeList({ commit, state }, index: number): void {
    const backup = [...state.memory.lists];
    const { name } = state.memory.lists[index];

    commit("SET_UNDOABLE_EVENT", {
      kind: ChangeKinds.LIST,
      affected: [name],
      undo() {
        commit("SET_LISTS", backup);
      },
    });

    commit("REMOVE_LIST", index);

    if (state.memory.lastList === index) {
      commit("SET_SELECTED_LIST", 0);
    }
  },

  removeStation({ commit, dispatch, state }, index: number): void {
    const selectedList = state.memory.lastList;
    const currentList = state.memory.lists[selectedList];
    const backup = [...currentList.content];
    const { name } = backup[index];

    if (state.stationBackup === undefined) {
      commit("SET_UNDOABLE_EVENT", {
        kind: ChangeKinds.STATION,
        affected: [name, currentList.name],
        undo() {
          dispatch("updateList", { content: backup });
        },
      });
    }

    dispatch("updateList", {
      content: currentList.content.filter((_, i) => i !== index),
    });
  },

  startSorting({ commit }, index: number): void {
    commit("SET_SORT_INDEX", index);
  },

  moveStation(
    { dispatch, state },
    { index, newIndex }: { index: number; newIndex: number }
  ): void {
    const listContent = [...state.memory.lists[state.memory.lastList].content];
    listContent.splice(newIndex, 0, ...listContent.splice(index, 1));
    dispatch("updateList", { content: listContent });
  },

  editStation({ commit }, station: Station | undefined): void {
    commit("SET_EDITING_REF", station);
  },

  updateStation({ commit }, stationReference: Station): void {
    commit("UPDATE_STATION", stationReference);
  },

  setStationBackup({ commit }, stationBackup: Station[] | undefined): void {
    commit("SET_STATION_BACKUP", stationBackup);
  },

  updateColor({ commit }, payload: { station: Station; hue: number }): void {
    commit("SET_STATION_HUE", payload);
  },

  applySettings({ commit, dispatch, state }, settings: Settings): void {
    let sleepNow = false;
    let relaxNow = false;

    if (
      settings.sleep !== state.memory.settings.sleep ||
      settings.sleepTimeout !== state.memory.settings.sleepTimeout
    ) {
      if (sleepTimer) {
        clearTimeout(sleepTimer);
      }

      if (state.playing) {
        sleepNow = true;
      }
    }

    if (
      settings.relax !== state.memory.settings.relax ||
      settings.relaxTimeout !== state.memory.settings.relaxTimeout
    ) {
      if (relaxTimer) {
        clearTimeout(relaxTimer);
      }

      if (state.playing) {
        relaxNow = true;
      }
    }

    if (settings !== state.memory.settings) {
      commit("SET_SETTINGS", settings);
    }

    if (sleepNow) {
      dispatch("setSleepTimer");
    }

    if (relaxNow) {
      dispatch("setRelaxTimer");
    }
  },

  reset({ dispatch }): void {
    dispatch("applySettings", defaultSettings);
  },

  stop({ dispatch }): void {
    dispatch("play", undefined);
  },

  playClosestStation({ dispatch, state }, forward: boolean): void {
    const { lastStation } = state.memory;
    const currentList = state.memory.lists[state.memory.lastList].content;

    if (!state.active || lastStation === null || currentList.length < 2) {
      return;
    }

    const oldIndex = currentList
      .map(station => station.id)
      .indexOf(lastStation.id);

    const index =
      (currentList.length + oldIndex + (forward ? 1 : -1)) % currentList.length;

    dispatch("play", currentList[index]);
  },

  toggleStation({ dispatch, state }, station?: Station): void {
    const { lastStation, lists } = state.memory;

    if (station === undefined) {
      station = lastStation ?? lists[state.memory.lastList].content[0];
    }

    if (!state.active || lastStation?.id !== station.id) {
      dispatch("play", station);
    } else {
      dispatch("stop");
    }
  },

  confirmFullscreen({ commit, dispatch }, fullscreen: boolean): void {
    commit("SET_FULLSCREEN", fullscreen);

    if (fullscreen) {
      const app = document.querySelector("#app") as HTMLDivElement;
      app.scrollTop = 0;
      dispatch("expandPlayer", false);
    } else {
      document.documentElement.scrollTop = 0;
    }
  },

  toggleFullscreen({ state }): void {
    if (state.hasVideo && Screenfull.isEnabled) {
      Screenfull.toggle();
    }
  },

  updateList(
    { state, getters, commit, dispatch },
    payload: { name?: string; content: Station[] }
  ): void {
    const index =
      payload.name !== undefined
        ? state.memory.lists.map(list => list.name).indexOf(payload.name)
        : state.memory.lastList;

    commit("SET_LIST_CONTENT", { index, content: payload.content });

    if (payload.name !== undefined) {
      dispatch("changeList", index);
    }

    const searchModeActive = state.stationBackup !== undefined;

    if (searchModeActive) {
      const stationBackup = state.stationBackup as Station[];
      const newList = getters.currentList as Station[];

      const changeLog = XorWith(
        newList,
        stationBackup,
        (station, otherStation) => station.id === otherStation.id
      );

      const added: string[] = [];
      const removed: string[] = [];

      const orderChanged =
        changeLog.length === 0 &&
        newList.some((station, i) => station.id !== stationBackup[i].id);

      changeLog.forEach(station => {
        if (newList.map(station => station.id).includes(station.id)) {
          added.push(station.name);
        } else {
          removed.push(station.name);
        }
      });

      commit("SET_SEARCH_STATS", {
        added,
        removed,
        orderChanged,
      });
    }
  },

  resetSearchStats({ commit }): void {
    commit("SET_SEARCH_STATS", {
      added: [],
      removed: [],
      orderChanged: false,
    });
  },

  updateInfo({ commit, dispatch, state }, info?: string): void {
    commit("SET_CURRENT_INFO", info);
    const { mediaSession } = navigator;

    if (mediaSession !== undefined) {
      const currentStation = state.memory.lastStation as Station;

      mediaSession.metadata = new MediaMetadata({
        title: info ?? currentStation.name,
        artist: info ? currentStation.name : undefined,
        album: process.env.VUE_APP_TITLE,
      });
    }

    if (info !== undefined) {
      dispatch("addHistoryItem", info);
    }
  },

  addHistoryItem({ commit, state }, info: string): void {
    const history = [...state.memory.titles.history];
    const currentStation = state.memory.lastStation as Station;

    history.forEach((item, index) => {
      if (item.station === currentStation.name && item.info === info) {
        history.splice(index, 1);
      }
    });

    if (history.length === 5) {
      history.splice(0, 1);
    }

    history.push({
      station: currentStation.name,
      info,
      time: Math.floor(Number(new Date()) / 60),
    });

    commit("SET_HISTORY", history);
  },

  adjustVolume({ commit, state }, step: number): void {
    const absoluteVolume = Math.min(Math.max(state.volume + step, 0), 1);
    const roundedVolume = Math.round(absoluteVolume * 100) / 100;

    if (state.volume !== roundedVolume) {
      commit("SET_VOLUME", roundedVolume);
    }
  },

  changeVolume({ commit }, volume: number): void {
    commit("SET_VOLUME", volume);
  },

  play({ commit, dispatch, state }, station?: Station): void {
    if (source) {
      source.cancel();
      source = network.CancelToken.source();
    }

    if (updateTimer) {
      clearTimeout(updateTimer);
    }

    dispatch("setPlaying", false);
    const active = station !== undefined;

    if (active) {
      if (state.fullscreen) {
        dispatch("toggleFullscreen");
      }

      commit("SET_LAST_STATION", station);
    } else if (state.relaxed) {
      commit("SET_RELAXED", false);
    }

    if (active !== state.active) {
      commit("SET_ACTIVE", active);
    }

    if (state.currentInfo !== undefined) {
      dispatch("updateInfo", undefined);
    }
  },

  confirmPlaying({ dispatch }, url: string): void {
    dispatch("setPlaying", true);
    dispatch("requestInfo", url);
  },

  async requestInfo({ dispatch, state }, url: string): Promise<void> {
    let cancelled = false;

    try {
      const nowPlayingInfo = await fetchNowPlayingInfo({
        url,
        cancelToken: source.token,
      });

      let info = nowPlayingInfo.title;

      if (info) {
        if (info === "-") {
          info = "";
        }

        const delimiter = " - ";
        const cutStrings = info.split(delimiter);

        if (cutStrings.length >= 2) {
          info = [
            cutStrings
              .slice(0, 2)
              .reverse()
              .join(" / "),
            ...cutStrings.slice(2),
          ].join(delimiter);
        }
      } else {
        const description = nowPlayingInfo.description;

        if (description !== "Unspecified description") {
          info = description;
        }
      }

      if (info && state.currentInfo !== info) {
        dispatch("updateInfo", info);
      }
    } catch (error) {
      if (network.isCancel(error)) {
        cancelled = true;
      }
    } finally {
      if (!cancelled) {
        updateTimer = setTimeout(() => {
          dispatch("requestInfo", url);
        }, 10000);
      }
    }
  },

  setSleepTimer({ dispatch, state }): void {
    const { settings } = state.memory;

    if (settings.sleep) {
      const minutes = settings.sleepTimeout;

      sleepTimer = setTimeout(() => {
        dispatch("stop");

        dispatch("showMessage", {
          type: ModalType.INFO,
          title: "Sleep timer",
          message: `${minutes.toLocaleString(
            settings.language
          )} minutes are over. The stream has been stopped.`,
        });
      }, minutes * 60000);
    }
  },

  setRelaxTimer({ state, commit }): void {
    if (state.relaxed) {
      commit("SET_RELAXED", false);
    }

    if (relaxTimer) {
      clearTimeout(relaxTimer);
    }

    const { settings } = state.memory;

    if (settings.relax && !state.hasVideo) {
      const seconds = settings.relaxTimeout;

      relaxTimer = setTimeout(() => {
        commit("SET_RELAXED", true);
      }, seconds * 1000);
    }
  },

  handleBufferWaiting({ commit }, waiting: boolean): void {
    commit("SET_BUFFER_FINE", !waiting);
  },

  setPlaying({ commit, dispatch, state }, playing: boolean): void {
    if (state.playing !== playing) {
      commit("SET_PLAYING", playing);
    }

    if (sleepTimer) {
      clearTimeout(sleepTimer);
    }

    if (relaxTimer) {
      clearTimeout(relaxTimer);
    }

    if (playing) {
      dispatch("setSleepTimer");
      dispatch("setRelaxTimer");
    }
  },

  allowFullscreen({ commit }, allow): void {
    commit("SET_HAS_VIDEO", allow);
  },

  addBookmark(
    { commit, state },
    { station, info }: { station: string; info: string }
  ): void {
    commit("PUSH_BOOKMARK", {
      station,
      info,
      time: Math.floor(Number(new Date()) / 60),
    });

    const { undoableEvent } = state;

    if (
      undoableEvent !== undefined &&
      undoableEvent.kind === ChangeKinds.BOOKMARK
    ) {
      const [originalInfo, originalStation] = undoableEvent.affected;

      if (station === originalStation && info === originalInfo) {
        commit("SET_UNDOABLE_EVENT", undefined);
      }
    }
  },

  removeBookmark({ commit, state }, index: number): void {
    const backup = [...state.memory.titles.favorites];
    const { station, info } = backup[index];

    commit("SET_UNDOABLE_EVENT", {
      kind: ChangeKinds.BOOKMARK,
      affected: [info, station],
      undo() {
        commit("SET_BOOKMARKS", backup);
      },
    });

    commit("REMOVE_BOOKMARK", index);
  },

  toggleBookmark(
    { dispatch, state },
    { station, info }: { station: string; info: string }
  ): boolean {
    const titleIndex = state.memory.titles.favorites.findIndex(
      item => item.station === station && item.info === info
    );

    const notExisting = titleIndex === -1;

    if (notExisting) {
      dispatch("addBookmark", { station, info });
    } else {
      dispatch("removeBookmark", titleIndex);
    }

    return notExisting;
  },

  async loadStyle({ state, commit, dispatch }): Promise<void> {
    const { theme } = state.memory.settings;
    const colorScheme = state.darkMode ? "dark" : "light";
    const styleSheetName = theme + "-" + colorScheme;

    try {
      const styleSheet = await fetchTheme(styleSheetName);
      let themeElement = document.querySelector("#themeStyle");

      if (themeElement === null) {
        themeElement = document.createElement("style");
        themeElement.id = "themeStyle";
        const head = document.querySelector("head") as HTMLHeadElement;
        head.appendChild(themeElement);
      }

      themeElement.innerHTML = styleSheet;

      if (!state.ready) {
        commit("SET_READY");
      }
    } catch {
      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });

      return dispatch("loadStyle");
    }
  },

  likeStation({ state, getters, commit }, id: string): void {
    commit("SET_LIKE_STATE", {
      id,
      promise: (async () => {
        if (getters.likes.includes(id)) {
          throw true;
        } else {
          try {
            const voteResult = await voteForStation(id);

            if (voteResult.ok || voteResult.message.includes("too often")) {
              commit("SET_CACHE_ITEM", {
                [id]: { ...state.memory.cache[id], liked: true },
              });
            }

            return voteResult;
          } catch {
            throw false;
          }
        }
      })(),
    });
  },

  async fetchLikeCount({ state, commit }, id?: string): Promise<number> {
    if (id === undefined) {
      const station = state.memory.lastStation as Station;
      id = station.id;
    }

    const oldLikeCount = state.memory.cache[id]?.likeCount;

    try {
      const votes = await fetchVoteNumber(id);

      if (votes !== oldLikeCount) {
        commit("SET_CACHE_ITEM", {
          [id]: { ...state.memory.cache[id], likeCount: votes },
        });
      }

      return votes;
    } catch {
      if (oldLikeCount !== undefined) {
        return oldLikeCount;
      }

      throw new Error("Unable to fetch number of likes.");
    }
  },

  async showMessage({ commit }, options: ModalOptions): Promise<number> {
    const buttonId = await new Promise((resolve: (id: number) => void) => {
      const defaultOptions = {
        type: ModalType.NONE,
        buttons: ["OK"],
        title: "",
        message: "",
        closeable: true,
        handleButtonClicked: resolve,
      };

      commit("PUSH_MESSAGE", { ...defaultOptions, ...options });
    });

    commit("SHIFT_MESSAGES");
    return buttonId;
  },

  showHint({ commit }, hint: Hint): void {
    if (hintTimer) {
      clearTimeout(hintTimer);
    }

    hintTimer = setTimeout(() => {
      commit("SET_HINT", null);
    }, 5000);

    commit("SET_HINT", hint);
  },
};

export default actions;
