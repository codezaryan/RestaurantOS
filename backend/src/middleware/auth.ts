import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type Role = 'OWNER' | 'MANAGER' | 'CHEF' | 'WAITER' | 'CASHIER' | 'STORE_MANAGER';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-os-secret-key-2026';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No authentication token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }
    req.user = decoded as AuthRequest['user'];
    next();
  });
};

export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

export { JWT_SECRET };
