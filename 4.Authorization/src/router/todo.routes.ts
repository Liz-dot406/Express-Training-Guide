import { Express } from "express";
import * as todoController from '../controllers/todo.controllers'
import { isAuthenticated } from "../middleware/bearAuth";

const todoRoutes = (app: Express) => {
    app.get('/todos', isAuthenticated, todoController.getTodos);
    app.get('/todos/:id', todoController.getTodoById);
    app.post('/todos', isAuthenticated, todoController.createTodo);
    app.put('/todos/:id', todoController.updateTodo);
    app.delete('/todos/:id', todoController.deleteTodo);

    //api to all practice
    app.get('/alltodos', isAuthenticated, todoController.getAllTodosController);
    app.post('/addtodo', todoController.AddTodoController);




}

export default todoRoutes;
