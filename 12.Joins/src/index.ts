import express from 'express'
import todoRoutes from './router/todo.routes';
import userRoutes from './router/user.routes';
import { logger } from './middleware/logger';
import { rateLimiterMiddleware } from './middleware/rateLimiter';

const initializeApp = () => {
    //create express app
    const app = express();

    //middleware
    app.use(express.json()); //parse json request body
    //logger
    app.use(rateLimiterMiddleware);
    //cors
    app.use(logger);
    //ratelimiter

    //register routes
    todoRoutes(app); //register todo routes
    userRoutes(app); //register user routes

    //default route
    app.get('/', (_, res) => {
        res.send("Hello, express API is running...");
    });

    return app;
}

const app = initializeApp();
export default app;





