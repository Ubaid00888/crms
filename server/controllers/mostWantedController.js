const MostWanted = require('../models/MostWanted');

/**
 * Get all most wanted criminals with pagination and filtering
 */
exports.getMostWanted = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, agency, status = 'At Large' } = req.query;

        const query = { status };
        if (agency) query.sourceAgency = agency;

        const criminals = await MostWanted.find(query)
            .sort({ publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await MostWanted.countDocuments(query);

        res.json({
            criminals,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalResults: count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single most wanted criminal by ID
 */
exports.getMostWantedById = async (req, res, next) => {
    try {
        const criminal = await MostWanted.findById(req.params.id);
        if (!criminal) {
            return res.status(404).json({ message: 'Criminal record not found' });
        }
        res.json(criminal);
    } catch (error) {
        next(error);
    }
};

/**
 * Search most wanted criminals
 */
exports.searchMostWanted = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const query = {
            $text: { $search: q },
            status: { $ne: 'Archived' }
        };

        const criminals = await MostWanted.find(query)
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await MostWanted.countDocuments(query);

        res.json({
            criminals,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalResults: count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get most wanted by source agency
 */
exports.getMostWantedByAgency = async (req, res, next) => {
    try {
        const { agency } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const query = { sourceAgency: agency, status: 'At Large' };

        const criminals = await MostWanted.find(query)
            .sort({ publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await MostWanted.countDocuments(query);

        res.json({
            criminals,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalResults: count
        });
    } catch (error) {
        next(error);
    }
};
