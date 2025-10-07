

import * as todoRepositories from '../repositories/todo.repository'
import { NewTodo, UpdateTodo } from '../Types/todo.type';

export const listTodos = async () => await todoRepositories.getAllTodos();
export const getTodo = async (id: number) => {
    // bad request
    if (isNaN(id)) {
        throw new Error('Inavlid todoid')
    }
    const existingtodo = await todoRepositories.getTodoById(id)
    if (!existingtodo) {
        throw new Error('Todo not found')
    }
    return existingtodo;
}


export const createTodo = async (todo: NewTodo) => await todoRepositories.createTodo(todo);
// export const deleteTodo = async (id: number) => await todoRepositories.deleteTodo(id);
export const deletTodo = async (id: number) => {
    // bad request
    if (isNaN(id)) {
        throw new Error('Inavlid todoid')
    }
    const existingtodo = await todoRepositories.getTodoById(id)
    if (!existingtodo) {
        throw new Error('Todo not found')
    }
    return await todoRepositories.deleteTodo(id)
}

//export const updateTodo = async (id: number, todo: any) => await todoRepositories.updateTodo(id, todo);
export const updateTodo = async (id: number, todo: UpdateTodo) => {
    // bad request
    if (isNaN(id)) {
        throw new Error('Inavlid todoid')
    }
    const existingtodo = await todoRepositories.getTodoById(id)
    if (!existingtodo) {
        throw new Error('Todo not found')
    }
    return await todoRepositories.updateTodo(id, todo)

}