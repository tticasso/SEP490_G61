// test-api.js
require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:9999';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OTBhYzY4MWE0ZmZhYjBjNTRiOTY5MCIsImlhdCI6MTc0MjMxMTY0MywiZXhwIjoxNzQyMzE1MjQzfQ.ZKY7cova2lJvga0UNdN3iYvpGEWBINdgkwWxVH2YSJg';

// Test API trực tiếp
async function testBatchCreateAPI() {
    try {
        console.log('Testing batch creation API directly...');
        console.log('Using URL:', `${BASE_URL}/api/revenue/batch/create`);
        console.log('Using token:', ADMIN_TOKEN ? `${ADMIN_TOKEN.substring(0, 10)}...` : 'Not set');
        
        const response = await axios.post(
            `${BASE_URL}/api/revenue/batch/create`,
            {},
            {
                headers: {
                    'x-access-token': ADMIN_TOKEN
                }
            }
        );
        
        console.log('API call successful!');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('API call failed!');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received!');
        } else {
            console.error('Error:', error.message);
        }
    }
}

testBatchCreateAPI();