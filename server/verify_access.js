const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verify = async () => {
    try {
        console.log("1. Logging in as analyst1...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'analyst1',
            password: 'analyst123'
        });

        const token = loginRes.data.data.token;
        console.log("Login Success. Token acquired.");

        console.log("2. Fetching Crime Stats...");
        const statsRes = await axios.get(`${API_URL}/crimes/stats/overview`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Stats Response Status:", statsRes.status);
        console.log("Stats Data:", JSON.stringify(statsRes.data.data, null, 2));

        console.log("3. Fetching Recent Crimes...");
        const crimesRes = await axios.get(`${API_URL}/crimes?limit=5`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Crimes Response Status:", crimesRes.status);
        console.log("Crimes Count:", crimesRes.data.data.length);

    } catch (error) {
        console.error("Verification Failed:", error.response?.data || error.message);
    }
};

verify();
