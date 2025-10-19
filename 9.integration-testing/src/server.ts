
import app from "./index"
import dotenv from 'dotenv';
import { getPool } from './db/config';

//config dotenv - load env variables
dotenv.config();



//port
const port = process.env.PORT || 8081;

//start server
app.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`);
})

//test database connection
getPool()
    .then(() => console.log("Database connected"))
    .catch((err: any) => console.log("Database connection failed: ", err));