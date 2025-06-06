import { supabase } from '../services/supabaseClient'

class MemeGallery extends HTMLElement {
  private offset = 0
  private limit = 8
  private observer!: IntersectionObserver
  private sentinel!: HTMLElement
  private loading = false

  connectedCallback() {
    this.render()
    this.loadMemes()
    this.setupInfiniteScroll()

    document.addEventListener('memeUploaded', (e: any) => {
      const filePath = e.detail?.filePath
      if (filePath) {
        this.loadMemes(true, filePath)
      }
    })
  }

  disconnectedCallback() {
    this.observer?.disconnect()
  }

  private async loadMemes(prepend = false, newFilePath?: string) {
    if (this.loading) return
    this.loading = true

    const grid = this.querySelector('.grid')
    if (!grid) return

    let files = []
    if (prepend && newFilePath) {
      files = [{ name: newFilePath }]
    } else {
      const { data, error } = await supabase.storage.from('memes').list('', {
        limit: this.limit,
        offset: this.offset,
        sortBy: { column: 'created_at', order: 'desc' }
      })

      if (error || !data) {
        console.error('Error listando:', error)
        this.loading = false
        return
      }

      files = data
      this.offset += this.limit
    }

    for (const file of files) {
      const { data } = await supabase.storage.from('memes').getPublicUrl(file.name)
      if (!data?.publicUrl) continue

      const card = document.createElement('meme-card')
      const timestamp = Number(file.name.split('-')[0]) || Date.now()
      const created = new Date(timestamp).toISOString()

      card.setAttribute('src', data.publicUrl)
      card.setAttribute('name', file.name)
      card.setAttribute('created', created)

      if (prepend) {
        grid.prepend(card)
      } else {
        grid.appendChild(card)
      }
    }

    this.loading = false
  }

  private setupInfiniteScroll() {
    this.sentinel = this.querySelector('.sentinel') as HTMLElement
    if (!this.sentinel) return

    this.observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !this.loading) {
        await this.loadMemes()
      }
    })

    this.observer.observe(this.sentinel)
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
        .sentinel {
          height: 1px;
        }
      </style>
      <h2>Meme Gallery mi compa:</h2>
      <div class="grid"></div>
      <div class="sentinel"></div>
    `
  }
}

customElements.define('meme-gallery', MemeGallery)
