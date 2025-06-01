const axios = require('axios');

/**
 * In-memory token cache to store the M-Pesa access token
 * @property {string|null} token - The access token from M-Pesa OAuth
 * @property {number|null} expiry - Timestamp when the token will expire
 */
let tokenCache = {
  token: null,
  expiry: null
};

/**
 * Gets an access token from M-Pesa API with caching mechanism
 * 
 * This function:
 * 1. Checks if a valid cached token exists
 * 2. If not, generates a new token using M-Pesa OAuth
 * 3. Caches the token for 50 minutes (tokens last 1 hour)
 * 4. Implements error handling for API failures
 * 
 * @async
 * @returns {Promise<string>} The access token
 * @throws {Error} If authentication fails or required env vars are missing
 */
const getAccessToken = async () => {
  try {
    // First check: Do we have a valid cached token?
    // This prevents unnecessary API calls if we have a valid token
    if (tokenCache.token && tokenCache.expiry && tokenCache.expiry > Date.now()) {
      return tokenCache.token;
    }

    // Second check: Are all required environment variables present?
    // This prevents making API calls with invalid credentials
    if (!process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET || !process.env.MPESA_BASE_URL) {
      throw new Error('Missing required environment variables for authentication');
    }

    // Create base64 encoded auth string required by M-Pesa OAuth
    // Format: base64(consumer_key:consumer_secret)
    const auth = Buffer.from(
      `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
    ).toString('base64');

    // Make the OAuth request to M-Pesa API
    const response = await axios.get(
      `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Validate the response contains an access token
    if (!response.data.access_token) {
      throw new Error('Invalid response from M-Pesa OAuth API');
    }

    // Cache the new token
    // We cache for 50 minutes even though tokens last 1 hour
    // This gives us a 10-minute buffer to prevent token expiration during requests
    tokenCache.token = response.data.access_token;
    tokenCache.expiry = Date.now() + (50 * 60 * 1000); // 50 minutes in milliseconds

    return response.data.access_token;
  } catch (error) {
    // Log the detailed error for debugging
    console.error('Auth Error:', error?.response?.data || error.message);
    // Throw a generic error to avoid exposing sensitive details
    throw new Error('Failed to get access token from M-Pesa API');
  }
};

module.exports = getAccessToken;
