import { supabase } from '../services/supabaseClient'

class UploadForm extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  connectedCallback() {
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement
    const previewImg = this.shadowRoot?.querySelector('img') as HTMLImageElement
    const previewVideo = this.shadowRoot?.querySelector('video') as HTMLVideoElement
    const form = this.shadowRoot?.querySelector('form') as HTMLFormElement
    const progress = this.shadowRoot?.querySelector('progress') as HTMLProgressElement

    input?.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Solo se permiten imágenes o videos.')
        return
      }

      if (file.type.startsWith('image/')) {
        previewImg.src = URL.createObjectURL(file)
        previewImg.style.display = 'block'
        previewVideo.style.display = 'none'
      } else {
        previewVideo.src = URL.createObjectURL(file)
        previewVideo.style.display = 'block'
        previewImg.style.display = 'none'
      }
    })

    form?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const file = input.files?.[0]
      if (!file) return

      const filePath = `${Date.now()}-${file.name}`
      progress.value = 0

      const { data, error } = await supabase.storage
        .from('memes')
        .upload(filePath, file)

      if (error) {
        alert('Error al subir: ' + error.message)
      } else {
        alert('se subió el meme q bendición 🙏')
        input.value = ''
        previewImg.src = ''
        previewImg.style.display = 'none'
        previewVideo.src = ''
        previewVideo.style.display = 'none'
        progress.value = 0
      }
    })
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        img, video {
          max-width: 300px;
          display: none;
        }
        video {
          autoplay: true;
          muted: true;
          loop: true;
        }
      </style>
      <form>
        <input type="file" accept="image/*,video/*" required />
        <img />
        <video></video>
        <progress value="0" max="100"></progress>
        <button type="submit">Subir Meme</button>
      </form>
    `
  }
}

customElements.define('upload-form', UploadForm)
