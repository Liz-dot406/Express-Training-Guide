import express from 'express'
import sql from 'mssql';
import dotenv from 'dotenv';
import { getPool } from './db/config';


//create express app
const app = express();

//config dotenv - load env variables
dotenv.config();

//middleware
app.use(express.json()); //parse json request body


//Root route
app.get('/', (_, res) => {
    res.send("Hello, express API is running...");
});


//Fetch users with minimal error handling
app.get('/users', (req, res) => {
    getPool().then(pool => {
        return pool.request().query('SELECT * FROM Users');
    }).then(result => {
        res.json(result.recordset);
    }).catch(err => {
        console.log("SQL error", err);
        res.status(500).send("Server error");
    });
})



//Fetch todos with minimal error handling
app.get('/todos', (req, res) => {
    getPool().then(pool => {
        return pool.request().query('SELECT * FROM Todos');
    }).then(result => {
        res.json(result.recordset);
    }).catch(err => {
        console.log("SQL error", err);
        res.status(500).send("Server error");
    });
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`);
})



//test database connection
getPool()
    .then(() => console.log("Database connected"))
    .catch((err: any) => console.log("Database connection failed: ", err));
