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
            'drawer z-20 h-full w-full max-w-sidebar overflow-y-auto overflow-x-hidden overscroll-contain bg-surface text-on-surface shadow-theme backdrop-blur transition-all',
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
          class="toast mx-auto w-[340px] max-w-full rounded-bl rounded-tr bg-surface p-5 text-on-surface"
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
      <RadModal v-if="modalOptions" :key="animationTrigger" :options="modalOptions" />
    </transition>
  </div>
</template>

<script lang="ts">
import type { Component as IComponent } from "vue";
import { Component, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import type { ModalOptions } from "@/store";

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

  @Watch("modalOptions.message")
  async onModalOptionsChanged() {
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
}
</script>
