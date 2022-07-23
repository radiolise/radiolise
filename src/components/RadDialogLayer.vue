<template>
  <div
    :class="[
      'fixed left-0 top-0 z-20 flex h-full w-full flex-col transition',
      {
        'bg-black/50 lg:pointer-events-none lg:bg-transparent': currentDialog,
        'pointer-events-none': !currentDialog || relaxed,
        'opacity-0': relaxed,
      },
    ]"
  >
    <RadLink v-slot="{ navigate }" :to="null">
      <div class="h-full overflow-hidden" @click="navigate">
        <div
          :class="[
            'drawer z-20 h-full w-full max-w-sidebar overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth bg-surface text-on-surface shadow-theme backdrop-blur transition-all',
            currentDialog
              ? { 'pointer-events-auto': !relaxed }
              : 'invisible -translate-x-[200px] opacity-0',
          ]"
          @click.stop
        >
          <transition
            enter-class="-translate-x-12.5 opacity-0"
            leave-to-class="-translate-x-12.5 opacity-0"
            mode="out-in"
          >
            <keep-alive
              :exclude="[
                'RadEditor',
                'RadImportWizard',
                'RadListManager',
                'RadSettings',
                'RadTitleManager',
              ]"
            >
              <component
                :is="currentView"
                v-if="currentDialog"
                :key="viewIndex"
                v-bind="dialogProps"
              />
            </keep-alive>
          </transition>
        </div>
      </div>
    </RadLink>
    <RadBanner />
    <transition enter-class="opacity-0" leave-to-class="opacity-0">
      <div
        v-if="toast"
        :class="[
          'pointer-events-none absolute z-20 mx-auto mt-12.5 w-full overflow-hidden px-1.25 text-center transition',
          { 'scale-150': fullscreen },
        ]"
      >
        <div
          class="toast mx-auto w-[340px] max-w-full rounded-tr rounded-bl bg-surface p-5 text-on-surface"
        >
          <component :is="toast.icon" v-if="toast.icon" class="w-fixed" />
          {{ toast.message }}
        </div>
      </div>
    </transition>
    <transition
      enter-class="scale-125 opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="ease-out"
      leave-active-class="duration-200"
    >
      <div
        v-if="modalOptions"
        :key="animationTrigger"
        class="pointer-events-auto absolute flex h-full w-full items-center justify-center bg-black/50 transition"
        @click="closeModal()"
      >
        <div
          class="m-2.5 w-[640px] rounded-tl rounded-br bg-surface text-on-surface shadow-[0_25px_50px_-12px] shadow-white/20 dark:shadow-black/20"
          @click.stop
        >
          <div class="relative">
            <div class="px-8 pt-8">
              <div :class="['absolute right-6.5 top-6.5', { hidden: !modalOptions.closeable }]">
                <a @click="closeModal()"><FasTimes class="w-fixed text-icon-lg" /></a>
              </div>
              <div class="mb-5 text-xl font-bold">
                {{ modalTitle }}
              </div>
              <div class="flex leading-normal">
                <div v-if="modalIcon" class="pr-1.25">
                  <component :is="modalIcon" class="opacity-70" />
                </div>
                <div>
                  <template v-for="(line, index) in modalOptions.message.split('\n')">
                    {{ line }}<br :key="index" />
                  </template>
                </div>
              </div>
            </div>
            <div class="flex flex-row-reverse px-5 py-7">
              <RadButton
                v-for="(button, i) in modalOptions.buttons"
                :key="button"
                @click="modalOptions?.handleButtonClicked(i)"
              >
                <FasBan v-if="isNegativeButton(button)" /><FasCheck
                  v-if="isPositiveButton(button)"
                />
                {{ button }}
              </RadButton>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import type { Component as IComponent } from "vue";
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import FasExclamationCircle from "~icons/fa-solid/exclamation-circle";
import FasQuestionCircle from "~icons/fa-solid/question-circle";
import FasExclamationTriangle from "~icons/fa-solid/exclamation-triangle";
import FasInfoCircle from "~icons/fa-solid/info-circle";

import { type ModalOptions, ModalType } from "@/store";

import RadAbout from "@/views/RadAbout.vue";
import RadEditor from "@/views/RadEditor.vue";
import RadHotkeyReference from "@/views/RadHotkeyReference.vue";
import RadImportWizard from "@/views/RadImportWizard.vue";
import RadListManager from "@/views/RadListManager.vue";
import RadMenu from "@/views/RadMenu.vue";
import RadSearch from "@/views/RadSearch.vue";
import RadSettings from "@/views/RadSettings.vue";
import RadTitleManager from "@/views/RadTitleManager.vue";

@Component
export default class RadDialogLayer extends Vue {
  animationTrigger = 0;
  viewIndex = 0;
  currentView: IComponent | null = null;

  static get views(): Record<string, IComponent> {
    return {
      "about": RadAbout,
      "editor": RadEditor,
      "hotkeys": RadHotkeyReference,
      "import-wizard": RadImportWizard,
      "list-manager": RadListManager,
      "menu": RadMenu,
      "search": RadSearch,
      "settings": RadSettings,
      "title-manager": RadTitleManager,
    };
  }

  @State readonly currentDialog!: DialogState | null;
  @State readonly relaxed!: boolean;
  @State readonly toast!: Toast | null;

  @Getter readonly fullscreen!: boolean;
  @Getter readonly modalOptions: Required<ModalOptions> | undefined;

  @Action updateDialog!: (dialog: DialogState | null) => void;

  created() {
    window.addEventListener("popstate", this.syncHistoryStack);

    if (window.history.state !== null) {
      this.syncHistoryStack();
    }
  }

  get dialogProps() {
    return this.currentDialog?.props;
  }

  get modalTitle(): string {
    return this.modalOptions?.title || (this.$t("general.note") as string);
  }

  get modalIcon(): any {
    switch (this.modalOptions?.type) {
      case ModalType.ERROR:
        return FasExclamationCircle;
      case ModalType.QUESTION:
        return FasQuestionCircle;
      case ModalType.WARNING:
        return FasExclamationTriangle;
      case ModalType.INFO:
        return FasInfoCircle;
      default:
        return false;
    }
  }

  @Watch("modalOptions.message")
  onModalOptionsChanged(): void {
    this.animationTrigger = 1 - this.animationTrigger;
  }

  @Watch("currentDialog")
  onDialogChanged(dialog: DialogState | null) {
    if (dialog !== null) {
      this.currentView = RadDialogLayer.views[dialog.viewId];
    }
    this.viewIndex++;
  }

  syncHistoryStack() {
    this.updateDialog(window.history.state);
  }

  isPositiveButton(button: string): boolean {
    return [this.$t("general.ok"), this.$t("general.yes")].includes(button);
  }

  isNegativeButton(button: string): boolean {
    return [this.$t("general.cancel"), this.$t("general.no")].includes(button);
  }

  closeModal(): void {
    if (this.modalOptions !== undefined && this.modalOptions.closeable) {
      this.modalOptions.handleButtonClicked(0);
    }
  }
}
</script>
