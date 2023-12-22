<template>
  <div
    ref="container"
    class="pointer-events-auto absolute flex h-full w-full items-center justify-center bg-black/50 transition"
    @click="close()"
  >
    <div
      role="dialog"
      :aria-label="`${title}: ${options.message}`"
      class="m-2.5 w-[640px] rounded-br rounded-tl bg-surface text-on-surface shadow-[0_25px_50px_-12px] shadow-white/20 dark:shadow-black/20"
      @click.stop
    >
      <div class="relative">
        <div class="px-8 pt-8">
          <div :class="['absolute right-6.5 top-6.5', { hidden: !options.closeable }]">
            <button class="ring-inset ring-accent focus-visible:ring-2" @click="close()">
              <FasTimes class="w-fixed text-icon-lg" />
            </button>
          </div>
          <div class="mb-5 text-xl font-bold">
            {{ title }}
          </div>
          <div class="flex leading-normal">
            <div v-if="icon" class="pr-1.25">
              <component :is="icon" class="opacity-70" />
            </div>
            <div>
              <template v-for="(line, index) in options.message.split('\n')">
                {{ line }}<br :key="index" />
              </template>
            </div>
          </div>
        </div>
        <div class="flex justify-end px-5 py-7">
          <RadButton
            v-for="(button, i) in options.buttons"
            :key="button"
            @click="options.handleButtonClicked(i)"
          >
            <FasBan v-if="isNegativeButton(button)" /><FasCheck v-if="isPositiveButton(button)" />
            {{ button }}
          </RadButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ModalType, type ModalOptions } from "@/store";
import { Component, Prop, Ref, Vue } from "vue-property-decorator";
import { createFocusTrap } from "focus-trap";
import type { FocusTrap } from "focus-trap";

import FasExclamationCircle from "~icons/fa-solid/exclamation-circle";
import FasQuestionCircle from "~icons/fa-solid/question-circle";
import FasExclamationTriangle from "~icons/fa-solid/exclamation-triangle";
import FasInfoCircle from "~icons/fa-solid/info-circle";

let focusTrap: FocusTrap;

@Component
export default class RadModal extends Vue {
  @Prop({ required: true, type: Object }) readonly options!: Required<ModalOptions>;

  @Ref() readonly container!: HTMLElement;

  get title(): string {
    return this.options.title || (this.$t("general.note") as string);
  }

  get icon(): any {
    switch (this.options?.type) {
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

  mounted() {
    focusTrap = createFocusTrap(this.container, {
      escapeDeactivates: false,
    });
    focusTrap.activate();
  }

  beforeDestroy() {
    focusTrap.deactivate();
  }

  isPositiveButton(button: string): boolean {
    return [this.$t("general.ok"), this.$t("general.yes")].includes(button);
  }

  isNegativeButton(button: string): boolean {
    return [this.$t("general.cancel"), this.$t("general.no")].includes(button);
  }

  close(): void {
    if (this.options !== undefined && this.options.closeable) {
      this.options.handleButtonClicked(-1);
    }
  }
}
</script>
