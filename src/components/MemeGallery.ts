import { supabase } from '../services/supabaseClient';

class MemeGallery extends HTMLElement {
	private offset = 0;
	private limit = 8;
	private observer!: IntersectionObserver;
	private sentinel!: HTMLElement;
	private loading = false;

	connectedCallback() {
		this.render();
		this.loadMemes();
		this.setupInfiniteScroll();

		document.addEventListener('memeUploaded', (e: any) => {
			const filePath = e.detail?.filePath;
			if (filePath) {
				this.loadMemes(true, filePath);
			}
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private async loadMemes(prepend = false, newFilePath?: string) {
		if (this.loading) return;
		this.loading = true;

		const grid = this.querySelector('.grid');
		if (!grid) return;

		let files = [];
		if (prepend && newFilePath) {
			files = [{ name: newFilePath }];
		} else {
			const { data, error } = await supabase.storage.from('memes').list('', {
				limit: this.limit,
				offset: this.offset,
				sortBy: { column: 'created_at', order: 'desc' },
			});

			if (error || !data || data.length === 0) {
				console.warn('sube memeeeeeees k aki casi no hay compa😔');

				const defaultMemes = [
					{
						publicUrl: 'https://media.tenor.com/BdOHYc9fC9EAAAAM/watermelon.gif',
						type: 'image',
					},
					{
						publicUrl: 'https://i.imgflip.com/4go23d.jpg',
						type: 'image',
					},
					{
						publicUrl: 'https://c.tenor.com/vcXlB9xoqlIAAAAC/bob-esponja.gif',
						type: 'image',
					},
					{
						publicUrl: 'https://i.imgflip.com/6cv3ry.gif',
						type: 'image',
					},
					{
						publicUrl: 'https://media.tenor.com/-wHg_mAF4sAAAAAM/everyday-im-suffering-everyday.gif',
						type: 'image',
					},
					{
						publicUrl: 'https://media.tenor.com/ebwCzZDWXRcAAAAM/clapping-creepy-cat-pixelated.gif',
						type: 'image',
					},
					{
						publicUrl: 'https://media.tenor.com/VDgMW2S9i1gAAAAM/feliz-navidad-tiktok-meme.gif',
						type: 'image',
					},
					{
						publicUrl: 'https://pt.quizur.com/_image?href=https://img.quizur.com/f/img647b876865e8e0.68667366.jpg?lastEdited=1685817218&w=600&h=600&f=webp',
						type: 'image',
					},
					{
						publicUrl: 'https://us-tuna-sounds-images.voicemod.net/fa1ec33b-ded7-4a26-b665-0ca5570d5f93-1704515361457.jpg',
						type: 'image',
					},
					{
						publicUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
						type: 'video',
					},
				];

				for (const meme of defaultMemes) {
					const card = document.createElement('meme-card');
					card.setAttribute('src', meme.publicUrl);
					card.setAttribute('type', meme.type);
					grid.appendChild(card);
				}

				this.loading = false;
				return;
			}

			files = data;
			this.offset += this.limit;
		}

		for (const file of files) {
			const { data } = await supabase.storage.from('memes').getPublicUrl(file.name);
			if (!data?.publicUrl) continue;

			const card = document.createElement('meme-card');
			const ext = file.name.split('.').pop()?.toLowerCase();
			const isVideo = ext === 'mp4' || ext === 'webm' || ext === 'mov';

			card.setAttribute('src', data.publicUrl);
			card.setAttribute('type', isVideo ? 'video' : 'image');

			if (prepend) {
				grid.prepend(card);
			} else {
				grid.appendChild(card);
			}
		}

		this.loading = false;
	}

	private setupInfiniteScroll() {
		this.sentinel = this.querySelector('.sentinel') as HTMLElement;
		if (!this.sentinel) return;

		this.observer = new IntersectionObserver(async (entries) => {
			if (entries[0].isIntersecting && !this.loading) {
				await this.loadMemes();
			}
		});

		this.observer.observe(this.sentinel);
	}

	render() {
		this.innerHTML = `
    <style>
      :host {
        display: block;
        background-color: #121212;
        color: #fff;
        min-height: 100vh;
      }

      .container {
        padding: 0 2rem;
      }

      h2 {
        font-size: 1.5rem;
        margin: 1rem 0;
        color: #fff;
      }

      .grid {
        columns: 250px;
        column-gap: 1rem;
      }

      meme-card {
        break-inside: avoid;
        margin-bottom: 1rem;
        display: block;
      }

      .sentinel {
        height: 1px;
      }
    </style>

    <div class="container">
      <h2>Meme Gallery mi compa:</h2>
      <div class="grid"></div>
      <div class="sentinel"></div>
    </div>
  `;
	}
}

customElements.define('meme-gallery', MemeGallery);
