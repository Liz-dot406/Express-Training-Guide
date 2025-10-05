

import * as todoRepositories from '../repositories/todo.repository'

export const listTodos = async() => await todoRepositories.getAllTodos();
export const getTodo = async (id: number) => await todoRepositories.getTodoById(id);
export const createTodo = async (todo: any) => await todoRepositories.createTodo(todo);
export const deleteTodo = async (id: number) => await todoRepositories.deleteTodo(id);
export const updateTodo = async (id: number, todo: any) => await todoRepositories.updateTodo(id, todo);