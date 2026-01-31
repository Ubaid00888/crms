import api from './api';

export const getLatestCrimes = async () => {
    const response = await api.get('/public/crimes/latest');
    return response.data;
};

export const getGlobalStats = async () => {
    const response = await api.get('/public/crimes/stats/global');
    return response.data;
};

export const getMapData = async () => {
    const response = await api.get('/public/crimes/map');
    return response.data;
};

// Most Wanted API calls
export const getMostWanted = async (page = 1, limit = 12, agency = '', status = 'At Large') => {
    const response = await api.get('/public/most-wanted', {
        params: { page, limit, agency, status }
    });
    return response.data;
};

export const getMostWantedById = async (id) => {
    const response = await api.get(`/public/most-wanted/${id}`);
    return response.data;
};

export const searchMostWanted = async (q, page = 1, limit = 12) => {
    const response = await api.get('/public/most-wanted/search', {
        params: { q, page, limit }
    });
    return response.data;
};

export const getMostWantedByAgency = async (agency, page = 1, limit = 12) => {
    const response = await api.get(`/public/most-wanted/source/${agency}`, {
        params: { page, limit }
    });
    return response.data;
};
