<script setup>
import { onUnmounted, ref } from 'vue'
import { nowPlaying } from './metadata.js'

const title = ref()

const subscription = nowPlaying.subscribe((info) => {
  if (info.error) {
    window.alert(`Error captured with reason: ${info.error}`)
  }
  title.value = info.title
})

onUnmounted(() => subscription.unsubscribe())
</script>

<template>
  <main class="container">
    <h1>Radiolise API Demo</h1>
    <form
      v-on:submit.prevent="
        nowPlaying.trackStream($event.target.streamUrl.value)
      "
    >
      <label>
        Stream URL:
        <input
          type="text"
          name="streamUrl"
          placeholder="Stream URL"
          required
          value="https://liveradio.swr.de/sw282p3/swr3/play.mp3"
        />
      </label>
      <button type="submit">Track stream</button>
    </form>
    <p>
      <small>The server will push title updates via WebSockets.</small>
    </p>
    <p v-if="title">Current title: {{ title }}</p>
  </main>
</template>
