const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifyQRLifecycle = async () => {
    try {
        // 1. Login as Admin
        console.log("1. Logging in as Admin...");
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const adminToken = adminLogin.data.data.token;
        console.log("Admin Login Success.");

        // 2. Create New Analyst
        console.log("\n2. Creating new user 'test_analyst'...");
        const uniqueSuffix = Date.now().toString().slice(-4);
        const newUser = {
            username: `test_analyst_${uniqueSuffix}`,
            email: `test${uniqueSuffix}@cms.gov`,
            password: 'password123',
            fullName: 'Test Analyst',
            role: 'analyst',
            department: 'Intelligence'
        };

        const createRes = await axios.post(`${API_URL}/admin/users`, newUser, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const createdUser = createRes.data.data;
        const plainQrToken = createRes.data.qrToken;
        console.log("User Created:", createdUser.username);
        console.log("QR Token received from API:", plainQrToken ? "YES" : "NO");

        if (!plainQrToken) {
            throw new Error("API failed to return plain QR token on creation");
        }

        // 3. Simulate QR Login
        console.log("\n3. Attempting QR Login with new credentials...");
        try {
            const qrLoginRes = await axios.post(`${API_URL}/auth/qr-login`, {
                userId: createdUser._id,
                token: plainQrToken,
                deviceInfo: 'Test Script'
            });

            console.log("QR Login Result:", qrLoginRes.data.success ? "SUCCESS" : "FAILED");
            console.log("Redirect Role:", qrLoginRes.data.data.user.role);
        } catch (qrError) {
            console.error("QR Login Failed:", qrError.response?.data || qrError.message);
        }

    } catch (error) {
        console.error("Lifecycle Test Failed:", error.response?.data || error.message);
    }
};

verifyQRLifecycle();
