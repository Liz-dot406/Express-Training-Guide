

import * as todoRepositories from '../repositories/todo.repository'
import { NewTodo, UpdateTodo } from '../Types/todo.type';

export const listTodos = async () => await todoRepositories.getAllTodos();
export const getTodo = async (id: number) => await todoRepositories.getTodoById(id);
export const createTodo = async (todo: NewTodo) => await todoRepositories.createTodo(todo);
// export const deleteTodo = async (id: number) => await todoRepositories.deleteTodo(id);
export const deleteTodo = async (id: number) => {
    const existingTodo = await todoRepositories.getTodoById(id);
    if (!existingTodo) {
        throw new Error('Todo not found');
    }
    return await todoRepositories.deleteTodo(id);
}

//export const updateTodo = async (id: number, todo: any) => await todoRepositories.updateTodo(id, todo);
export const updateTodo = async (id: number, todo: UpdateTodo) => {
    console.log("todo", todo.todo_name);
    const existingTodo = await todoRepositories.getTodoById(id);
    if (!existingTodo) {
        throw new Error('Todo not found');
    }
    return await todoRepositories.updateTodo(id, todo);
}