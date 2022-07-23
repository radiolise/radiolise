<template>
  <RadDrawer>
    <h3>
      <FasKeyboard class="w-fixed" />
      {{ $t("hotkeys.title") }}
    </h3>
    <div class="text-left">
      <div v-for="key in bindingAliases" :key="key" class="flex">
        <div class="py-2 px-2.5 text-center text-xl">
          <div class="mt-1.25 flex h-8.75 w-10 rounded-[5px] bg-soft">
            <span class="m-auto">{{ key }}</span>
          </div>
          <span v-if="key === ' '" class="text-xs">{{ $t("hotkeys.space") }}</span>
        </div>
        <div class="py-2.5 pr-2.5">
          <div class="mb-1.25 text-xl">
            {{ $t(`hotkeys.bindings.${key}.name`) }}
          </div>
          <div class="description">
            {{ $t(`hotkeys.bindings.${key}.description`) }}
          </div>
        </div>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import KEY_BINDINGS from "@/common/hotkeys";

@Component
export default class RadHotkeyReference extends Vue {
  get bindingAliases(): string[] {
    return Object.values(KEY_BINDINGS).map((keybinding) => keybinding.alias);
  }
}
</script>
