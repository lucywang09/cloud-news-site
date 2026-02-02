import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
    customFields: {
        item: ['pubDate', 'published', 'updated']
    }
});

const FEEDS = [
    {
        url: 'https://aws.amazon.com/blogs/aws/feed/',
        source: 'AWS'
    },
    {
        url: 'https://azure.microsoft.com/en-us/blog/feed/',
        source: 'Azure'
    },
    {
        url: 'https://cloud.google.com/feeds/gcp-release-notes.xml',
        source: 'Google Cloud'
    },
    {
        // Using Cloudflare's global feed as a stable option
        url: 'https://developers.cloudflare.com/api/changelogs/rss.xml',
        source: 'Cloudflare'
    }
];

async function fetchFeed(feedConfig) {
    try {
        console.log(`Fetching ${feedConfig.source}...`);
        const feed = await parser.parseURL(feedConfig.url);
        
        return feed.items.map(item => {
            // Try to get the date from various possible fields
            const dateStr = item.pubDate || item.published || item.updated || item.isoDate;
            const date = dateStr ? new Date(dateStr) : new Date();
            
            return {
                title: item.title?.trim() || 'No title',
                url: item.link || item.id || '#',
                source: feedConfig.source,
                date: date.toISOString()
            };
        });
    } catch (error) {
        console.error(`Error fetching ${feedConfig.source}:`, error.message);
        return [];
    }
}

async function updateNews() {
    console.log('Starting news update...\n');
    
    // Fetch all feeds in parallel
    const feedPromises = FEEDS.map(feed => fetchFeed(feed));
    const feedResults = await Promise.all(feedPromises);
    
    // Flatten and combine all items
    const allItems = feedResults.flat();
    
    console.log(`\nTotal items fetched: ${allItems.length}`);
    
    // Deduplicate by URL
    const uniqueItems = [];
    const seenUrls = new Set();
    
    for (const item of allItems) {
        if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            uniqueItems.push(item);
        }
    }
    
    console.log(`Unique items after deduplication: ${uniqueItems.length}`);
    
    // Sort by date (newest first)
    uniqueItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Keep only the latest 30 items
    const latestItems = uniqueItems.slice(0, 30);
    
    console.log(`Keeping latest 30 items`);
    
    // Create output object
    const output = {
        lastUpdated: new Date().toISOString(),
        items: latestItems
    };
    
    // Write to news.json in the root directory
    const outputPath = path.join(__dirname, '..', 'news.json');
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`\n✅ Successfully updated news.json with ${latestItems.length} items`);
    console.log(`📅 Last updated: ${output.lastUpdated}`);
    
    // Print a sample of the latest items
    console.log('\nLatest 5 items:');
    latestItems.slice(0, 5).forEach((item, index) => {
        const date = new Date(item.date).toLocaleDateString();
        console.log(`${index + 1}. [${item.source}] ${item.title.substring(0, 60)}... (${date})`);
    });
}

// Run the update
updateNews().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
