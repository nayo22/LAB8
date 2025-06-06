import { supabase } from '../services/supabaseClient'

class MemeGallery extends HTMLElement {
  private handleMemeUploadedRef: (e: Event) => void;

  constructor() {
    super()
    this.handleMemeUploadedRef = (event: Event) =>
      this.loadMemes(event as CustomEvent<{ filePath: string }>)
  }

  connectedCallback() {
    this.render()
    this.loadMemes()
    document.addEventListener('memeUploaded', this.handleMemeUploadedRef)
  }

  disconnectedCallback() {
    document.removeEventListener('memeUploaded', this.handleMemeUploadedRef)
  }

  async loadMemes(event?: CustomEvent<{ filePath: string }>) {
    const grid = this.querySelector('.grid')
    if (!grid) return

    const newMeme = event?.detail?.filePath
    grid.innerHTML = '<p>Cargando memes...</p>'

    try {
      const { data: filesList, error: listError } = await supabase
        .storage
        .from('memes')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' },
          limit: 100,
        })

      if (listError) {
        grid.innerHTML = `<p>Error cargando los memes: ${listError.message}</p>`
        return
      }

      let allFiles = filesList ?? []

      if (newMeme && !allFiles.some(f => f.name === newMeme)) {
        allFiles = [
          {
            name: newMeme,
            id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            metadata: {},
          } as any // 👈 solución segura y simple para bypass
        ].concat(allFiles)
      }

      grid.innerHTML = ''

      const cards = await Promise.all(
        allFiles.map(async (file) => {
          const urlData = supabase.storage.from('memes').getPublicUrl(file.name)

          const publicUrl = urlData?.data?.publicUrl
          if (!publicUrl) return null

          const card = document.createElement('meme-card')
          const timestamp = Number(file.name.split('-')[0]) || Date.now()
          const created = file.created_at ? new Date(file.created_at) : new Date(timestamp)

          card.setAttribute('src', publicUrl)
          card.setAttribute('name', file.name)
          card.setAttribute('created', created.toISOString())
          return card
        })
      )

      const valid = cards.filter(Boolean) as HTMLElement[]
      if (valid.length > 0) {
        valid.forEach(card => grid.appendChild(card))
      } else {
        grid.innerHTML = '<p>No se pudieron mostrar memes. 😢</p>'
      }
    } catch (e) {
      console.error('💥 Error inesperado en loadMemes:', e)
      grid.innerHTML = '<p>Error inesperado cargando memes 😵</p>'
    }
  }

  render() {
    this.innerHTML = `
      <style>
        h2 {
          font-size: 1.5rem;
          margin: 1rem 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
      </style>
      <h2>Meme Gallery mi compa:</h2>
      <div class="grid"></div>
    `
  }
}

customElements.define('meme-gallery', MemeGallery)