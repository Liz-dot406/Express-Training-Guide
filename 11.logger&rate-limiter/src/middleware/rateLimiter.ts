import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextFunction, Request, Response } from 'express';


export const rateLimiter = new RateLimiterMemory({
    points: 10, // 10 requests
    duration: 60, // per 60 seconds
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await rateLimiter.consume(req.ip || 'unknown'); // means consume 1 point per request from IP
        console.log(`Rate limit check passed for IP: ${req.ip}`);
        next();
    } catch (error) {
        console.log(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ message: 'Too Many Requests, please try again later' });
    }
};