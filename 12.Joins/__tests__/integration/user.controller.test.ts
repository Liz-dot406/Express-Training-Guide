import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";
import bcrypt from "bcrypt";

let pool: any;

beforeAll(async () => {
    pool = await getPool();

    const hashedPassword = await bcrypt.hash("testpass123", 10);

    // Seed user for authentication and lookup tests
    await pool.request().query(`
        INSERT INTO Users (first_name, last_name, email, phone_number, password, role)
        VALUES ('Test', 'User', 'testuser@testmail.com', '0712345678', '${hashedPassword}', 'user')
    `);
});

afterAll(async () => {
    // Clean up all test users
    await pool.request().query("DELETE FROM Users WHERE email LIKE '%@testmail.com'");
    await pool.close();
});

describe("User API Integration Test Suite", () => {
    //LOGIN TESTS 
    it("should authenticate a user and return a token", async () => {
        const res = await request(app).post("/login").send({
            email: "testuser@testmail.com",
            password: "testpass123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.message).toMatch(/login successful/i);
        expect(res.body.user.email).toBe("testuser@testmail.com");
    });

    it("should fail with wrong password", async () => {
        const res = await request(app).post("/login").send({
            email: "testuser@testmail.com",
            password: "wrongpassword",
        });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it("should fail with non-existent user on login", async () => {
        const res = await request(app).post("/login").send({
            email: "nonexistent@testmail.com",
            password: "testpass123",
        });

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/user not found/i);
    });

    //GET ALL USERS
    it("should fetch all users successfully", async () => {
        const res = await request(app).get("/users");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    //CREATE USER
    it("should create a new user successfully", async () => {
        const newUser = {
            first_name: "brian",
            last_name: "kemboi",
            email: "kemboi@testmail.com",
            phone_number: "0799999999",
            password: "securePass123",
        };

        const res = await request(app).post("/users").send(newUser);
        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/user created successfully/i);
    });

    it("should fail to create a user with missing fields", async () => {
        const res = await request(app).post("/users").send({
            first_name: "OnlyName",
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body).toHaveProperty("error");
    });

    it("should fail to create a user with duplicate email", async () => {
        const newUser = {
            first_name: "dup",
            last_name: "user",
            email: "testuser@testmail.com", // existing
            phone_number: "0700000000",
            password: "securePass123",
        };

        const res = await request(app).post("/users").send(newUser);
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("error");
    });

    //GET USER BY ID
    it("should return user by ID", async () => {
        const inserted = await pool
            .request()
            .query(
                "INSERT INTO Users (first_name, last_name, email, phone_number, password, role) OUTPUT INSERTED.userid VALUES ('John', 'Smith', 'john@testmail.com', '0700000000', 'pass123', 'user')"
            );

        const userId = inserted.recordset[0].userid;
        const res = await request(app).get(`/users/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.email).toBe("john@testmail.com");
    });

    it("should return 404 if user not found", async () => {
        const res = await request(app).get("/users/99999999");
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/user not found/i);
    });

    //UPDATE USER
    it("should update a user successfully", async () => {
        const inserted = await pool
            .request()
            .query(
                "INSERT INTO Users (first_name, last_name, email, phone_number, password, role) OUTPUT INSERTED.userid VALUES ('Update', 'Me', 'update@testmail.com', '0790000000', 'pass789', 'user')"
            );

        const userId = inserted.recordset[0].userid;
        const res = await request(app).put(`/users/${userId}`).send({
            first_name: "Updated",
            last_name: "User",
            phone_number: "0700111222",
            password: "newpass123",
            role: "admin",
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/updated successfully/i);
    });

    it("should return 400 when updating with invalid ID", async () => {
        const res = await request(app).put("/users/abc").send({
            first_name: "BadId",
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid user id/i);
    });

    it("should return 404 when updating non-existent user", async () => {
        const res = await request(app).put("/users/999999").send({
            first_name: "Ghost",
        });
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/user not found/i);
    });

    //DELETE USER
    it("should delete a user successfully", async () => {
        const inserted = await pool
            .request()
            .query(
                "INSERT INTO Users (first_name, last_name, email, phone_number, password, role) OUTPUT INSERTED.userid VALUES ('Alice', 'Brown', 'alice@testmail.com', '0722222222', 'pass456', 'user')"
            );

        const userId = inserted.recordset[0].userid;
        console.log("want to see:", userId);
        const res = await request(app).delete(`/users/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/user deleted successfully/i);
    });

    it("should return 400 for invalid user ID on delete", async () => {
        const res = await request(app).delete("/users/abc");
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid user id/i);
    });

    it("should return 404 for non-existent user on delete", async () => {
        const res = await request(app).delete("/users/99999999");
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/user not found/i);
    });

    //VERIFY USER EMAIL
    it("should fail verifying without email or code", async () => {
        const res = await request(app).post("/verify").send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/email and code are required/i);
    });


    it("should fail verifying non-existent user", async () => {
        const res = await request(app).post("/verify").send({
            email: "noone@testmail.com",
            code: "123456",
        });
        expect(res.status).toBe(404);
    });
});
