import { Express } from "express";
import * as todoController from '../controllers/todo.controllers'

const todoRoutes = (app: Express) => {
    app.get('/todos', todoController.getTodos);
    app.get('/todos/:id', todoController.getTodoById);
    app.post('/todos', todoController.createTodo);
    app.put('/todos/:id', todoController.updateTodo);
    app.delete('/todos/:id', todoController.deleteTodo);
}

export default todoRoutes;
