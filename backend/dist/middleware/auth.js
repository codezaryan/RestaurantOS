"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.requireRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-os-secret-key-2026';
exports.JWT_SECRET = JWT_SECRET;
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No authentication token provided.' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Forbidden: Role '${req.user.role}' does not have required permissions.`
            });
        }
        next();
    };
};
exports.requireRoles = requireRoles;
//# sourceMappingURL=auth.js.map