import { supabase } from '../services/supabaseClient'

class UploadForm extends HTMLElement {
  private currentObjectURL: string | null = null;

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
    const loader = this.shadowRoot?.querySelector('.loader') as HTMLDivElement
    const submitButton = this.shadowRoot?.querySelector('button[type="submit"]') as HTMLButtonElement

    input?.addEventListener('change', () => {
      const file = input.files?.[0]

      if (this.currentObjectURL) {
        URL.revokeObjectURL(this.currentObjectURL);
        this.currentObjectURL = null;
      }

      if (!file) return
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Sólo se pueden imágenes o videos compa😔')
        return
      }

      if (file.type.startsWith('image/')) {
        this.currentObjectURL = URL.createObjectURL(file);
        previewImg.src = this.currentObjectURL;
        previewImg.style.display = 'block'
        previewVideo.style.display = 'none'
      } else {
        this.currentObjectURL = URL.createObjectURL(file);
        previewVideo.src = this.currentObjectURL;
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
      loader.style.display = 'block'
      if (submitButton) submitButton.disabled = true;

      try {
        const { data, error } = await supabase.storage
          .from('memes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            // supabase-js v2.x.x upload method does not have onUploadProgress directly in options.
            // For progress, you would typically use XHR events if constructing the request manually,
            // or check if a newer version of the client offers a more direct way.
            // For now, we'll keep the progress bar but not update it dynamically from supabase.upload directly.
          })

        loader.style.display = 'none'
        if (submitButton) submitButton.disabled = false;

        if (error) {
          alert('Error al subir: ' + error.message)
        } else {
          alert('Tu meme está posteado k pro 😎')
          // Incluimos el filePath en el detalle del evento
          const eventDetail = { detail: { filePath: filePath } };
          document.dispatchEvent(new CustomEvent('memeUploaded', eventDetail));

          input.value = '' // Reset file input
          if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
            this.currentObjectURL = null;
          }
          previewImg.src = ''
          previewImg.style.display = 'none'
          previewVideo.src = ''
          previewVideo.style.display = 'none'
          progress.value = 0
        }
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        alert('Error catastrófico al subir el archivo.');
        loader.style.display = 'none';
        if (submitButton) submitButton.disabled = false;
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
        .loader {
          display: none;
          width: 32px;
          height: 32px;
          border: 4px solid #ccc;
          border-top-color: #333;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          align-self: center;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <form>
        <input type="file" accept="image/*,video/*" required />
        <img />
        <video></video>
        <progress value="0" max="100"></progress>
        <div class="loader"></div>
        <button type="submit">Subir Meme</button>
      </form>
    `
  }
}

customElements.define('upload-form', UploadForm)
