<template>
  <div class="inline-block px-1.25 text-lg" @wheel.prevent="handleScroll">
    <a @click="setValue(value - 0.1)"><slot name="minusIcon"></slot></a>
    {{ " " }}
    <div
      ref="slider"
      class="mx-1.25 inline-flex h-[9px] w-25 align-[2px]"
      @mousedown.left="handleMouseDown"
      @touchstart.prevent="handleTouchStart"
    >
      <div class="h-full bg-current opacity-70" :style="{ width: `${value * 100}%` }"></div>
      <div class="grow bg-mute"></div>
    </div>
    {{ " " }}
    <a @click="setValue(value + 0.1)"><slot name="plusIcon"></slot></a>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Model, Ref, Vue } from "vue-property-decorator";

@Component
export default class RadSlider extends Vue {
  @Model("update", { type: Number, required: true }) readonly value!: number;

  @Ref() readonly slider!: HTMLDivElement;

  resetHandlers(): void {
    document.removeEventListener("mousemove", this.handleMouseEvent);
    document.removeEventListener("mouseup", this.resetHandlers);
    document.removeEventListener("touchmove", this.handleTouchEvent);
    document.removeEventListener("touchend", this.resetHandlers);
  }

  handleTouchEvent({ changedTouches }: TouchEvent): void {
    this.handleUIUpdate(changedTouches[0].pageX);
  }

  handleMouseEvent({ pageX }: MouseEvent): void {
    this.handleUIUpdate(pageX);
  }

  @Emit("update")
  emitUpdate(value: number): void {}

  addResetListeners(): void {
    document.addEventListener("mouseup", this.resetHandlers);
    document.addEventListener("touchend", this.resetHandlers);
  }

  handleTouchStart(event: TouchEvent): void {
    this.handleTouchEvent(event);
    document.addEventListener("touchmove", this.handleTouchEvent);
    this.addResetListeners();
  }

  handleMouseDown(event: MouseEvent): void {
    this.handleMouseEvent(event);
    document.addEventListener("mousemove", this.handleMouseEvent);
    this.addResetListeners();
  }

  handleScroll({ deltaY }: WheelEvent): void {
    this.setValue(this.value + 0.1 * Math.sign(-deltaY));
  }

  handleUIUpdate(x: number): void {
    const { left, width } = this.slider.getBoundingClientRect();
    this.setValue((x - left) / width);
  }

  setValue(dragValue: number): void {
    const value = Math.round(Math.min(Math.max(dragValue, 0), 1) * 100) / 100;

    if (this.value !== value) {
      this.emitUpdate(value);
    }
  }
}
</script>
