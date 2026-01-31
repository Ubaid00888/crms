const { NlpManager } = require('@nlpjs/nlp');

// Major Pakistani Cities Coordinates
const PAKISTAN_CITIES = {
    'Karachi': [67.0011, 24.8607],
    'Lahore': [74.3587, 31.5204],
    'Islamabad': [73.0479, 33.6844],
    'Rawalpindi': [73.0169, 33.5651],
    'Faisalabad': [73.1350, 31.4504],
    'Multan': [71.4582, 30.1575],
    'Hyderabad': [68.3578, 25.3960],
    'Gujranwala': [74.1944, 32.1877],
    'Peshawar': [71.5249, 34.0151],
    'Quetta': [66.9965, 30.1798],
    'Sargodha': [72.6711, 32.0836],
    'Sialkot': [74.5229, 32.4945],
    'Bahawalpur': [71.6833, 29.3956],
    'Sukkur': [68.8466, 27.7244],
    'Jhang': [72.3333, 31.2667],
    'Shekhupura': [73.9783, 31.7131],
    'Larkana': [68.2167, 27.5500],
    'Gujrat': [74.0728, 32.5742],
    'Mardan': [72.0494, 34.1989],
    'Kasur': [74.4500, 31.1167],
    'Rahim Yar Khan': [70.3000, 28.4167],
    'Sahiwal': [73.1000, 30.6667],
    'Okara': [73.5167, 30.8100],
    'Wah Cantt': [72.7231, 33.7744],
    'Dera Ghazi Khan': [70.6333, 30.0500],
};

const CRIME_TYPES = [
    'Homicide', 'Assault', 'Robbery', 'Burglary', 'Theft',
    'Fraud', 'Cybercrime', 'Drug Trafficking', 'Terrorism',
    'Human Trafficking', 'Kidnapping', 'Arson', 'Vandalism'
];

class NlpService {
    constructor() {
        this.manager = new NlpManager({ languages: ['en'], forceNER: true });
        this.isTrained = false;
        this.init();
    }

    async init() {
        // Add entities for Crime Types
        CRIME_TYPES.forEach(type => {
            this.manager.addNamedEntityText('crimeType', type, ['en'], [type, type.toLowerCase()]);
        });

        // Add entities for Cities
        Object.keys(PAKISTAN_CITIES).forEach(city => {
            this.manager.addNamedEntityText('city', city, ['en'], [city, city.toLowerCase()]);
        });

        // Add some common variations
        this.manager.addNamedEntityText('crimeType', 'Homicide', ['en'], ['murder', 'killing', 'shot dead', 'stabbing']);
        this.manager.addNamedEntityText('crimeType', 'Robbery', ['en'], ['heist', 'looted', 'stole', 'snatched']);
        this.manager.addNamedEntityText('crimeType', 'Terrorism', ['en'], ['blast', 'explosion', 'suicide attack', 'militants']);
        this.manager.addNamedEntityText('crimeType', 'Kidnapping', ['en'], ['abduction', 'abducted', 'kidnapped']);
        this.manager.addNamedEntityText('crimeType', 'Drug Trafficking', ['en'], ['narcotics', 'drugs seized', 'heroin', 'smuggling']);

        await this.manager.train();
        this.isTrained = true;
    }

    async extractIntelligence(text) {
        if (!this.isTrained) await this.init();

        const result = await this.manager.process('en', text);

        let extractedCity = 'International';
        let coordinates = [0, 0]; // Default
        let crimeType = 'Other';
        let severity = 'Medium';

        // Extract City
        const cityEntity = result.entities.find(e => e.entity === 'city');
        if (cityEntity) {
            extractedCity = cityEntity.option;
            coordinates = PAKISTAN_CITIES[extractedCity];
        }

        // Extract Crime Type
        const crimeEntity = result.entities.find(e => e.entity === 'crimeType');
        if (crimeEntity) {
            crimeType = crimeEntity.option;
        }

        // Determine Severity based on keywords
        const lowerText = text.toLowerCase();
        if (lowerText.includes('kill') || lowerText.includes('dead') || lowerText.includes('blast') || lowerText.includes('murder') || lowerText.includes('terrorism')) {
            severity = 'Critical';
        } else if (lowerText.includes('arrest') || lowerText.includes('major') || lowerText.includes('robbery') || lowerText.includes('kidnap')) {
            severity = 'High';
        }

        return {
            city: extractedCity,
            coordinates,
            crimeType,
            severity,
            entities: result.entities
        };
    }
}

module.exports = new NlpService();
