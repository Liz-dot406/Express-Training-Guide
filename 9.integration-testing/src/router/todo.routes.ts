import { Express } from "express";
import * as todoController from '../controllers/todo.controllers'
import { adminOnly, userOnly, adminUser } from "../middleware/bearAuth";

const todoRoutes = (app: Express) => {
    app.get('/todos', todoController.getTodos);
    app.get('/todos/:id', todoController.getTodoById);
    app.post('/todos', todoController.createTodo);
    app.put('/todos/:id', todoController.updateTodo);
    app.delete('/todos/:id', todoController.deleteTodo);

    //api to all practice
    app.get('/alltodos', todoController.getAllTodosController);
    app.post('/addtodo', todoController.AddTodoController);

}

export default todoRoutes;
