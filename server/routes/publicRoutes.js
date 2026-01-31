const express = require('express');
const router = express.Router();
const {
    getLatestCrimes,
    getGlobalStats,
    getMapData,
    getCrimeDetails
} = require('../controllers/publicController');
const mostWantedController = require('../controllers/mostWantedController');

router.get('/crimes/latest', getLatestCrimes);
router.get('/crimes/stats/global', getGlobalStats);
router.get('/crimes/map', getMapData);
router.get('/crimes/:id', getCrimeDetails);

// Most Wanted routes
router.get('/most-wanted', mostWantedController.getMostWanted);
router.get('/most-wanted/search', mostWantedController.searchMostWanted);
router.get('/most-wanted/:id', mostWantedController.getMostWantedById);
router.get('/most-wanted/source/:agency', mostWantedController.getMostWantedByAgency);

module.exports = router;
