const axios = require('axios');
const MostWanted = require('../models/MostWanted');

/**
 * Service to handle fetching and normalization of Most Wanted criminal data
 * from public and official sources (FBI, INTERPOL).
 */

const FBI_API_URL = 'https://api.fbi.gov/wanted/v1/list';
const INTERPOL_API_URL = 'https://ws-public.interpol.int/notices/v1/red';

const syncFBI = async () => {
    try {
        console.log('🔍 Fetching FBI Most Wanted data...');
        const response = await axios.get(FBI_API_URL, {
            params: {
                pageSize: 20,
                page: 1,
                sort_on: 'publication',
                sort_order: 'desc'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const items = response.data.items || [];
        console.log(`📊 Found ${items.length} records from FBI.`);

        for (const item of items) {
            const externalId = `FBI_${item.uid}`;

            const normalizedData = {
                fullName: item.title,
                aliases: item.aliases || [],
                gender: item.sex || 'Unknown',
                nationality: item.nationality || 'Unknown',
                crimeDescription: item.description || '',
                wantedFor: item.caution ? [item.caution] : [],
                reward: item.reward_text || 'No reward mentioned',
                lastKnownLocation: item.place_of_birth || 'Unknown',
                status: 'At Large',
                sourceAgency: 'FBI',
                externalId: externalId,
                images: (item.images || []).map(img => ({
                    original: img.original,
                    thumb: img.thumb,
                    caption: img.caption
                })),
                publishedAt: item.publication ? new Date(item.publication) : new Date(),
                lastSyncedAt: new Date(),
                detailsUrl: item.url
            };

            await MostWanted.findOneAndUpdate(
                { externalId },
                normalizedData,
                { upsert: true, new: true }
            );
        }

        console.log('✅ FBI sync completed.');
    } catch (error) {
        console.error('❌ Error syncing FBI data:', error.message);
    }
};

const syncInterpol = async () => {
    try {
        console.log('🔍 Fetching INTERPOL Red Notices...');
        // INTERPOL API is more sensitive, we'll fetch a limited set if available
        const response = await axios.get(INTERPOL_API_URL, {
            params: {
                resultPerPage: 20,
                page: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const notices = response.data._embedded ? response.data._embedded.notices : [];
        console.log(`📊 Found ${notices.length} records from INTERPOL.`);

        for (const notice of notices) {
            const externalId = `INTERPOL_${notice.entity_id}`;

            // Notice summary doesn't have all details, usually requires a second fetch per notice
            // For academic demo, we normalize the summary data
            const normalizedData = {
                fullName: `${notice.forename || ''} ${notice.name || ''}`.trim(),
                nationality: notice.nationalities ? notice.nationalities.join(', ') : 'Unknown',
                status: 'At Large',
                sourceAgency: 'INTERPOL',
                externalId: externalId,
                images: notice._links && notice._links.thumbnail ? [{
                    thumb: notice._links.thumbnail.href,
                    original: notice._links.thumbnail.href
                }] : [],
                publishedAt: notice.date_of_birth ? new Date(notice.date_of_birth) : new Date(), // Using DOB as placeholder if publish date missing
                lastSyncedAt: new Date(),
                detailsUrl: notice._links && notice._links.self ? notice._links.self.href : ''
            };

            await MostWanted.findOneAndUpdate(
                { externalId },
                normalizedData,
                { upsert: true, new: true }
            );
        }

        console.log('✅ INTERPOL sync completed.');
    } catch (error) {
        // INTERPOL API often has rate limits or requires specific headers, handle gracefully
        console.warn('⚠️ INTERPOL sync skipped or failed (API may be restricted):', error.message);
    }
};

const syncMostWanted = async () => {
    console.log('🔄 Starting Most Wanted global sync...');
    await syncFBI();
    await syncInterpol();
    console.log('✨ Global data sync finished.');
};

/**
 * Archives records that haven't been synced in the last 7 days
 * Assuming they might have been removed from public lists (captured/resolved)
 */
const archiveOldRecords = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await MostWanted.updateMany(
            {
                lastSyncedAt: { $lt: sevenDaysAgo },
                status: 'At Large'
            },
            { status: 'Archived' }
        );

        if (result.modifiedCount > 0) {
            console.log(`📦 Archived ${result.modifiedCount} old criminal records.`);
        }
    } catch (error) {
        console.error('❌ Error archiving old records:', error.message);
    }
};

module.exports = { syncMostWanted, archiveOldRecords };
