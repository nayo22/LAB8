class MemeCard extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'name', 'created', 'type']
  }

  private shadow: ShadowRoot
  private src = ''
  private name = ''
  private created = ''
  private type: 'image' | 'video' = 'image'

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
    if (oldVal !== newVal) {
      if (attrName === 'src') this.src = newVal
      if (attrName === 'name') this.name = newVal
      if (attrName === 'created') this.created = newVal
      if (attrName === 'type') this.type = newVal as 'image' | 'video'
      this.render()
    }
  }

  formatDate(iso: string): string {
    const date = new Date(iso)
    return date.toLocaleString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        .card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        img, video {
          width: 100%;
          height: auto;
          display: block;
        }
        video {
          autoplay: true;
          muted: true;
          loop: true;
          playsinline: true;
        }
        .info {
          padding: 0.5rem 1rem;
        }
        .name {
          font-weight: bold;
        }
        .date {
          font-size: 0.85rem;
          color: #666;
        }
      </style>
      <div class="card">
        ${this.type === 'video'
          ? `<video src="${this.src}" autoplay muted loop playsinline></video>`
          : `<img src="${this.src}" alt="meme" />`}
        <div class="info">
          <div class="name">${this.name}</div>
          <div class="date">${this.formatDate(this.created)}</div>
        </div>
      </div>
    `
  }
}

customElements.define('meme-card', MemeCard)