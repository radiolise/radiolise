<template>
  <div class="flex justify-center">
    <div
      class="mb-[40px] w-full max-w-[440px] rounded bg-soft px-5 py-2.5 text-center shadow-sm shadow-black/25"
    >
      <RadHappyBird />
      <h3 class="mb-0 pt-1">
        {{ $t("general.listEmpty[0]") }}
      </h3>
      <div class="py-2.5 icons:w-fixed">
        <RadLink v-slot="{ active, navigate }" to="search" toggle>
          <RadButton font-size-class="text-lg" :active="active" @click="navigate">
            <FasSearch />
            {{ $t("general.findStations") }}
          </RadButton>
        </RadLink>
        <RadLink v-slot="{ active, navigate }" to="import-wizard" :props="{ type: 'list' }" toggle>
          <RadButton font-size-class="text-lg" :active="active" @click="navigate">
            <FasFileImport />
            {{ $t("general.importBackup") }}
          </RadButton>
        </RadLink>
      </div>
    </div>
  </div>
</template>
