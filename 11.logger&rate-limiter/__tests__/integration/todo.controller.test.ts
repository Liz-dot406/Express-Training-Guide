import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";

let pool: any;
let testUserId: number;
let createdTodoId: number;

// Safe helper to insert todos
const insertTodo = async (name: string, userId: number) => {
  const result = await pool
    .request()
    .input("todo_name", name)
    .input("description", "Test description")
    .input("due_date", new Date())
    .input("user_id", userId)
    .query(`
      INSERT INTO Todos (todo_name, description, due_date, user_id)
      OUTPUT INSERTED.todoid
      VALUES (@todo_name, @description, @due_date, @user_id);
    `);
  return result.recordset[0].todoid;
};

beforeAll(async () => {
  pool = await getPool();

  // Create a unique user for each run (prevents duplicate key)
  const uniqueEmail = `todo_integration_${Date.now()}@testmail.com`;

  const userInsert = await pool
    .request()
    .input("first_name", "Todo")
    .input("last_name", "Tester")
    .input("email", uniqueEmail)
    .input("phone_number", "0711111111")
    .input("password", "pass123")
    .input("role", "user")
    .query(`
      INSERT INTO Users (first_name, last_name, email, phone_number, password, role)
      OUTPUT INSERTED.userid
      VALUES (@first_name, @last_name, @email, @phone_number, @password, @role);
    `);

  testUserId = userInsert.recordset[0].userid;
});

afterAll(async () => {
  // Clean up all data safely, respecting FK constraints
  await pool
    .request()
    .input("user_id", testUserId)
    .query("DELETE FROM Todos WHERE user_id = @user_id");

  await pool
    .request()
    .input("user_id", testUserId)
    .query("DELETE FROM Users WHERE userid = @user_id");

  await pool.close();
});

describe("Todo API Integration Tests", () => {
  it("should create a new todo successfully", async () => {
    const todoData = {
      todo_name: "create-testtodo",
      description: "integration test",
      due_date: "2025-12-31",
      user_id: testUserId,
    };

    const res = await request(app)
      .post("/todos")
      .set("Content-Type", "application/json")
      .send(todoData);

    expect(res.status).toBe(201);
  });

  it("should fetch all todos successfully", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
  });

  it("should fetch a todo by ID", async () => {
    const todoId = await insertTodo("getbyid-testtodo", testUserId);
    const res = await request(app).get(`/todos/${todoId}`);
    expect(res.status).toBe(200);
    expect(res.body.todo_name).toMatch(/getbyid-testtodo/i);
  });

  it("should update a todo successfully", async () => {
    const todoId = await insertTodo("update-testtodo", testUserId);
    const res = await request(app)
      .put(`/todos/${todoId}`)
      .set("Content-Type", "application/json")
      .send({
        todo_name: "Updated Todo",
        description: "Updated description",
        due_date: "2025-12-31",
        user_id: testUserId,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  it("should delete a todo successfully", async () => {
    const todoId = await insertTodo("delete-testtodo", testUserId);
    const res = await request(app).delete(`/todos/${todoId}`);
    expect(res.status).toBe(204);
  });

  // Negative Tests
  it("should return 404 for non-existent todo ID", async () => {
    const res = await request(app).get("/todos/9999999");
    expect(res.status).toBe(404);
  });

  it("should fail to create a todo with missing fields", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Content-Type", "application/json")
      .send({ todo_name: "" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 when updating with invalid ID", async () => {
    const res = await request(app)
      .put("/todos/abc")
      .set("Content-Type", "application/json")
      .send({ todo_name: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should return 404 when updating non-existent todo", async () => {
    const res = await request(app)
      .put("/todos/999999")
      .set("Content-Type", "application/json")
      .send({ todo_name: "ghost" });
    expect(res.status).toBe(404);
  });

  it("should return 400 for invalid ID on delete", async () => {
    const res = await request(app).delete("/todos/abc");
    expect(res.status).toBe(400);
    expect(res.body.message ).toMatch(/invalid/i);
  });

  it("should return 404 for non-existent todo on delete", async () => {
    const res = await request(app).delete("/todos/9999999");
    expect(res.status).toBe(404);
  });
});
