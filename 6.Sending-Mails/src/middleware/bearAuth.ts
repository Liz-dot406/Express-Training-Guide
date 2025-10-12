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
                /**
                 The object will look like this:
                    {   
                        id: 'some-unique-id',
                        role: 'admin' | 'user',
                        iat: 1697059200, // issued at
                        exp: 1697062800  // expiration time
                    }

                 */
                decoded !== null && // Ensure decoded is not null
                "role" in decoded // Check if 'role' property exists
            ) {
                if (requiredRole === "both") { // If requiredRole is 'both', allow both 'admin' and 'user'
                    if (decoded.role === "admin" || decoded.role === "user") { // Allow both roles
                        next();
                        return
                    }
                }
                else if (decoded.role === requiredRole) { // If requiredRole is 'admin' or 'user', check for exact match
                    next();
                    return
                }
                res.status(401).json({ message: "Unauthorized" }); // Role does not match, unauthorized
                return
            }
            else { // decoded is not an object or doesn't have role property
                /**
                 *an example of invalid payload:
                 {
                    "email": "email@gmail.com",
                    "name": "John Doe"
                 }
                 */
                res.status(401).json({ message: "Invalid Token Payload" })
                return
            }
        } catch (error) {
            res.status(401).json({ message: 'Invalid Token' }); // Token verification failed - happens when token is expired or tampered
            return
        }
    }

}


export const adminOnly = checkRoles("admin");
export const userOnly = checkRoles("user");
export const adminUser = checkRoles("both");