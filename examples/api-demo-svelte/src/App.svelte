<script>
  import { nowPlaying } from './metadata.js'

  $: title = extractTitle(/* Auto-subscribe */ $nowPlaying)

  function extractTitle(info) {
    if (info.error) {
      window.alert(`Error captured with reason: ${info.error}`)
    }
    return info.title
  }

  // Svelte is smart enough to call `unsubscribe()` automatically on destroy.
</script>

<main class="container">
  <h1>Radiolise API Demo</h1>
  <form
    on:submit|preventDefault={(event) => {
      nowPlaying.trackStream(event.target.streamUrl.value)
    }}
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
  {#if title}
    <p>Current title: {title}</p>
  {/if}
</main>
