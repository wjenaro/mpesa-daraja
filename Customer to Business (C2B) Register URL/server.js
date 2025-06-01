const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const registerRoutes = require('./routes/register');
const mpesaRoutes = require('./routes/mpesa');

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['CONSUMER_KEY', 'CONSUMER_SECRET', 'SHORT_CODE', 'CONFIRMATION_URL', 'VALIDATION_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/register', registerRoutes);
app.use('/api/c2b', mpesaRoutes);  // Updated path to match new URLs

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Handle unhandled routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
