import dotenv from 'dotenv';
import assert from 'assert'; //ensures that env variables are defined 
import sql from 'mssql';

dotenv.config(); // Loads the environment variables from .env file

const {
    SQL_SERVER,
    SQL_USER,
    SQL_PWD,
    SQL_DB,
    PORT
} = process.env; // Destructure environment variables


// Ensure all required environment variables are defined
assert(PORT, "PORT is required");
assert(SQL_SERVER, "SQL_SERVER is required");
assert(SQL_USER, "SQL_USER is required");
assert(SQL_PWD, "SQL_PWD is required");
assert(SQL_DB, "SQL_DB is required");



// Configuration object for the database connection
export const config = {
    port: PORT,
    sqlConfig: {
        user: SQL_USER,
        password: SQL_PWD,
        database: SQL_DB,
        server: SQL_SERVER,
        pool: { //pool is used to manage multiple connections to the database
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, // for azure 
            trustServerCertificate: true // Change to true for local dev / self-signed certs
        }
    }
};

//// Create a connection pool - a cache of database connections maintained so that the connections can be reused when future requests to the database are required.
export const getPool = async () => {
    try {
        const pool = await sql.connect(config.sqlConfig);
        return pool;
    } catch (error) {
        console.log("SQL Connection Error: ", error);
        throw error;
    }
};
