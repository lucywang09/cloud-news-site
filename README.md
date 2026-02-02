# ☁️ Cloud News

A minimal GitHub Pages site that displays the latest cloud news from AWS, Azure, Google Cloud, and Cloudflare RSS feeds.

## Features

- 📰 Aggregates news from 4 major cloud providers
- 🔄 Auto-updates via GitHub Actions on every push to `main`
- 🎨 Clean, responsive design
- 🚀 No frameworks, no API keys, no servers
- 📱 Mobile-friendly

## RSS Feeds

- **AWS**: AWS News Blog
- **Azure**: Azure Blog
- **Google Cloud**: GCP Release Notes
- **Cloudflare**: API Changelogs

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the initial news data:
   ```bash
   npm run update-news
   ```
4. Push to GitHub and enable GitHub Pages in your repository settings
5. The site will auto-deploy on every push to `main`

## Local Development

To update the news feed locally:

```bash
npm run update-news
```

Then open `index.html` in your browser.

## How It Works

1. `scripts/update-news.js` fetches RSS feeds from all sources
2. Deduplicates entries by URL
3. Sorts by date (newest first)
4. Keeps the latest 30 items
5. Writes to `news.json`
6. `index.html` loads and displays the news items

## License

MIT
