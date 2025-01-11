import fooHandler from './fooService.js';
import express from 'express';
import cors from 'cors';
const app = express();
// Enable CORS with proper configuration
app.use(cors({
    origin: 'http://localhost:3000', // Allow your frontend origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));
// Handle preflight requests for all routes
app.options('*', cors()); // Allow preflight requests
app.use(express.json());
// Example endpoint
app.post('/foo', fooHandler);
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
