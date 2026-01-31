require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Criminal = require('./models/Criminal');
const CrimeEvent = require('./models/CrimeEvent');
const Case = require('./models/Case');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Criminal.deleteMany();
        await CrimeEvent.deleteMany();
        await Case.deleteMany();

        console.log('🗑️  Cleared existing data');

        // Generate QR Tokens for seed users
        const salt = await bcrypt.genSalt(10);
        const qrToken = 'dummy-qr-token-123';
        const qrHash = await bcrypt.hash(qrToken, salt);
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        // Create Users
        const users = await User.create([
            {
                username: 'admin',
                email: 'admin@cms.gov',
                password: 'admin123',
                fullName: 'System Administrator',
                role: 'admin',
                department: 'Administration',
                badge: 'ADM-001',
                qrTokenHash: qrHash,
                qrToken: qrToken,
                qrExpiry: nextYear,
                qrRevoked: false
            },
            {
                username: 'analyst1',
                email: 'analyst1@cms.gov',
                password: 'analyst123',
                fullName: 'Jane Smith',
                role: 'analyst',
                department: 'Intelligence',
                badge: 'ANL-101',
                qrTokenHash: qrHash,
                qrToken: qrToken,
                qrExpiry: nextYear,
                qrRevoked: false
            },
            {
                username: 'agent1',
                email: 'agent1@cms.gov',
                password: 'agent123',
                fullName: 'John Doe',
                role: 'agent',
                department: 'Field Operations',
                badge: 'AGT-201',
                qrTokenHash: qrHash,
                qrToken: qrToken,
                qrExpiry: nextYear,
                qrRevoked: false
            },
        ]);

        console.log('👥 Created users with QR Access');

        // Create Criminals
        const criminals = await Criminal.create([
            {
                firstName: 'Victor',
                lastName: 'Kane',
                aliases: ['The Shadow', 'V.K.'],
                dateOfBirth: new Date('1985-03-15'),
                gender: 'Male',
                nationality: 'Unknown',
                riskScore: 85,
                dangerLevel: 'High',
                modusOperandi: 'Sophisticated cybercrime operations targeting financial institutions',
                status: 'At Large',
                lastKnownLocation: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128], // New York
                    address: 'Manhattan, NY',
                    city: 'New York',
                    country: 'USA',
                },
                addedBy: users[1]._id,
            },
            {
                firstName: 'Maria',
                lastName: 'Rodriguez',
                aliases: ['La Reina'],
                dateOfBirth: new Date('1990-07-22'),
                gender: 'Female',
                nationality: 'Mexican',
                riskScore: 70,
                dangerLevel: 'High',
                modusOperandi: 'Drug trafficking and money laundering',
                status: 'At Large',
                lastKnownLocation: {
                    type: 'Point',
                    coordinates: [-99.1332, 19.4326], // Mexico City
                    city: 'Mexico City',
                    country: 'Mexico',
                },
                addedBy: users[1]._id,
            },
            {
                firstName: 'James',
                lastName: 'Miller',
                dateOfBirth: new Date('1978-11-05'),
                gender: 'Male',
                nationality: 'American',
                riskScore: 45,
                dangerLevel: 'Medium',
                modusOperandi: 'Burglary and theft',
                status: 'Incarcerated',
                convictions: [
                    {
                        charge: 'Burglary',
                        date: new Date('2020-05-10'),
                        sentence: '5 years',
                        status: 'Ongoing',
                    },
                ],
                addedBy: users[2]._id,
            },
        ]);

        console.log('🚨 Created criminals');

        // Create Crime Events
        const crimes = await CrimeEvent.create([
            {
                title: 'Major Bank Cyber Attack',
                description: 'Sophisticated cyber attack on First National Bank resulting in $2M theft',
                crimeType: 'Cybercrime',
                severity: 'Critical',
                location: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128],
                    address: '123 Wall Street',
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                },
                occurredAt: new Date('2024-01-15'),
                suspects: [criminals[0]._id],
                status: 'Under Investigation',
                reportedBy: users[1]._id,
                assignedTo: users[1]._id,
                source: 'Manual',
            },
            {
                title: 'Drug Trafficking Operation Busted',
                description: 'Large-scale drug trafficking operation discovered at border',
                crimeType: 'Drug Trafficking',
                severity: 'High',
                location: {
                    type: 'Point',
                    coordinates: [-106.4850, 31.7619],
                    city: 'El Paso',
                    state: 'TX',
                    country: 'USA',
                },
                occurredAt: new Date('2024-02-20'),
                suspects: [criminals[1]._id],
                status: 'Under Investigation',
                reportedBy: users[2]._id,
                assignedTo: users[1]._id,
                source: 'Manual',
            },
            {
                title: 'Residential Burglary',
                description: 'Break-in at residential property, electronics stolen',
                crimeType: 'Burglary',
                severity: 'Medium',
                location: {
                    type: 'Point',
                    coordinates: [-118.2437, 34.0522],
                    city: 'Los Angeles',
                    state: 'CA',
                    country: 'USA',
                },
                occurredAt: new Date('2024-03-05'),
                suspects: [criminals[2]._id],
                status: 'Solved',
                reportedBy: users[2]._id,
                source: 'Manual',
            },
            {
                title: 'Armed Robbery at Convenience Store',
                description: 'Armed robbery with handgun, $500 stolen',
                crimeType: 'Robbery',
                severity: 'High',
                location: {
                    type: 'Point',
                    coordinates: [-87.6298, 41.8781],
                    city: 'Chicago',
                    state: 'IL',
                    country: 'USA',
                },
                occurredAt: new Date('2024-03-10'),
                status: 'Reported',
                reportedBy: users[2]._id,
                source: 'Manual',
            },
            {
                title: 'Vandalism at Public Park',
                description: 'Graffiti and property damage at Central Park',
                crimeType: 'Vandalism',
                severity: 'Low',
                location: {
                    type: 'Point',
                    coordinates: [-73.9654, 40.7829],
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                },
                occurredAt: new Date('2024-03-12'),
                status: 'Reported',
                reportedBy: users[2]._id,
                source: 'Manual',
            },
        ]);

        console.log('🔍 Created crime events');

        // Create Cases
        const cases = await Case.create([
            {
                caseNumber: 'CASE-2024-000001',
                title: 'Operation Cyber Shield',
                description: 'Investigation into coordinated cyber attacks on financial institutions',
                caseType: 'Cybercrime',
                priority: 'Urgent',
                status: 'Under Investigation',
                leadInvestigator: users[1]._id,
                team: [users[1]._id, users[2]._id],
                crimes: [crimes[0]._id],
                suspects: [criminals[0]._id],
                timeline: [
                    {
                        date: new Date('2024-01-15'),
                        event: 'Case Opened',
                        description: 'Initial report of cyber attack received',
                        addedBy: users[1]._id,
                    },
                    {
                        date: new Date('2024-01-20'),
                        event: 'Suspect Identified',
                        description: 'Victor Kane identified as primary suspect',
                        addedBy: users[1]._id,
                    },
                ],
            },
            {
                caseNumber: 'CASE-2024-000002',
                title: 'Border Drug Trafficking Investigation',
                description: 'Multi-agency investigation into cross-border drug trafficking',
                caseType: 'Drug Trafficking',
                priority: 'High',
                status: 'Under Investigation',
                leadInvestigator: users[1]._id,
                team: [users[1]._id],
                crimes: [crimes[1]._id],
                suspects: [criminals[1]._id],
                timeline: [
                    {
                        date: new Date('2024-02-20'),
                        event: 'Case Opened',
                        description: 'Drug trafficking operation discovered',
                        addedBy: users[1]._id,
                    },
                ],
            },
        ]);

        console.log('📁 Created cases');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Criminals: ${criminals.length}`);
        console.log(`   Crime Events: ${crimes.length}`);
        console.log(`   Cases: ${cases.length}`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin: admin / admin123');
        console.log('   Analyst: analyst1 / analyst123');
        console.log('   Agent: agent1 / agent123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

connectDB().then(seedData);
