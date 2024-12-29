"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const foo_js_1 = __importDefault(require("./foo.js"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Enable CORS with proper configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // Allow your frontend origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));
// Handle preflight requests for all routes
app.options('*', (0, cors_1.default)()); // Allow preflight requests
app.use(express_1.default.json());
// Example endpoint
app.post('/foo', foo_js_1.default);
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
