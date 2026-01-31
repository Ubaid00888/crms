const CrimeEvent = require('../models/CrimeEvent');
const Criminal = require('../models/Criminal');

// Simple NLP-like summarization (mock implementation)
// In production, you would use actual NLP libraries like natural, compromise, or call OpenAI API
const summarizeText = (text) => {
    if (!text || text.length < 50) return text;

    // Extract key sentences (simple approach)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Take first 2-3 sentences or up to 200 characters
    let summary = '';
    for (const sentence of sentences) {
        if (summary.length + sentence.length < 200) {
            summary += sentence.trim() + '. ';
        } else {
            break;
        }
    }

    return summary.trim() || text.substring(0, 200) + '...';
};

// Extract key points from case description
const extractKeyPoints = (description) => {
    const keywords = [
        'suspect', 'victim', 'evidence', 'witness', 'location',
        'weapon', 'motive', 'arrested', 'investigation', 'crime scene'
    ];

    const points = [];
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        for (const keyword of keywords) {
            if (lowerSentence.includes(keyword)) {
                points.push(sentence.trim());
                break;
            }
        }
    }

    return points.slice(0, 5); // Return top 5 key points
};

// Pattern detection - find crime clusters
const detectCrimePatterns = async () => {
    try {
        // Get crimes from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const crimes = await CrimeEvent.find({
            occurredAt: { $gte: thirtyDaysAgo }
        });

        // Group by crime type and location
        const patterns = {};

        crimes.forEach(crime => {
            const key = `${crime.crimeType}-${crime.location.city || 'Unknown'}`;

            if (!patterns[key]) {
                patterns[key] = {
                    crimeType: crime.crimeType,
                    location: crime.location.city || 'Unknown',
                    count: 0,
                    severity: {},
                    coordinates: crime.location.coordinates,
                };
            }

            patterns[key].count++;
            patterns[key].severity[crime.severity] = (patterns[key].severity[crime.severity] || 0) + 1;
        });

        // Identify hotspots (areas with 3+ similar crimes)
        const hotspots = Object.values(patterns)
            .filter(p => p.count >= 3)
            .sort((a, b) => b.count - a.count);

        return {
            totalPatterns: Object.keys(patterns).length,
            hotspots,
            summary: `Detected ${hotspots.length} crime hotspots in the last 30 days`,
        };
    } catch (error) {
        throw new Error('Pattern detection failed: ' + error.message);
    }
};

// Suggest similar cases based on crime type and location
const findSimilarCases = async (caseId) => {
    try {
        const targetCase = await CrimeEvent.findById(caseId);
        if (!targetCase) return [];

        // Find crimes with same type within 50km
        const similarCrimes = await CrimeEvent.find({
            _id: { $ne: caseId },
            crimeType: targetCase.crimeType,
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: targetCase.location.coordinates,
                    },
                    $maxDistance: 50000, // 50km
                },
            },
        }).limit(5);

        return similarCrimes;
    } catch (error) {
        throw new Error('Similar case search failed: ' + error.message);
    }
};

// Calculate criminal network strength
const analyzeCriminalNetwork = async (criminalId) => {
    try {
        const criminal = await Criminal.findById(criminalId)
            .populate('knownAssociates')
            .populate('crimes');

        if (!criminal) return null;

        const networkSize = criminal.knownAssociates.length;
        const sharedCrimes = criminal.crimes.length;

        // Simple network strength score
        const networkStrength = Math.min(100, (networkSize * 10) + (sharedCrimes * 5));

        return {
            criminalId: criminal._id,
            name: `${criminal.firstName} ${criminal.lastName}`,
            networkSize,
            sharedCrimes,
            networkStrength,
            riskLevel: networkStrength > 70 ? 'High' : networkStrength > 40 ? 'Medium' : 'Low',
        };
    } catch (error) {
        throw new Error('Network analysis failed: ' + error.message);
    }
};

module.exports = {
    summarizeText,
    extractKeyPoints,
    detectCrimePatterns,
    findSimilarCases,
    analyzeCriminalNetwork,
};
