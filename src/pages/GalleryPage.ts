import '../components/UploadForm'
import '../components/MemeGallery'

export class GalleryPage extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <upload-form></upload-form>
      <meme-gallery></meme-gallery>
    `
  }
}

customElements.define('gallery-page', GalleryPage)
