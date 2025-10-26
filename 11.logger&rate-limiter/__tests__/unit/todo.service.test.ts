import * as todoRepositories from "../../src/repositories/todo.repository";
import * as todoServices from "../../src/services/todo.service";

jest.mock("../src/repositories/todo.repository");

describe("Todo Service Test Suite", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return a list of todos", async () => {
        const mockTodos = [
            { todoid: 1, todo_name: "Task 1", description: "Desc 1", due_date: "2023-12-31", user_id: 1 },
            { todoid: 2, todo_name: "Task 2", description: "Desc 2", due_date: "2024-01-15", user_id: 2 }
        ];

        (todoRepositories.getAllTodos as jest.Mock).mockResolvedValue(mockTodos);

        const todos = await todoServices.listTodos();
        expect(todos).toEqual(mockTodos);
        expect(todoRepositories.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it("should return a todo when found by id", async () => {
        const mockTodo = { todoid: 1, todo_name: "Task 1", description: "Desc 1", due_date: "2023-12-31", user_id: 1 };
        (todoRepositories.getTodoById as jest.Mock).mockResolvedValue(mockTodo);

        const todo = await todoServices.getTodo(1);
        expect(todo).toEqual(mockTodo);
        expect(todoRepositories.getTodoById).toHaveBeenCalledWith(1);
    });

    it("should return undefined when todo not found by id", async () => {
        (todoRepositories.getTodoById as jest.Mock).mockResolvedValue(undefined);

        const todo = await todoServices.getTodo(999);
        expect(todo).toBeUndefined();
        expect(todoRepositories.getTodoById).toHaveBeenCalledWith(999);
    });

    it("should create a new todo", async () => {
        const newTodo = { todo_name: "New Task", description: "New Desc", due_date: "2024-02-01", user_id: 3 };
        (todoRepositories.createTodo as jest.Mock).mockResolvedValue({ message: "Todo created successfully" });

        const result = await todoServices.createTodo(newTodo as any);
        expect(todoRepositories.createTodo).toHaveBeenCalledWith(newTodo);
        expect(result).toEqual({ message: "Todo created successfully" });
    });

    it("should delete todo if it exists", async () => {
        (todoRepositories.getTodoById as jest.Mock).mockResolvedValue({ todoid: 1 });
        (todoRepositories.deleteTodo as jest.Mock).mockResolvedValue({ message: "Todo deleted successfully" });

        const result = await todoServices.deleteTodo(1);
        expect(todoRepositories.getTodoById).toHaveBeenCalledWith(1);
        expect(todoRepositories.deleteTodo).toHaveBeenCalledWith(1);
        expect(result).toEqual({ message: "Todo deleted successfully" });
    });

    it("should throw error when deleting a non-existing todo", async () => {
        (todoRepositories.getTodoById as jest.Mock).mockResolvedValue(undefined);

        await expect(todoServices.deleteTodo(999)).rejects.toThrow("Todo not found");
        expect(todoRepositories.getTodoById).toHaveBeenCalledWith(999);
        expect(todoRepositories.deleteTodo).not.toHaveBeenCalled();
    });

    it("should update todo if it exists", async () => {
        const update = { todo_name: "Updated Task", description: "Updated", due_date: "2024-03-01", user_id: 1 };
        (todoRepositories.getTodoById as jest.Mock).mockResolvedValue({ todoid: 1 });
        (todoRepositories.updateTodo as jest.Mock).mockResolvedValue({ message: "Todo updated successfully" });

        const result = await todoServices.updateTodo(1, update as any);
        expect(todoRepositories.getTodoById).toHaveBeenCalledWith(1);
        expect(todoRepositories.updateTodo).toHaveBeenCalledWith(1, update);
        expect(result).toEqual({ message: "Todo updated successfully" });
    });

    it("should throw error when updating a non-existing todo", async () => {
        (todoRepositories.getTodoById as jest.Mock).mockResolvedValue(undefined);

        await expect(todoServices.updateTodo(999, { todo_name: "x" } as any)).rejects.toThrow("Todo not found");
        expect(todoRepositories.getTodoById).toHaveBeenCalledWith(999);
        expect(todoRepositories.updateTodo).not.toHaveBeenCalled();
    });
});