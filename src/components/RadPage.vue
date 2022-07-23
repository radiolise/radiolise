<template>
  <div
    :class="[
      'offset-horizontal relative z-10 flex transition-opacity',
      relaxed ? 'opacity-0' : { 'opacity-50 lg:opacity-100': dialog },
    ]"
  >
    <nav
      :class="[
        'action-bar offset-horizontal fixed top-0 left-0 z-20 flex w-full bg-surface text-on-surface shadow-theme mobile:shadow-none',
        {
          'z-40 shadow-none transition-transform duration-500': fullscreen,
          'mobile:border-b-0': !hasVideo,
          '-translate-y-full': !navbarShown,
          'border-b': !stickyPlayer,
        },
      ]"
    >
      <div class="max-w-230 flex-1 px-15 mobile:px-2.5">
        <RadLink v-slot="{ navigate }" to="menu" toggle>
          <div
            class="group absolute cursor-pointer whitespace-nowrap px-1 py-2.5 text-[22px]"
            @click="navigate"
          >
            <RadLogo /><span class="align-middle">{{ appTitle }}</span>
          </div>
        </RadLink>
        <div class="float-right whitespace-nowrap">
          <RadLink v-slot="{ active, navigate }" to="search" toggle>
            <RadMenuButton
              :aria-label="$t('general.findStations')"
              :active="active"
              @click="navigate"
            >
              <FasSearch /><span :class="['hidden md:inline', { 'lg:hidden xl:inline': dialog }]">
                {{ $t("general.findStations") }}</span
              >
            </RadMenuButton>
          </RadLink>
          <RadLink v-slot="{ active, navigate }" to="settings" toggle>
            <RadMenuButton :aria-label="$t('general.settings')" :active="active" @click="navigate">
              <FasCog /><span :class="['hidden md:inline', { 'lg:hidden xl:inline': dialog }]">
                {{ $t("general.settings") }}</span
              >
            </RadMenuButton>
          </RadLink>
          <RadLink v-slot="{ active, navigate }" to="menu" toggle>
            <RadMenuButton :aria-label="$t('general.more')" :active="active" @click="navigate">
              <FasBars /><span :class="['hidden md:inline', { 'lg:hidden xl:inline': dialog }]">
                {{ $t("general.more") }}</span
              >
            </RadMenuButton>
          </RadLink>
        </div>
      </div>
    </nav>
    <div
      :class="[
        'max-w-230 flex-1 px-12.5 transition-all mobile:px-0',
        { 'mobile:mt-12.5': !fullscreen },
      ]"
    >
      <main
        :class="[
          'main rounded-tl rounded-br bg-surface text-on-surface mobile:rounded-none mobile:shadow-none',
          {
            'mt-25 mb-12.5 border-b shadow-theme mobile:m-0 mobile:border-0': !fullscreen,
            'border-t': !hasVideo,
            'overflow-hidden': !stickyPlayer,
          },
        ]"
      >
        <RadPlayer />
        <div :class="['px-5 pb-5 transition-[padding] sm:px-15', { 'mt-[100vh]': fullscreen }]">
          <div :class="['text-left', { 'pt-10': fullscreen }]">
            <RadListMenu />
            <RadEmptyList v-if="listEmpty" />
            <RadStationList v-else />
          </div>
          <p v-if="!listEmpty" class="my-4 py-5 text-right">
            <RadLink v-slot="{ active, navigate }" to="search" toggle>
              <RadButton :active="active" @click="navigate">
                <FasSearch class="w-fixed" />{{ $t("general.findStations") }}
              </RadButton>
            </RadLink>
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

@Component
export default class RadPage extends Vue {
  appTitle = __APP_TITLE__;
  provideMediaSession = false;

  @State readonly currentDialog!: DialogState | null;
  @State readonly navbarShown!: boolean;
  @State readonly relaxed!: boolean;

  @Getter readonly currentStation: Station | undefined;
  @Getter readonly currentList!: Station[];
  @Getter readonly fullscreen!: boolean;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly stickyPlayer!: boolean;

  @Action playClosestStation!: (forward: boolean) => Promise<void>;

  @Watch("currentList")
  handleListChanged(): void {
    this.setSwitchButtons();
  }

  @Watch("currentStation", { immediate: true })
  handleStationChanged(station?: Station, oldStation?: Station): void {
    const titlePrefix = station !== undefined ? `${station.name} - ` : "";
    document.title = titlePrefix + this.appTitle;

    if (station === undefined || oldStation === undefined) {
      this.setSwitchButtons();
    }
  }

  get dialog() {
    return this.currentDialog !== null;
  }

  get listEmpty(): boolean {
    return this.currentList.length === 0;
  }

  setSwitchButtons(): void {
    const { mediaSession } = navigator;

    if (mediaSession === undefined) {
      return;
    }

    const { currentStation } = this;

    const provideHandlers =
      currentStation !== undefined &&
      this.currentList.length >= 2 &&
      this.currentList.some((station) => station.id === currentStation.id);

    if (this.provideMediaSession === provideHandlers) {
      return;
    }

    this.provideMediaSession = provideHandlers;

    mediaSession.setActionHandler(
      "previoustrack",
      provideHandlers ? () => this.playClosestStation(false) : null
    );

    mediaSession.setActionHandler(
      "nexttrack",
      provideHandlers ? () => this.playClosestStation(true) : null
    );
  }
}
</script>
