"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const operations_1 = __importDefault(require("./routes/operations"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const ai_1 = __importDefault(require("./routes/ai"));
const invoices_1 = __importDefault(require("./routes/invoices"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
// Static directory for uploaded invoice files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Attach Socket.io to express app for routes access
app.set('io', io);
// Socket.io Real-time Connection
io.on('connection', (socket) => {
    console.log('⚡ Socket connected:', socket.id);
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/operations', operations_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/invoices', invoices_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        platform: 'RestaurantOS – AI Powered Restaurant Management Platform',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
server.listen(PORT, () => {
    console.log(`🚀 RestaurantOS Server running on http://localhost:${PORT}`);
});
exports.default = app;
