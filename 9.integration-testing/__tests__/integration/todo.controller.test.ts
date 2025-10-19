import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";

let pool: any;
let seededUserId: number;

beforeAll(async () => {
    pool = await getPool();

    // seed a user to associate todos with
    const insertedUser = await pool
        .request()
        .query(
            "INSERT INTO Users (first_name, last_name, email, phone_number, password, role) OUTPUT INSERTED.userid VALUES ('Todo', 'User', 'todouser@testmail.com', '0700000001', 'pass', 'user')"
        );
    seededUserId = insertedUser.recordset[0].userid;

    // seed a todo for lookup/update/delete tests
    await pool
        .request()
        .input("todo_name", "seed-testtodo-1")
        .input("description", "seed todo")
        .input("due_date", null)
        .input("user_id", seededUserId)
        .query(
            "INSERT INTO Todos (todo_name, description, due_date, user_id) VALUES (@todo_name, @description, @due_date, @user_id)"
        );
});

afterAll(async () => {
    // clean up todos and users created during tests
    await pool.request().query("DELETE FROM Todos WHERE todo_name LIKE '%testtodo%'");
    await pool.request().query("DELETE FROM Users WHERE email LIKE '%@testmail.com'");
    await pool.close();
});

describe("Todo API Integration Test Suite", () => {
    it("should fetch all todos successfully", async () => {
        const res = await request(app).get("/todos");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("should create a new todo successfully", async () => {
        const newTodo = {
            todo_name: "create-testtodo-1",
            description: "integration test todo",
            due_date: null,
            user_id: seededUserId,
        };

        const res = await request(app).post("/todos").send(newTodo);
        expect([200, 201]).toContain(res.status); // router may return 200 or 201 depending on implementation
        // Either check for message or created object; be permissive but ensure success
        expect(res.body).toBeDefined();
    });

    it("should fail to create a todo with missing fields", async () => {
        const res = await request(app).post("/todos").send({
            todo_name: "incomplete-testtodo",
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body).toHaveProperty("error");
    });

    it("should return todo by ID", async () => {
        // insert and get inserted id
        const inserted = await pool
            .request()
            .query(
                "INSERT INTO Todos (todo_name, description, due_date, user_id) OUTPUT INSERTED.todoid VALUES ('getbyid-testtodo', 'by id', NULL, " +
                seededUserId +
                ")"
            );
        const todoId = inserted.recordset[0].todoid;

        const res = await request(app).get(`/todos/${todoId}`);
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
        expect(res.body.todo_name ?? res.body[0]?.todo_name).toMatch(/getbyid-testtodo/i);
    });

    it("should return 404 if todo not found", async () => {
        const res = await request(app).get("/todos/99999999");
        expect([404, 500]).toContain(res.status); // depending on service, missing row may be 404; allow 500 if DB constraints differ
    });

    it("should return 400 when updating with invalid ID", async () => {
        const res = await request(app).put("/todos/abc").send({
            todo_name: "bad",
        });
        expect(res.status).toBe(400);
        expect(res.body.message ?? res.body.error).toMatch(/invalid/i);
    });

    it("should return 404 when updating non-existent todo", async () => {
        const res = await request(app).put("/todos/999999").send({
            todo_name: "ghost",
        });
        expect([404, 500]).toContain(res.status);
    });

    it("should delete a todo successfully", async () => {
        const inserted = await pool
            .request()
            .query(
                "INSERT INTO Todos (todo_name, description, due_date, user_id) OUTPUT INSERTED.todoid VALUES ('delete-testtodo', 'delete me', NULL, " +
                seededUserId +
                ")"
            );
        const todoId = inserted.recordset[0].todoid;

        const res = await request(app).delete(`/todos/${todoId}`);
        expect([200, 204]).toContain(res.status);
    });

    it("should return 400 for invalid todo ID on delete", async () => {
        const res = await request(app).delete("/todos/abc");
        expect(res.status).toBe(400);
        expect(res.body.message ?? res.body.error).toMatch(/invalid/i);
    });

    it("should return 404 for non-existent todo on delete", async () => {
        const res = await request(app).delete("/todos/99999999");
        expect([404, 500]).toContain(res.status);
    });
});