const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const CryptoJS = require('crypto-js');
const CrimeEvent = require('../models/CrimeEvent');
const nlpService = require('./nlpService');

// Configure parser to capture common image fields
const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent', { keepArray: true }],
            ['media:thumbnail', 'mediaThumbnail'],
            ['image', 'image'],
        ],
    }
});

const SOURCES = [
    { name: 'Dawn', url: 'https://www.dawn.com/feeds/home', country: 'Pakistan' },
    { name: 'Express Tribune', url: 'https://tribune.com.pk/feed/latest', country: 'Pakistan' },
    { name: 'The News', url: 'https://www.thenews.com.pk/rss/1/1', country: 'Pakistan' },
    { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', country: 'International' },
    { name: 'Reuters', url: 'http://feeds.reuters.com/reuters/worldNews', country: 'International' },
    { name: 'Geo News', url: 'https://www.geo.tv/rss/1/1', country: 'Pakistan' },
];

const CRIME_KEYWORDS = [
    'murder', 'arrest', 'killing', 'theft', 'robbery', 'crime', 'police',
    'court', 'jail', 'prison', 'suspect', 'stolen', 'heist', 'fraud',
    'smuggling', 'drug', 'narcotics', 'victim', 'accused', 'terror',
    'blast', 'kidnap', 'assault', 'burglary', 'vandalism'
];

class ScraperService {
    async scrapeNews() {
        console.log('📰 Starting AI News Ingestion with Image Deep Dive...');
        let ingestedCount = 0;

        for (const source of SOURCES) {
            try {
                console.log(`🔍 Scouring ${source.name}...`);
                const feed = await parser.parseURL(source.url);

                for (const item of feed.items) {
                    const content = (item.contentSnippet || item.content || item.title).toLowerCase();

                    // Filter for crime-related news
                    const isCrime = CRIME_KEYWORDS.some(kw => content.includes(kw));
                    if (!isCrime) continue;

                    // Generate Unique Hash for Deduplication
                    const contentHash = CryptoJS.SHA256(item.link + item.title).toString();

                    // Check if already exists
                    const existing = await CrimeEvent.findOne({ contentHash });
                    if (existing) continue;

                    // Extract Intelligence using NLP
                    const intel = await nlpService.extractIntelligence(item.title + ' ' + (item.contentSnippet || ''));

                    // --- Advanced Image Extraction ---
                    let imageUrl = null;

                    // 1. Try media:content from feed
                    if (item.mediaContent && item.mediaContent.length > 0) {
                        imageUrl = item.mediaContent[0].$.url;
                    }
                    // 2. Try media:thumbnail from feed
                    else if (item.mediaThumbnail) {
                        imageUrl = item.mediaThumbnail.$.url;
                    }
                    // 3. Try enclosure
                    else if (item.enclosure && item.enclosure.url) {
                        imageUrl = item.enclosure.url;
                    }
                    // 4. Try parsing HTML description/content
                    else if (item.content) {
                        const $ = cheerio.load(item.content);
                        imageUrl = $('img').attr('src');
                    }

                    // 5. DEEP DIVE: Fetch actual page if no image found (Reliable fallback)
                    if (!imageUrl && item.link) {
                        try {
                            const pageRes = await axios.get(item.link, {
                                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
                                timeout: 5000
                            });
                            const $page = cheerio.load(pageRes.data);
                            imageUrl = $page('meta[property="og:image"]').attr('content') ||
                                $page('meta[name="twitter:image"]').attr('content') ||
                                $page('article img').first().attr('src');
                        } catch (err) {
                            console.log(`⚠️  Could not fetch deep image for ${item.link}: ${err.message}`);
                        }
                    }

                    // 6. Final URL Cleanup (Resolve relative paths)
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        try {
                            const urlObj = new URL(item.link);
                            if (imageUrl.startsWith('//')) {
                                imageUrl = `https:${imageUrl}`;
                            } else {
                                imageUrl = urlObj.origin + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
                            }
                        } catch (err) {
                            console.log('❌ Error resolving relative image path');
                        }
                    }

                    // Create Pending Crime Node
                    await CrimeEvent.create({
                        title: item.title,
                        description: item.contentSnippet || item.title,
                        crimeType: intel.crimeType,
                        severity: intel.severity,
                        location: {
                            type: 'Point',
                            coordinates: intel.coordinates || [0, 0],
                            city: intel.city,
                            country: source.country,
                        },
                        occurredAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                        status: 'Reported',
                        source: 'News',
                        sourceUrl: item.link,
                        isApproved: false,
                        contentHash,
                        evidence: imageUrl ? [{
                            evidenceType: 'Image',
                            description: `Intelligence thumbnail from ${source.name}`,
                            url: imageUrl
                        }] : []
                    });

                    ingestedCount++;
                }
            } catch (error) {
                console.error(`❌ Error scraping ${source.name}:`, error.message);
            }
        }

        console.log(`✅ Ingestion Complete. ${ingestedCount} reports added.`);
        return ingestedCount;
    }
}

module.exports = new ScraperService();

