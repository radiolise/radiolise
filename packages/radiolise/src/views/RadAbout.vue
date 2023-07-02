<template>
  <RadDrawer>
    <br />
    <div
      @mouseenter="versionShown = true"
      @mouseleave="versionShown = false"
      @touchstart="versionShown = !versionShown"
    >
      <div class="mb-2.5">
        <img
          class="mr-1.25 inline h-12.5 align-middle"
          src="@/assets/img/logo.svg"
          alt="Logo"
        /><span class="ml-1.25 align-middle text-3xl">{{ appTitle }}</span>
      </div>
      <div v-show-slide="versionShown">
        <span :class="['text-on-surface/50 transition-opacity', { 'opacity-0': !versionShown }]"
          ><FasCodeBranch /> {{ version }}</span
        >
      </div>
    </div>
    <br />
    <p class="my-4 py-2.5">{{ copyright }}</p>
    <i18n class="my-4 py-2.5 text-left leading-6" path="about.licenseInfo" tag="p">
      {{ appTitle }}
      <a href="https://fsfe.org/freesoftware/" target="_blank" rel="noopener"
        >{{ $t("about.freeSoftware") }}<FasExternalLinkAlt class="w-fixed"
      /></a>
    </i18n>
    <p class="my-4 py-2.5 text-left leading-6">
      {{ $t("about.noWarranty", [appTitle]) }}
    </p>
    <i18n class="my-4 py-2.5 text-left leading-6" path="about.licenseCopy" tag="p">
      {{ appTitle
      }}<a href="http://www.gnu.org/licenses/" target="_blank" rel="noopener"
        >http://www.gnu.org/licenses/<FasExternalLinkAlt class="w-fixed"
      /></a>
    </i18n>
    <p class="my-4 py-5">
      <RadButton :href="repoUrl" target="_blank" rel="noopener">
        <FabGitlab class="w-fixed" />
        {{ $t("about.code") }}
        <FasExternalLinkAlt class="w-fixed" />
      </RadButton>
      <RadButton :href="issuesUrl" target="_blank" rel="noopener">
        <FasComments class="w-fixed" />
        {{ $t("about.issues") }}
        <FasExternalLinkAlt class="w-fixed" />
      </RadButton>
    </p>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class RadAbout extends Vue {
  appTitle = __APP_TITLE__;
  version = __APP_VERSION__;
  copyright = __APP_COPYRIGHT__;
  repoUrl = __APP_REPO__;
  issuesUrl = __APP_ISSUES__;
  versionShown = false;
}
</script>
