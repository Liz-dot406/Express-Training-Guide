import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';


dotenv.config();

// middleware to check for roles
export const checkRoles = (requiredRole: "admin" | "user" | "both") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            // attach user to request
            (req as any).user = decoded;

            // check for roles
            if (typeof decoded === 'object' &&  // Ensure decoded is an object
                decoded !== null && // Ensure decoded is not null
                "role" in decoded // Check if 'role' property exists
            ) {
                if (requiredRole === "both") {
                    if (decoded.role === "admin" || decoded.role === "user") { // Allow both roles
                        next();
                        return
                    }
                } // If requiredRole is 'both', allow both 'admin' and 'user'
                else if (decoded.role === requiredRole) {
                    next();
                    return
                }
                res.status(401).json({ message: "Unauthorized" });
                return
            }
            else { // decoded is not an object or doesn't have role property
                res.status(401).json({ message: "Invalid Token Payload" })
                return
            }
        } catch (error) {
            res.status(401).json({ message: 'Invalid Token' });
            return
        }
    }

}


export const adminOnly = checkRoles("admin");
export const userOnly = checkRoles("user");
export const adminUser = checkRoles("both");