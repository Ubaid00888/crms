// Mock NLP utilities for client-side text processing

export const summarizeText = (text) => {
    if (!text || text.length < 50) return text;

    // Extract key sentences
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

export const extractKeyPoints = (description) => {
    const keywords = [
        'suspect', 'victim', 'evidence', 'witness', 'location',
        'weapon', 'motive', 'arrested', 'investigation', 'crime scene',
        'discovered', 'reported', 'identified', 'seized', 'recovered'
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
