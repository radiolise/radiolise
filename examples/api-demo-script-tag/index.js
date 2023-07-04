const nowPlaying = RadioliseMetadata.createMetadataClient({
  url: 'wss://backend.radiolise.com/api/data-service',
})

const subscriptionForm = document.querySelector('#subscription-form')
const titleElement = document.querySelector('#title')

subscriptionForm.addEventListener('submit', (event) => {
  event.preventDefault()
  nowPlaying.trackStream(event.target.streamUrl.value)
})

function renderTitle(value) {
  titleElement.textContent = value
}

nowPlaying.subscribe((info) => {
  if (info.error) {
    window.alert(`Error captured with reason: ${info.error}`)
  }
  renderTitle(info.title)
})
