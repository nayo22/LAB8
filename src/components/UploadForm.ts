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

          })

        loader.style.display = 'none'
        if (submitButton) submitButton.disabled = false;

        if (error) {
          alert('Error al subir: ' + error.message)
        } else {
          alert('Tu meme está posteado k pro 😎')

          const eventDetail = { detail: { filePath: filePath } };
          document.dispatchEvent(new CustomEvent('memeUploaded', eventDetail));

          input.value = ''
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
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        max-width: 100%;
      }

      input[type="file"] {
        font-family: inherit;
        border: 1px solid #ccc;
        padding: 0.4rem;
        border-radius: 8px;
        background-color: #f8f8f8;
        cursor: pointer;
      }

      button[type="submit"] {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        background: linear-gradient(to right, #0066ff, #0051d4);
        color: #fff;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.3s ease;
      }

      button[type="submit"]:hover {
        transform: translateY(-2px);
        background: linear-gradient(to right, #0051d4, #0041aa);
      }

      progress {
        width: 100%;
        height: 8px;
        border: none;
        border-radius: 4px;
        overflow: hidden;
        background-color: #ddd;
        margin: 0; /* Elimina el espacio extra */
        padding: 0; /* Asegura que no tenga espacio interno */
        appearance: none;
      }
      progress::-webkit-progress-bar {
        background-color: #eee;
      }
      progress::-webkit-progress-value {
        background-color: #007aff;
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
