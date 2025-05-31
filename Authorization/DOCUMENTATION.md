# M-Pesa Daraja API Integration Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Dependencies](#dependencies)
4. [Configuration](#configuration)
5. [Code Components](#code-components)
6. [API Endpoints](#api-endpoints)
7. [Authentication Flow](#authentication-flow)
8. [Error Handling](#error-handling)
9. [Setup Guide](#setup-guide)
10. [OAuth Endpoint Documentation](#oauth-endpoint-documentation)

## Project Overview
This Node.js application provides integration with Safaricom's M-Pesa Daraja API, specifically handling the OAuth authentication process to generate access tokens for subsequent API operations.

## Architecture
```mermaid
graph TD
    A[Client] -->|HTTP GET| B[Express Server]
    B -->|Request Token| C[M-Pesa Daraja API]
    C -->|Access Token| B
    B -->|Token Response| A
    
    subgraph Server
        B
        D[Environment Variables]
        E[Authentication Logic]
    end
    
    D -->|Credentials| E
    E -->|Base64 Auth| B
```

## Dependencies
| Package | Version | Purpose |
|---------|---------|----------|
| express | ^4.x | Web application framework |
| axios | ^1.x | HTTP client for API requests |
| dotenv | ^16.x | Environment variables management |

## Configuration

### Environment Variables
```plaintext
ConsumerKey=your_consumer_key_here
ConsumerSecret=your_consumer_secret_here
```

### Server Configuration
```javascript
const PORT = 3000;
```

## Code Components

### 1. Initial Setup
```javascript
const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config()
```
**Purpose**: Initializes the application and imports required dependencies.

### 2. Credential Management
```javascript
const consumerKey = process.env.ConsumerKey;
const consumerSecret = process.env.ConsumerSecret;
```
**Purpose**: Securely retrieves API credentials from environment variables.

### 3. Authentication Process
```javascript
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
```

#### How Base64 Authentication Works
```plaintext
1. Input: consumerKey:consumerSecret
2. Buffer Creation: Convert to binary buffer
3. Base64 Encoding: Convert buffer to base64 string
4. Output: Base64EncodedString
```

Example:
```
Input:  "key123:secret456"
Output: "a2V5MTIzOnNlY3JldDQ1Ng=="
```

### 4. Token Generation Function
```javascript
const getAccessToken = async () => {
    // Authentication string creation
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    try {
        // API request
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
}
```

#### Function Flow
```mermaid
sequenceDiagram
    participant App
    participant Auth
    participant API
    
    App->>Auth: Create base64 credentials
    Auth->>API: POST request with auth header
    API-->>App: Return access token
    
    alt Error occurs
        API-->>App: Return error response
        App->>App: Log error & throw
    end
```

## API Endpoints

### GET /daraja/token
```javascript
app.get('/daraja/token', async (req, res) => {
    try {
        const tokenResponse = await getAccessToken();
        res.json(tokenResponse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve access token' });
    }
});
```

**Purpose**: Endpoint to retrieve M-Pesa API access token
- **Method**: GET
- **Response**: JSON containing access token or error message
- **Error Handling**: Returns 500 status code on failure

## Error Handling

The application implements multiple layers of error handling:

1. **API Request Level**
   ```javascript
   try {
       const response = await axios.post(/*...*/);
   } catch (error) {
       console.error('Error getting access token:', error.response?.data || error.message);
       throw error;
   }
   ```

2. **Endpoint Level**
   ```javascript
   try {
       const tokenResponse = await getAccessToken();
   } catch (error) {
       res.status(500).json({ error: 'Failed to retrieve access token' });
   }
   ```

## Setup Guide

1. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   
   # Install dependencies
   npm install
   ```

2. **Configuration**
   ```bash
   # Create .env file
   echo "ConsumerKey=your_key" > .env
   echo "ConsumerSecret=your_secret" >> .env
   ```

3. **Running the Server**
   ```bash
   # Start the server
   node index.js
   ```

4. **Testing the API**
   ```bash
   # Using curl
   curl http://localhost:3000/daraja/token
   ```

## OAuth Endpoint Documentation

## M-Pesa Daraja API OAuth URL
`https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`

### URL Breakdown

1. **Base URL**: 
   - `https://sandbox.safaricom.co.ke`
   - This is the sandbox (testing) environment URL
   - Production URL would be `https://api.safaricom.co.ke`

2. **Path**:
   - `/oauth/v1/generate`
   - OAuth authentication endpoint
   - v1 indicates API version 1

3. **Query Parameter**:
   - `grant_type=client_credentials`
   - Specifies the OAuth 2.0 grant type
   - client_credentials is used for server-to-server authentication

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Daraja API
    
    Note over Client: Create Base64 encoded string<br/>(consumerKey:consumerSecret)
    Client->>Daraja API: POST /oauth/v1/generate
    Note over Client,Daraja API: Authorization: Basic {base64string}
    Daraja API-->>Client: Return Access Token
    Note over Client: Token valid for 1 hour
```

## Request Details

### Headers
```javascript
{
    Authorization: "Basic {base64EncodedString}"
}
```

### Response Format
```json
{
    "access_token": "SGWcJPtNtYNPGk1XOC4u",
    "expires_in": "3599"
}
```

### Response Properties
1. `access_token`: 
   - The token to use for subsequent API calls
   - Include in header as: `Authorization: Bearer {access_token}`

2. `expires_in`:
   - Time in seconds until token expires
   - Typically 3600 seconds (1 hour)
   - Should refresh token before expiry

## Environment Differences

| Environment | Base URL | Purpose |
|------------|----------|----------|
| Sandbox | sandbox.safaricom.co.ke | Testing and development |
| Production | api.safaricom.co.ke | Live transactions |

## Best Practices

1. **Token Management**
   - Cache the token
   - Refresh before expiry
   - Handle failed requests with retry logic

2. **Security**
   - Always use HTTPS
   - Never expose credentials
   - Implement proper error handling

3. **Rate Limiting**
   - Implement token caching
   - Avoid unnecessary token requests
   - Follow Safaricom's rate limits

## Common Errors

1. **Invalid Credentials**
   ```json
   {
       "requestId": "234-567890-1",
       "errorCode": "401.002.01",
       "errorMessage": "Invalid Authentication Credentials"
   }
   ```

2. **Rate Limiting**
   ```json
   {
       "requestId": "234-567890-1",
       "errorCode": "429.001.01",
       "errorMessage": "Rate limit exceeded"
   }
   ```

## Implementation Example

```javascript
const getAccessToken = async () => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    try {
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
}
```

## Token Usage Example

```javascript
// Using the access token for other API calls
const makeApiCall = async (accessToken) => {
    const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/other-endpoint',
        data,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return response.data;
}
```

## Security Considerations

1. **Credential Storage**
   - Store credentials in environment variables
   - Never commit credentials to source control
   - Use secure credential management in production

2. **Token Storage**
   - Store tokens securely
   - Clear expired tokens
   - Implement proper token rotation

3. **Error Handling**
   - Handle network errors gracefully
   - Implement retry mechanisms
   - Log errors appropriately

## Security Considerations

1. **Credential Protection**
   - Never commit .env files
   - Use environment variables for sensitive data
   - Implement rate limiting for production

2. **Error Handling**
   - Avoid exposing internal errors to clients
   - Log errors for debugging
   - Implement proper error monitoring

3. **API Security**
   - Use HTTPS in production
   - Implement request validation
   - Add proper CORS settings

## Best Practices

1. **Code Organization**
   - Separate concerns (routing, authentication, error handling)
   - Use async/await for better readability
   - Implement proper logging

2. **API Design**
   - Follow RESTful principles
   - Implement proper status codes
   - Provide meaningful error messages

3. **Maintenance**
   - Keep dependencies updated
   - Monitor API changes
   - Implement proper versioning