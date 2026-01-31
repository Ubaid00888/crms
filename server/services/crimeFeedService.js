const cron = require('node-cron');
const axios = require('axios');
const CrimeEvent = require('../models/CrimeEvent');
const { syncMostWanted, archiveOldRecords } = require('./mostWantedService');

// Mock global crime feed aggregator
// In production, this would fetch from real APIs like NewsAPI, crime databases, etc.

const MOCK_CRIME_SOURCES = [
    {
        city: 'London',
        country: 'UK',
        coordinates: [-0.1276, 51.5074],
    },
    {
        city: 'Paris',
        country: 'France',
        coordinates: [2.3522, 48.8566],
    },
    {
        city: 'Tokyo',
        country: 'Japan',
        coordinates: [139.6917, 35.6895],
    },
    {
        city: 'Sydney',
        country: 'Australia',
        coordinates: [151.2093, -33.8688],
    },
    {
        city: 'Dubai',
        country: 'UAE',
        coordinates: [55.2708, 25.2048],
    },
];

const CRIME_TYPES = [
    'Homicide', 'Assault', 'Robbery', 'Burglary', 'Theft',
    'Fraud', 'Cybercrime', 'Drug Trafficking', 'Vandalism'
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

// Generate mock crime event
const generateMockCrime = () => {
    const source = MOCK_CRIME_SOURCES[Math.floor(Math.random() * MOCK_CRIME_SOURCES.length)];
    const crimeType = CRIME_TYPES[Math.floor(Math.random() * CRIME_TYPES.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];

    const titles = {
        'Homicide': ['Fatal Shooting Reported', 'Murder Investigation Underway', 'Homicide Case Opened'],
        'Assault': ['Violent Assault Reported', 'Aggravated Assault Case', 'Physical Altercation Leads to Injuries'],
        'Robbery': ['Armed Robbery at Local Store', 'Bank Robbery Attempt', 'Street Robbery Reported'],
        'Burglary': ['Residential Break-In', 'Commercial Property Burglary', 'Multiple Burglaries Reported'],
        'Theft': ['Vehicle Theft Reported', 'Shoplifting Incident', 'Property Theft Case'],
        'Fraud': ['Financial Fraud Scheme Uncovered', 'Identity Theft Case', 'Credit Card Fraud Ring'],
        'Cybercrime': ['Data Breach Reported', 'Ransomware Attack', 'Phishing Scam Victims'],
        'Drug Trafficking': ['Drug Bust Operation', 'Narcotics Seizure', 'Drug Trafficking Ring Exposed'],
        'Vandalism': ['Public Property Vandalism', 'Graffiti Incident', 'Property Damage Reported'],
    };

    const title = titles[crimeType][Math.floor(Math.random() * titles[crimeType].length)];

    const crimeImages = {
        'Homicide': ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800'],
        'Assault': ['https://images.unsplash.com/photo-1541872703-74c5e443d1f0?q=80&w=800'],
        'Robbery': ['https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800'],
        'Burglary': ['https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'],
        'Theft': ['https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=800'],
        'Fraud': ['https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800'],
        'Cybercrime': ['https://images.unsplash.com/photo-1563986768494-0dd2e4c21a28?q=80&w=800'],
        'Drug Trafficking': ['https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800'],
        'Vandalism': ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800'],
    };

    return {
        title: `${title} in ${source.city}`,
        description: `Authorities in ${source.city}, ${source.country} are investigating a ${crimeType.toLowerCase()} incident. Details are emerging as the investigation continues.`,
        crimeType,
        severity,
        location: {
            type: 'Point',
            coordinates: source.coordinates,
            city: source.city,
            country: source.country,
        },
        occurredAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        status: 'Reported',
        source: 'API',
        sourceUrl: 'https://global-crime-feed.example.com',
        evidence: [{
            evidenceType: 'Image',
            description: `Official documentation of ${crimeType.toLowerCase()} incident`,
            url: crimeImages[crimeType][0]
        }]
    };
};

const scraperService = require('./scraperService');

// Fetch and store global crimes (AI Integrated)
const fetchGlobalCrimes = async () => {
    try {
        console.log('🌍 Initializing AI News Intelligence feed...');
        const count = await scraperService.scrapeNews();

        // Real-time notification for admin dashboard
        if (global.emitToAll && count > 0) {
            global.emitToAll('new-intel-alert', {
                message: `${count} new intelligence reports pending review.`,
                timestamp: new Date()
            });
        }

        return count;
    } catch (error) {
        console.error('❌ Error fetching global crimes:', error.message);
    }
};

// Initialize cron job
const initCronJobs = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        try {
            console.log('⏰ Running scheduled global crime feed update...');
            await fetchGlobalCrimes();
        } catch (error) {
            console.error('❌ Error in scheduled crime feed update:', error.message);
        }
    });

    // Run Most Wanted sync daily at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('⏰ Running scheduled Most Wanted sync...');
            await syncMostWanted();
            await archiveOldRecords();
        } catch (error) {
            console.error('❌ Error in scheduled Most Wanted sync:', error.message);
        }
    });

    console.log('✅ Cron jobs initialized - Global crime feed will update every 30 minutes');

    // Run once on startup with error handling
    setTimeout(async () => {
        try {
            console.log('🧹 Cleaning up unapproved news reports for fresh AI ingestion...');
            await CrimeEvent.deleteMany({ isApproved: false, source: 'News' });

            await fetchGlobalCrimes();
            await syncMostWanted();
        } catch (error) {
            console.error('❌ Error during startup sync:', error.message);
            // Don't crash the server, just log the error
        }
    }, 5000); // Wait 5 seconds after server start
};

module.exports = { initCronJobs, fetchGlobalCrimes };
