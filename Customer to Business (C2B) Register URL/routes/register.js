const express = require('express');
const axios = require('axios');
const getAccessToken = require('../services/auth');

const router = express.Router();

/**
 * Register URL endpoint
 * Registers validation and confirmation URLs with M-Pesa
 */
router.post('/url', async (req, res) => {
  try {
    // Validate required environment variables
    const requiredVars = ['SHORT_CODE', 'CONFIRMATION_URL', 'VALIDATION_URL', 'MPESA_BASE_URL'];
    const missingVars = requiredVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // URL validation
    const urlPattern = /^https:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    if (!urlPattern.test(process.env.CONFIRMATION_URL) || !urlPattern.test(process.env.VALIDATION_URL)) {
      throw new Error('URLs must be HTTPS and properly formatted');
    }

    const token = await getAccessToken();

    const response = await axios.post(
      `${process.env.MPESA_BASE_URL}/mpesa/c2b/v1/registerurl`,
      {
        ShortCode: process.env.SHORT_CODE,
        ResponseType: "Completed",  // Default to Completed if validation URL is unreachable
        ConfirmationURL: process.env.CONFIRMATION_URL,
        ValidationURL: process.env.VALIDATION_URL
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log successful registration
    console.log('URLs registered successfully:', response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Register URL error:', error?.response?.data || error.message);
    
    const errorResponse = {
      error: 'Failed to register URLs with M-Pesa'
    };

    if (error.message.includes('Missing required environment variables')) {
      errorResponse.error = 'Server configuration error. Please check environment variables.';
      return res.status(500).json(errorResponse);
    }

    if (error.message.includes('URLs must be HTTPS')) {
      errorResponse.error = 'Invalid URL format. URLs must use HTTPS protocol.';
      return res.status(400).json(errorResponse);
    }

    if (error?.response?.status === 401) {
      errorResponse.error = 'Authentication failed with M-Pesa API';
      return res.status(401).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
});

module.exports = router;
