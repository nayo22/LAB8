class MemeCard extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'type'];
  }

  private shadow: ShadowRoot;
  private src = '';
  private type: 'image' | 'video' = 'image';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
    if (oldVal === newVal) return;

    if (attrName === 'src') this.src = newVal;
    if (attrName === 'type') this.type = newVal as 'image' | 'video';

    if (this.src && this.type) this.render();
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        .card {
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.3s ease;
          cursor: pointer;
        }

        .card:hover {
          transform: scale(1.15);
          z-index: 10;
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
      </style>
      <div class="card">
        ${this.type === 'video'
          ? `<video src="${this.src}" autoplay muted loop playsinline></video>`
          : `<img src="${this.src}" alt="meme" />`}
      </div>
    `;
  }
}

customElements.define('meme-card', MemeCard);
