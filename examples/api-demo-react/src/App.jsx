import { useEffect, useState } from 'react'
import { nowPlaying } from './metadata.js'

export function App() {
  const [title, setTitle] = useState()

  useEffect(() => {
    const subscription = nowPlaying.subscribe((info) => {
      if (info.error) {
        window.alert(`Error captured with reason: ${info.error}`)
      }
      setTitle(info.title)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
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
            defaultValue="https://liveradio.swr.de/sw282p3/swr3/play.mp3"
          />
        </label>
        <button type="submit">Track stream</button>
      </form>
      <p>
        <small>The server will push title updates via WebSockets.</small>
      </p>
      {title && <p>Current title: {title}</p>}
    </>
  )
}
