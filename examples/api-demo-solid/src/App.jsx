import { createSignal, onCleanup } from 'solid-js'
import { nowPlaying } from './metadata.js'

export function App() {
  const [getTitle, setTitle] = createSignal()

  const subscription = nowPlaying.subscribe((info) => {
    if (info.error) {
      window.alert(`Error captured with reason: ${info.error}`)
    }
    setTitle(info.title)
  })

  onCleanup(() => subscription.unsubscribe())

  return (
    <main class="container">
      <h1>Radiolise API Demo</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault()
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
      {getTitle() && <p>Current title: {getTitle()}</p>}
    </main>
  )
}
