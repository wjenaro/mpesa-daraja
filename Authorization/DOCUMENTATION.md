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

## Detailed Base64 Authentication Process

### Understanding the Authentication String Creation
```javascript
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
```

This line of code is crucial for creating the authentication header required by the M-Pesa Daraja API. Let's break down the process step by step:

### 1. Template Literal Creation
```javascript
`${consumerKey}:${consumerSecret}`
```
- Uses ES6 template literals (backticks)
- Combines two values with a colon separator
- Example: if `consumerKey="key123"` and `consumerSecret="secret456"`:
  ```javascript
  "key123:secret456"
  ```

### 2. Buffer Creation
```javascript
Buffer.from(string)
```
- Creates a new Buffer containing the string
- Buffer is a Node.js class for handling binary data
- Converts the string into a sequence of bytes
- Example internal representation:
  ```
  <Buffer 6b 65 79 31 32 33 3a 73 65 63 72 65 74 34 35 36>
  ```

### 3. Base64 Encoding
```javascript
buffer.toString('base64')
```
- Converts the buffer to a base64-encoded string
- Base64 uses 64 different ASCII characters:
  - A-Z (26 characters)
  - a-z (26 characters)
  - 0-9 (10 characters)
  - + and / (2 characters)

### Visual Transformation Process
```mermaid
graph TD
    A[Template Literal] -->|Combination| B[Raw String]
    B -->|Buffer.from()| C[Binary Buffer]
    C -->|toString('base64')| D[Base64 String]

    subgraph "Example"
    E["key123:secret456"] -->|Buffer.from()| F["<Buffer 6b 65 ...>"]
    F -->|toString('base64')| G["a2V5MTIzOnNlY3JldDQ1Ng=="]
    end
```

### Step-by-Step Example

1. **Initial Values**:
   ```javascript
   consumerKey = "key123"
   consumerSecret = "secret456"
   ```

2. **Template Literal**:
   ```javascript
   `${consumerKey}:${consumerSecret}` → "key123:secret456"
   ```

3. **Buffer Creation**:
   ```javascript
   Buffer.from("key123:secret456") → <Buffer 6b 65 79 31 32 33 3a 73 65 63 72 65 74 34 35 36>
   ```

4. **Base64 Encoding**:
   ```javascript
   buffer.toString('base64') → "a2V5MTIzOnNlY3JldDQ1Ng=="
   ```

### Why Base64?

1. **HTTP Header Compatible**
   - Base64 uses only printable ASCII characters
   - Safe for HTTP headers
   - No special character encoding issues

2. **Standard Format**
   - Widely used in authentication
   - Part of HTTP Basic Authentication scheme
   - Universal support across platforms

3. **Reversible Encoding**
   - Not encryption (can be decoded)
   - Used for transport, not security
   - Security comes from HTTPS transport

### Usage in HTTP Headers

```http
GET /oauth/v1/generate HTTP/1.1
Host: sandbox.safaricom.co.ke
Authorization: Basic a2V5MTIzOnNlY3JldDQ1Ng==
```

### Security Notes

1. **Transport Security**
   - Always use HTTPS
   - Base64 is encoding, not encryption
   - Anyone can decode base64 strings

2. **Credential Protection**
   ```javascript
   // DON'T do this
   console.log(auth); // Never log the auth string

   // DO this
   console.log('Auth header created successfully');
   ```

3. **Error Prevention**
   ```javascript
   // Add validation
   if (!consumerKey || !consumerSecret) {
       throw new Error('Missing required credentials');
   }
   ```

### Common Issues and Solutions

1. **Missing Credentials**
   ```javascript
   // Problem
   const auth = Buffer.from(':').toString('base64');  // Empty credentials

   // Solution
   if (!consumerKey || !consumerSecret) {
       throw new Error('Missing credentials');
   }
   ```

2. **Invalid Characters**
   ```javascript
   // Problem
   consumerKey = "key with spaces";  // Spaces in key

   // Solution
   const sanitizedKey = consumerKey.trim();  // Remove whitespace
   ```

3. **Buffer Memory**
   ```javascript
   // Best Practice
   const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
   // Buffer is automatically garbage collected
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